const { WebSocketServer } = require('ws');
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateWithClaude(text, sourceLang, targetLang) {
  const langNames = { pt: 'Portuguese', en: 'English', de: 'German', fr: 'French', es: 'Spanish', ro: 'Romanian', ru: 'Russian', it: 'Italian', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 300,
      messages: [{ role: 'user', content: 'Translate from ' + (langNames[sourceLang]||sourceLang) + ' to ' + (langNames[targetLang]||targetLang) + '. Return ONLY the translation:\n\n' + text }]
    });
    return msg.content[0].text;
  } catch(e) { console.error('Translation error:', e); return text; }
}
const PastorSession = require('./models/PastorSession');

const clients = new Map(); // ws -> { userId, churchId }
const liveStreams = new Map(); // streamId -> { id, broadcasterId, broadcasterName, broadcasterWs, viewers: Map<viewerId, ws> }

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('🔌 Nova conexão WebSocket');

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data);

        switch (msg.type) {
          case 'game_create':
          case 'game_join':
          case 'game_ready':
          case 'game_start':
          case 'game_answer':
          case 'game_chat':
          case 'game_end':
            handleGame(ws, msg);
            break;
          case 'game_create':
          case 'game_join':
          case 'game_ready':
          case 'game_start':
          case 'game_answer':
          case 'game_chat':
          case 'game_end':
            handleGame(ws, msg);
            break;
          case 'game_queue':
          case 'game_cancel_queue':
            handleGameQueue(ws, msg);
            break;
          case 'identify':
            clients.set(ws, { userId: msg.userId, churchId: msg.churchId });
            // Send current live sessions
            const liveSessions = await PastorSession.getLiveSessions();
            const liveCount = await PastorSession.getLiveCount();
            ws.send(JSON.stringify({
              type: 'live_sessions',
              sessions: liveSessions,
              totalChurchesPraying: liveCount,
            }));
            break;

          case 'pastor_start_praying':
            const session = await PastorSession.startSession(
              msg.pastorId,
              msg.churchId,
              msg.prayerFocus || ''
            );
            // Broadcast to all clients
            broadcast(wss, {
              type: 'pastor_praying',
              action: 'started',
              session: {
                id: session.id,
                churchName: msg.churchName,
                pastorName: msg.pastorName,
                prayerFocus: msg.prayerFocus,
                startedAt: session.started_at,
              },
              totalChurchesPraying: await PastorSession.getLiveCount(),
            });
            break;

          case 'pastor_stop_praying':
            await PastorSession.endSession(msg.sessionId);
            broadcast(wss, {
              type: 'pastor_praying',
              action: 'stopped',
              sessionId: msg.sessionId,
              totalChurchesPraying: await PastorSession.getLiveCount(),
            });
            break;

          case 'prayer_sent':
            // Real-time prayer interaction
            broadcast(wss, {
              type: 'new_prayer_response',
              prayerId: msg.prayerId,
              userName: msg.userName,
              churchName: msg.churchName,
            });
            break;

          case 'amem':
            broadcast(wss, {
              type: 'amem',
              prayerId: msg.prayerId,
              userName: msg.userName,
            });
            break;

          // ===== LIVE STREAMING (WebRTC signaling) =====
          case 'live_list': {
            const streamsList = [];
            for (const [id, s] of liveStreams) {
              streamsList.push({ streamId: id, userName: s.broadcasterName, userAvatar: s.broadcasterAvatar || null, viewerCount: s.viewers.size });
            }
            ws.send(JSON.stringify({ type: 'live_streams_list', streams: streamsList }));
            break;
          }

          case 'live_start': {
            const stream = {
              id: msg.streamId,
              broadcasterId: msg.broadcasterId,
              broadcasterName: msg.broadcasterName,
              broadcasterAvatar: msg.broadcasterAvatar || null,
              broadcasterWs: ws,
              viewers: new Map(),
            };
            liveStreams.set(msg.streamId, stream);
            const clientInfo = clients.get(ws) || {};
            clientInfo.liveStreamId = msg.streamId;
            clientInfo.liveRole = 'broadcaster';
            clients.set(ws, clientInfo);
            broadcast(wss, {
              type: 'live_started',
              streamId: msg.streamId,
              userName: msg.broadcasterName,
              userAvatar: msg.broadcasterAvatar || null,
              viewerCount: 0,
              stream: { id: msg.streamId, broadcasterId: msg.broadcasterId, broadcasterName: msg.broadcasterName, viewers: 0 },
            });
            break;
          }

          case 'live_stop': {
            const stream = liveStreams.get(msg.streamId);
            if (stream) {
              // Notify all viewers
              for (const [vid, vws] of stream.viewers) {
                try { vws.send(JSON.stringify({ type: 'live_stopped', streamId: msg.streamId })); } catch(e) {}
              }
              liveStreams.delete(msg.streamId);
            }
            broadcast(wss, { type: 'live_stopped', streamId: msg.streamId });
            break;
          }

          case 'live_join': {
            const stream = liveStreams.get(msg.streamId);
            if (!stream) { ws.send(JSON.stringify({ type: 'live_stopped', streamId: msg.streamId })); break; }
            if (stream.viewers.size >= 10) { ws.send(JSON.stringify({ type: 'live_error', error: 'Stream cheio (máx. 10 espectadores)' })); break; }
            stream.viewers.set(msg.viewerId, ws);
            const ci2 = clients.get(ws) || {};
            ci2.liveStreamId = msg.streamId;
            ci2.liveRole = 'viewer';
            ci2.liveViewerId = msg.viewerId;
            clients.set(ws, ci2);
            // Broadcast updated viewer count
            broadcastToStream(wss, msg.streamId, { type: 'live_viewer_count', streamId: msg.streamId, count: stream.viewers.size });
            break;
          }

          case 'live_leave': {
            const stream = liveStreams.get(msg.streamId);
            if (stream) {
              stream.viewers.delete(msg.viewerId);
              // Notify broadcaster
              if (stream.broadcasterWs?.readyState === 1) {
                stream.broadcasterWs.send(JSON.stringify({ type: 'live_viewer_left', viewerId: msg.viewerId, streamId: msg.streamId }));
              }
              broadcastToStream(wss, msg.streamId, { type: 'live_viewer_count', streamId: msg.streamId, count: stream.viewers.size });
            }
            break;
          }

          case 'live_offer': {
            // Viewer sends offer -> forward to broadcaster
            const stream = liveStreams.get(msg.streamId);
            if (stream?.broadcasterWs?.readyState === 1) {
              stream.broadcasterWs.send(JSON.stringify({ type: 'live_offer', streamId: msg.streamId, viewerId: msg.viewerId, offer: msg.offer }));
            }
            break;
          }

          case 'live_answer': {
            // Broadcaster sends answer -> forward to viewer
            const stream = liveStreams.get(msg.streamId);
            if (stream) {
              const viewerWs = stream.viewers.get(msg.targetId);
              if (viewerWs?.readyState === 1) {
                viewerWs.send(JSON.stringify({ type: 'live_answer', streamId: msg.streamId, answer: msg.answer }));
              }
            }
            break;
          }

          case 'live_ice_candidate': {
            const stream = liveStreams.get(msg.streamId);
            if (stream) {
              // Forward ICE candidate to target
              let targetWs;
              if (msg.targetId === stream.broadcasterId) {
                targetWs = stream.broadcasterWs;
              } else {
                targetWs = stream.viewers.get(msg.targetId);
              }
              if (targetWs?.readyState === 1) {
                const fromInfo = clients.get(ws) || {};
                targetWs.send(JSON.stringify({ type: 'live_ice_candidate', streamId: msg.streamId, candidate: msg.candidate, fromId: fromInfo.liveViewerId || stream.broadcasterId }));
              }
            }
            break;
          }

          case 'live_chat_message': {
            // Community live chat broadcast
            const communityChat = { type: 'live_chat_broadcast', userId: msg.userId, userName: msg.userName, userAvatar: msg.userAvatar, text: msg.text, time: new Date().toISOString() };
            broadcast(wss, communityChat);
            break;
          }
          case 'live_chat': {
            const chatData = { type: 'live_chat_message', streamId: msg.streamId, name: msg.name, text: msg.text, time: new Date().toISOString() };
            broadcastToStream(wss, msg.streamId, chatData, ws);
            break;
          }

          case 'live_reaction': {
            broadcastToStream(wss, msg.streamId, { type: 'live_reaction', streamId: msg.streamId, emoji: msg.emoji, name: msg.name }, ws);
            break;
          }

          case 'chat_join_room': {
            const clientInfo = clients.get(ws) || {};
            clientInfo.chatRoomId = msg.roomId;
            clientInfo.chatRole = msg.role;
            clientInfo.chatName = msg.name;
            clientInfo.chatLang = msg.language;
            clients.set(ws, clientInfo);
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_user_joined',
              roomId: msg.roomId,
              role: msg.role,
              name: msg.name,
            }, ws);
            break;
          }

          case 'chat_message': {
            let translated = msg.text;
            if (msg.targetLang && msg.sourceLang && msg.targetLang !== msg.sourceLang) {
              try {
                translated = await translateWithClaude(msg.text, msg.sourceLang, msg.targetLang);
              } catch (e) { console.error('Translation error:', e); }
            }
            const chatDb = require('./db/connection');
            await chatDb.query(
              'INSERT INTO chat_messages (room_id, sender_role, sender_name, original_text, translated_text, original_lang, target_lang) VALUES ($1,$2,$3,$4,$5,$6,$7)',
              [msg.roomId, msg.role, msg.name, msg.text, translated, msg.sourceLang, msg.targetLang]);
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_new_message',
              roomId: msg.roomId,
              role: msg.role,
              name: msg.name,
              originalText: msg.text,
              translatedText: translated,
              sourceLang: msg.sourceLang,
              timestamp: new Date().toISOString(),
            });
            break;
          }

          case 'chat_typing':
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_typing',
              roomId: msg.roomId,
              role: msg.role,
              name: msg.name,
            }, ws);
            break;

          case 'chat_leave_room': {
            const ci = clients.get(ws) || {};
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_user_left',
              roomId: msg.roomId,
              role: ci.chatRole,
              name: ci.chatName,
            }, ws);
            ci.chatRoomId = null;
            clients.set(ws, ci);
            break;
          }

          // ===== LIVE COMMUNITY CHAT =====

          case 'live_join': {
            broadcast(wss, {
              type: 'live_user_joined',
              userId: msg.userId,
              userName: msg.userName,
              userAvatar: msg.userAvatar,
            });
            break;
          }

          case 'live_leave': {
            broadcast(wss, {
              type: 'live_user_left',
              userId: msg.userId,
            });
            break;
          }
        }
      } catch (err) {
        console.error('Erro no WebSocket:', err);
      }
    });

    ws.on('close', () => {
      // Cleanup live streams
      const info = clients.get(ws);
      if (info?.liveStreamId) {
        const stream = liveStreams.get(info.liveStreamId);
        if (stream) {
          if (info.liveRole === 'broadcaster') {
            // End stream
            for (const [vid, vws] of stream.viewers) {
              try { vws.send(JSON.stringify({ type: 'live_stopped', streamId: info.liveStreamId })); } catch(e) {}
            }
            liveStreams.delete(info.liveStreamId);
            broadcast(wss, { type: 'live_stopped', streamId: info.liveStreamId });
          } else if (info.liveRole === 'viewer') {
            stream.viewers.delete(info.liveViewerId);
            if (stream.broadcasterWs?.readyState === 1) {
              stream.broadcasterWs.send(JSON.stringify({ type: 'live_viewer_left', viewerId: info.liveViewerId, streamId: info.liveStreamId }));
            }
            broadcastToStream(wss, info.liveStreamId, { type: 'live_viewer_count', streamId: info.liveStreamId, count: stream.viewers.size });
          }
        }
      }
      clients.delete(ws);
    });
  });

  return wss; // returned to server.js
}

function broadcast(wss, data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function broadcastToRoom(wss, clients, roomId, data, excludeWs) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client !== excludeWs) {
      const info = clients.get(client);
      if (info && info.chatRoomId === roomId) {
        client.send(message);
      }
    }
  });
}

function broadcastToStream(wss, streamId, data, excludeWs) {
  const stream = liveStreams.get(streamId);
  if (!stream) return;
  const message = JSON.stringify(data);
  // Send to broadcaster
  if (stream.broadcasterWs?.readyState === 1 && stream.broadcasterWs !== excludeWs) {
    stream.broadcasterWs.send(message);
  }
  // Send to all viewers
  for (const [vid, vws] of stream.viewers) {
    if (vws.readyState === 1 && vws !== excludeWs) {
      vws.send(message);
    }
  }
}


const gameRooms = new Map();

function handleGame(ws, msg) {
  const client = clients.get(ws);
  const userId = client?.userId || msg.userId;
  const userName = msg.userName || 'Jogador';

  if (msg.type === 'game_create') {
    const roomId = msg.roomId;
    gameRooms.set(roomId, {
      id: roomId,
      livro: msg.livro || 'Todos',
      jogadores: [{ userId, userName, avatar: msg.avatar, pontos: 0, pronto: false, ws }],
      iniciado: false,
      perguntaIdx: 0,
    });
    ws.send(JSON.stringify({ type: 'game_joined', roomId, jogadores: gameRooms.get(roomId).jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto })) }));
  }

  else if (msg.type === 'game_join') {
    const roomId = msg.roomId;
    const room = gameRooms.get(roomId);
    if (!room) { ws.send(JSON.stringify({ type: 'game_error', message: 'Sala nao encontrada' })); return; }
    if (room.iniciado) { ws.send(JSON.stringify({ type: 'game_error', message: 'Jogo ja iniciado' })); return; }
    room.jogadores.push({ userId, userName, avatar: msg.avatar, pontos: 0, pronto: false, ws });
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_joined', roomId, jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_ready') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (j) j.pronto = true;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_update', jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_start') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.iniciado = true;
    room.perguntaIdx = 0;
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_started', livro: room.livro })); });
  }

  else if (msg.type === 'game_answer') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (j) j.pontos += msg.pontos || 0;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_score', jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_chat') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_chat_msg', userName, texto: msg.texto })); });
  }

  else if (msg.type === 'game_end') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_finished', jogadores: jogadoresPublico })); });
    gameRooms.delete(msg.roomId);
  }
}




function handleGame(ws, msg) {
  const client = clients.get(ws);
  const userId = client?.userId || msg.userId;
  const userName = msg.userName || 'Jogador';

  if (msg.type === 'game_create') {
    const roomId = msg.roomId;
    gameRooms.set(roomId, {
      id: roomId,
      livro: msg.livro || 'Todos',
      jogadores: [{ userId, userName, avatar: msg.avatar, pontos: 0, pronto: false, ws }],
      iniciado: false,
      perguntaIdx: 0,
    });
    ws.send(JSON.stringify({ type: 'game_joined', roomId, jogadores: gameRooms.get(roomId).jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto })) }));
  }

  else if (msg.type === 'game_join') {
    const roomId = msg.roomId;
    const room = gameRooms.get(roomId);
    if (!room) { ws.send(JSON.stringify({ type: 'game_error', message: 'Sala nao encontrada' })); return; }
    if (room.iniciado) { ws.send(JSON.stringify({ type: 'game_error', message: 'Jogo ja iniciado' })); return; }
    room.jogadores.push({ userId, userName, avatar: msg.avatar, pontos: 0, pronto: false, ws });
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_joined', roomId, jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_ready') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (j) j.pronto = true;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_update', jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_start') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.iniciado = true;
    room.perguntaIdx = 0;
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_started', livro: room.livro })); });
  }

  else if (msg.type === 'game_answer') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (j) j.pontos += msg.pontos || 0;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_score', jogadores: jogadoresPublico })); });
  }

  else if (msg.type === 'game_chat') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_chat_msg', userName, texto: msg.texto })); });
  }

  else if (msg.type === 'game_end') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_finished', jogadores: jogadoresPublico })); });
    gameRooms.delete(msg.roomId);
  }
}


const gameQueue = [];

function handleGameQueue(ws, msg) {
  const userId = msg.userId;
  const userName = msg.userName || 'Jogador';
  const avatar = msg.avatar || '';
  const livro = msg.livro || 'Todos';

  if (msg.type === 'game_queue') {
    // Procurar alguem na fila
    const idx = gameQueue.findIndex(p => p.userId !== userId);
    if (idx !== -1) {
      const outro = gameQueue.splice(idx, 1)[0];
      const roomId = Math.random().toString(36).substring(2,8).toUpperCase();
      const matchMsg = JSON.stringify({ type: 'game_matched', roomId, livro });
      if (outro.ws.readyState === 1) outro.ws.send(matchMsg);
      if (ws.readyState === 1) ws.send(matchMsg);
    } else {
      gameQueue.push({ userId, userName, avatar, livro, ws });
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'game_queued' }));
    }
  }

  if (msg.type === 'game_cancel_queue') {
    const idx = gameQueue.findIndex(p => p.userId === userId);
    if (idx !== -1) gameQueue.splice(idx, 1);
  }
}
module.exports = { setupWebSocket };
