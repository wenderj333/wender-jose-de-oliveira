const { WebSocketServer } = require('ws');
const Anthropic = require('@anthropic-ai/sdk');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const db = require('./db/connection');
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
const privateCalls = new Map();

// Used by HTTP routes (such as direct messages) to notify a logged-in user
// immediately, without waiting for the next polling request.
function notifyUser(userId, payload) {
  if (!userId) return;
  const message = JSON.stringify(payload);
  for (const [ws, client] of clients.entries()) {
    if (client?.userId === userId && ws.readyState === 1) {
      try { ws.send(message); } catch (_) {}
    }
  }
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  // Ping para manter conexoes activas
  setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.readyState === 1) ws.ping();
    });
  }, 25000);

  wss.on('connection', (ws) => {
    console.log('Nova conexão WebSocket');

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data);

        console.log("MSG_TIPO:", msg.type, "USER:", msg.userId); switch (msg.type) {
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
          case 'game_lobby_join':
          case 'game_lobby_leave':
          case 'game_lobby_chat':
          case 'game_invite':
          case 'game_invite_accept':
          case 'game_invite_decline':
            handleDuelLobby(ws, msg);
            break;
          case 'identify':
            try {
              const decoded = jwt.verify(msg.token, JWT_SECRET);
              if (decoded.id !== msg.userId) throw new Error('user mismatch');
              // Keep the room selected while the identity is validated. Without
              // this merge, an early `live_join` could be erased and the user
              // would appear as offline to everyone else in the room.
              clients.set(ws, { ...(clients.get(ws) || {}), userId: decoded.id, churchId: msg.churchId });
            } catch (_) { ws.close(1008, 'authentication required'); break; }
            // Send current live sessions
            const liveSessions = await PastorSession.getLiveSessions();
            const liveCount = await PastorSession.getLiveCount();
            ws.send(JSON.stringify({
              type: 'live_sessions',
              sessions: liveSessions,
              totalChurchesPraying: liveCount,
            }));
            break;

          case 'call_request': {
            const caller = clients.get(ws);
            if (!caller?.userId || !msg.targetUserId || !['audio', 'video'].includes(msg.mode)) break;
            const target = [...clients.entries()].find(([, info]) => info?.userId === msg.targetUserId)?.[0];
            if (!target || target.readyState !== 1) { ws.send(JSON.stringify({ type: 'call_unavailable', callId: msg.callId })); break; }
            privateCalls.set(msg.callId, { callerId: caller.userId, receiverId: msg.targetUserId, mode: msg.mode });
            target.send(JSON.stringify({ type: 'call_incoming', callId: msg.callId, callerId: caller.userId, callerName: msg.callerName, callerAvatar: msg.callerAvatar || null, mode: msg.mode }));
            break;
          }
          case 'call_response': {
            const call = privateCalls.get(msg.callId); const responder = clients.get(ws);
            if (!call || responder?.userId !== call.receiverId) break;
            const callerWs = [...clients.entries()].find(([, info]) => info?.userId === call.callerId)?.[0];
            if (callerWs?.readyState === 1) callerWs.send(JSON.stringify({ type: msg.accepted ? 'call_accepted' : 'call_declined', callId: msg.callId, mode: call.mode }));
            if (!msg.accepted) privateCalls.delete(msg.callId);
            break;
          }
          case 'call_signal': {
            const call = privateCalls.get(msg.callId); const sender = clients.get(ws);
            if (!call || !sender?.userId || ![call.callerId, call.receiverId].includes(sender.userId)) break;
            const recipientId = sender.userId === call.callerId ? call.receiverId : call.callerId;
            const recipient = [...clients.entries()].find(([, info]) => info?.userId === recipientId)?.[0];
            if (recipient?.readyState === 1) recipient.send(JSON.stringify({ type: 'call_signal', callId: msg.callId, signal: msg.signal }));
            break;
          }
          case 'call_end': {
            const call = privateCalls.get(msg.callId); const sender = clients.get(ws);
            if (!call || !sender?.userId || ![call.callerId, call.receiverId].includes(sender.userId)) break;
            const recipientId = sender.userId === call.callerId ? call.receiverId : call.callerId;
            const recipient = [...clients.entries()].find(([, info]) => info?.userId === recipientId)?.[0];
            if (recipient?.readyState === 1) recipient.send(JSON.stringify({ type: 'call_ended', callId: msg.callId }));
            privateCalls.delete(msg.callId);
            break;
          }

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
                pastorId: msg.pastorId,
                churchId: msg.churchId,
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
            if (stream.viewers.size >= 10) { ws.send(JSON.stringify({ type: 'live_error', error: 'Transmissão cheia (máx. 10 espectadores)' })); break; }
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
            // Community chat messages are only delivered inside the chosen room.
            const clientInfo = clients.get(ws) || {};
            const roomId = String(msg.roomId || clientInfo.liveCommunityRoom || 'pt');
            const communityChat = { type: 'live_chat_broadcast', roomId, userId: msg.userId, userName: msg.userName, userAvatar: msg.userAvatar, text: msg.text, id: Date.now().toString(), time: new Date().toISOString() };
            broadcastToCommunityRoom(clients, roomId, communityChat);
            break;
          }
          case 'live_chat': {
            const chatData = { type: 'live_chat_message', streamId: msg.streamId, name: msg.name, text: msg.text, id: Date.now().toString(), time: new Date().toISOString() };
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
            const clientInfo = clients.get(ws) || {};
            clientInfo.liveCommunityRoom = String(msg.roomId || 'pt');
            clients.set(ws, clientInfo);
            broadcastCommunityPresence(clients, clientInfo.liveCommunityRoom);
            break;
          }

          case 'live_leave': {
            const clientInfo = clients.get(ws) || {};
            const roomId = clientInfo.liveCommunityRoom || String(msg.roomId || 'pt');
            clientInfo.liveCommunityRoom = null;
            clients.set(ws, clientInfo);
            broadcastCommunityPresence(clients, roomId);
            break;
          }
        }
      } catch (err) {
        console.error('Erro no WebSocket:', err);
      }
    });

    ws.on('close', () => {
      removeDuelLobbyPlayer(ws);
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

function broadcastToCommunityRoom(clients, roomId, data) {
  const message = JSON.stringify(data);
  for (const [ws, client] of clients.entries()) {
    if (client?.liveCommunityRoom === roomId && ws.readyState === 1) {
      try { ws.send(message); } catch (_) {}
    }
  }
}

function broadcastCommunityPresence(clients, roomId) {
  let onlineCount = 0;
  for (const [, client] of clients.entries()) if (client?.liveCommunityRoom === roomId) onlineCount += 1;
  broadcastToCommunityRoom(clients, roomId, { type: 'live_room_presence', roomId, onlineCount });
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

const duelLobbyPlayers = new Map();

function lobbyPlayersPayload() {
  return [...duelLobbyPlayers.values()].map(({ userId, userName, avatar, status }) => ({ userId, userName, avatar, status: status || 'available' }));
}

function broadcastDuelLobby() {
  const message = JSON.stringify({ type: 'game_lobby_players', players: lobbyPlayersPayload() });
  duelLobbyPlayers.forEach(player => {
    if (player.ws?.readyState === 1) player.ws.send(message);
  });
}

function setLobbyStatus(userId, status) {
  const player = duelLobbyPlayers.get(userId);
  if (player) player.status = status;
}

function removeDuelLobbyPlayer(ws) {
  let changed = false;
  for (const [userId, player] of duelLobbyPlayers.entries()) {
    if (player.ws === ws) {
      duelLobbyPlayers.delete(userId);
      changed = true;
    }
  }
  if (changed) broadcastDuelLobby();
}

function questionsForDuel(livro = 'Todos', nivel = 0) {
  const all = require('./data/perguntas.json');
  let pool = all.filter(question => livro === 'Todos' || question.livro === livro);
  if (!pool.length) pool = all;
  const shuffle = list => [...list].sort(() => Math.random() - 0.5);
  let selected;
  if (nivel <= 4) selected = shuffle(pool.filter(question => question.nivel === 'facil'));
  else if (nivel <= 9) selected = shuffle(pool.filter(question => question.nivel === 'medio'));
  else selected = shuffle(pool.filter(question => question.nivel === 'dificil'));
  if (selected.length < 10) selected = [...selected, ...shuffle(pool)];
  return selected.slice(0, 10);
}

function startDirectDuel(first, second) {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const perguntas = questionsForDuel();
  const jogadores = [first, second].map(player => ({ ...player, pontos: 0, respondeu: false }));
  gameRooms.set(roomId, { id: roomId, livro: 'Todos', perguntas, iniciado: true, perguntaIdx: 0, jogadores });
  setLobbyStatus(first.userId, 'playing');
  setLobbyStatus(second.userId, 'playing');
  broadcastDuelLobby();
  jogadores.forEach(player => {
    const adversario = jogadores.find(other => other.userId !== player.userId);
    if (player.ws?.readyState === 1) player.ws.send(JSON.stringify({
      type: 'game_matched', roomId, perguntas,
      adversario: { userId: adversario.userId, userName: adversario.userName, avatar: adversario.avatar },
    }));
  });
  agendarPergunta(roomId);
}

function handleDuelLobby(ws, msg) {
  const userId = String(msg.userId || '').trim();
  if (!userId) return;

  if (msg.type === 'game_lobby_join') {
    duelLobbyPlayers.set(userId, {
      userId,
      userName: String(msg.userName || 'Jogador').trim().slice(0, 60),
      avatar: String(msg.avatar || '').slice(0, 2000),
      status: duelLobbyPlayers.get(userId)?.status || 'available',
      ws,
    });
    broadcastDuelLobby();
    return;
  }

  if (msg.type === 'game_lobby_leave') {
    if (duelLobbyPlayers.get(userId)?.ws === ws) {
      duelLobbyPlayers.delete(userId);
      broadcastDuelLobby();
    }
    return;
  }

  const sender = duelLobbyPlayers.get(userId);
  if (!sender || sender.ws !== ws) return;

  if (msg.type === 'game_lobby_chat') {
    const text = String(msg.text || '').trim().slice(0, 300);
    if (!text) return;
    const data = JSON.stringify({ type: 'game_lobby_chat', message: { id: `${Date.now()}-${userId}`, userId, userName: sender.userName, text } });
    duelLobbyPlayers.forEach(player => { if (player.ws?.readyState === 1) player.ws.send(data); });
    return;
  }

  if (msg.type === 'game_invite') {
    const target = duelLobbyPlayers.get(String(msg.targetUserId || ''));
    if (!target || target.userId === userId || target.status === 'playing' || sender.status === 'playing') {
      ws.send(JSON.stringify({ type: 'game_error', message: 'Este jogador não está disponível agora.' }));
      return;
    }
    if (target.ws?.readyState === 1) target.ws.send(JSON.stringify({ type: 'game_invite_received', from: { userId: sender.userId, userName: sender.userName, avatar: sender.avatar } }));
    ws.send(JSON.stringify({ type: 'game_invite_sent', targetUserId: target.userId }));
    return;
  }

  if (msg.type === 'game_invite_accept') {
    const inviter = duelLobbyPlayers.get(String(msg.fromUserId || ''));
    if (!inviter || inviter.status === 'playing' || sender.status === 'playing') {
      ws.send(JSON.stringify({ type: 'game_error', message: 'O convite já não está disponível.' }));
      return;
    }
    startDirectDuel(inviter, sender);
    return;
  }

  if (msg.type === 'game_invite_decline') {
    const inviter = duelLobbyPlayers.get(String(msg.fromUserId || ''));
    if (inviter?.ws?.readyState === 1) inviter.ws.send(JSON.stringify({ type: 'game_invite_declined', userName: sender.userName }));
  }
}

const gameRooms = new Map();

function jogadoresPublicos(room) {
  return room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos }));
}

function terminarPartida(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;
  if (room.roundTimer) clearTimeout(room.roundTimer);
  if (room.roundInterval) clearInterval(room.roundInterval);
  const jogadores = jogadoresPublicos(room);
  const vencedor = jogadores.reduce((melhor, jogador) => jogador.pontos > melhor.pontos ? jogador : melhor, jogadores[0]);
  room.jogadores.forEach(j => { if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_finished', jogadores, vencedor })); });
  // Só utilizadores reais aparecem entre os 10 primeiros do ranking.
  room.jogadores.filter(j => !String(j.userId).startsWith('bot-')).forEach(async (jogador) => {
    try {
      await db.query(
        'INSERT INTO duelo_ranking (nome,pontos,foto) VALUES ($1,$2,$3) ON CONFLICT (nome) DO UPDATE SET pontos=duelo_ranking.pontos+$2, foto=COALESCE($3,duelo_ranking.foto), updated_at=NOW()',
        [jogador.userName, jogador.pontos, jogador.avatar || null],
      );
    } catch (_) {}
  });
  gameRooms.delete(roomId);
  room.jogadores.forEach(j => setLobbyStatus(j.userId, 'available'));
  broadcastDuelLobby();
}

function proximaPergunta(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;
  if (room.roundTimer) clearTimeout(room.roundTimer);
  if (room.roundInterval) clearInterval(room.roundInterval);
  room.roundTimer = null;
  room.roundInterval = null;
  room.advancing = false;
  room.jogadores.forEach(j => { j.respondeu = false; });
  room.perguntaIdx += 1;
  if (room.perguntaIdx >= (room.perguntas || []).length) {
    terminarPartida(roomId);
    return;
  }
  room.jogadores.forEach(j => { if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_next_question', idx: room.perguntaIdx })); });
  agendarPergunta(roomId);
}

function agendarPergunta(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.roundTimer) return;
  room.segundosRestantes = 15;
  const enviarTempo = () => room.jogadores.forEach(j => {
    if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_timer', seconds: room.segundosRestantes }));
  });
  enviarTempo();
  room.roundInterval = setInterval(() => {
    const atual = gameRooms.get(roomId);
    if (!atual || atual !== room || atual.advancing) return;
    atual.segundosRestantes = Math.max(0, atual.segundosRestantes - 1);
    enviarTempo();
  }, 1000);
  room.roundTimer = setTimeout(() => {
    const atual = gameRooms.get(roomId);
    if (!atual) return;
    atual.roundTimer = null;
    if (atual.roundInterval) clearInterval(atual.roundInterval);
    atual.roundInterval = null;
    proximaPergunta(roomId);
  }, 15000);
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
    // Auto iniciar quando 2 jogadores estiverem na sala
    if (room.jogadores.length >= 2) {
      room.iniciado = true;
      room.perguntaIdx = 0;
      const PALL = require('./data/perguntas.json');
      let p = PALL.filter(x => room.livro==='Todos' || x.livro===room.livro);
      if(!p.length) p = PALL;
      const f=p.filter(x=>x.nivel==='facil').sort(()=>Math.random()-0.5).slice(0,2);
      const m=p.filter(x=>x.nivel==='medio').sort(()=>Math.random()-0.5).slice(0,2);
      const d=p.filter(x=>x.nivel==='dificil').sort(()=>Math.random()-0.5).slice(0,1);
      room.perguntas = [...f,...m,...d];
      const adv1 = { userId: room.jogadores[0].userId, userName: room.jogadores[0].userName, avatar: room.jogadores[0].avatar, pontos: 0 };
      const adv2 = { userId: room.jogadores[1].userId, userName: room.jogadores[1].userName, avatar: room.jogadores[1].avatar, pontos: 0 };
      setTimeout(() => {
        if (room.jogadores[0].ws.readyState === 1) room.jogadores[0].ws.send(JSON.stringify({ type: 'game_matched', roomId: roomId, perguntas: room.perguntas, adversario: adv2 }));
        if (room.jogadores[1].ws.readyState === 1) room.jogadores[1].ws.send(JSON.stringify({ type: 'game_matched', roomId: roomId, perguntas: room.perguntas, adversario: adv1 }));
      }, 1000);
    }
  }

  else if (msg.type === 'game_ready') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (j) j.pronto = true;
    const todosprontos = room.jogadores.every(j => j.pronto);
    const jogadoresPublico = room.jogadores.map(j => ({ userId: j.userId, userName: j.userName, avatar: j.avatar, pontos: j.pontos, pronto: j.pronto }));
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_update', jogadores: jogadoresPublico })); });
    if (todosprontos) {
      room.jogadores.forEach(j => { if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_started', livro: room.livro, perguntas: room.perguntas })); });
      agendarPergunta(room.id);
    }
  }

  else if (msg.type === 'start_game') {
    const roomId2 = [...gameRooms.entries()].find(([,r]) => r.jogadores.some(j => j.ws === ws))?.[0];
    const room2 = gameRooms.get(roomId2);
    if (room2 && msg.perguntas) {
      room2.perguntas = msg.perguntas;
      room2.jogadores.forEach(j => { if (j.ws !== ws && j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'start_game', perguntas: msg.perguntas })); });
    }
  }
  else if (msg.type === 'avancar') {
    const roomId3 = [...gameRooms.entries()].find(([,r]) => r.jogadores.some(j => j.ws === ws))?.[0];
    const room3 = gameRooms.get(roomId3);
    if (room3) { room3.jogadores.forEach(j => { if (j.ws !== ws && j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'avancar', idx: msg.idx })); }); }
  }
  else if (msg.type === 'resultado') {
    const roomId4 = [...gameRooms.entries()].find(([,r]) => r.jogadores.some(j => j.ws === ws))?.[0];
    const room4 = gameRooms.get(roomId4);
    if (room4) { const jj = room4.jogadores.find(j => j.ws === ws); if (jj) jj.pontos = msg.pontos; room4.jogadores.forEach(j => { if (j.ws !== ws && j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'adversario_resultado', pontos: msg.pontos })); }); }
  }
  else if (msg.type === 'game_start') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.iniciado = true;
    room.perguntaIdx = 0;
    const PALL = require('./data/perguntas.json');
    let p = PALL.filter(x => room.livro==='Todos' || x.livro===room.livro);
    if(!p.length) p = PALL;
    const f=p.filter(x=>x.nivel==='facil').sort(()=>Math.random()-0.5).slice(0,2);
    const m=p.filter(x=>x.nivel==='medio').sort(()=>Math.random()-0.5).slice(0,2);
    const d=p.filter(x=>x.nivel==='dificil').sort(()=>Math.random()-0.5).slice(0,1);
    room.perguntas = [...f,...m,...d];
    room.jogadores.forEach(j => { if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_started', livro: room.livro, perguntas: room.perguntas })); });
      agendarPergunta(room.id);
  }

  else if (msg.type === 'game_answer') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    const j = room.jogadores.find(j => j.userId === userId);
    if (!j || j.respondeu) return;
    const question = room.perguntas?.[room.perguntaIdx];
    const choice = Number(msg.choice);
    const pontosAntigos = Number(msg.pontos) || 0;
    // Clientes novos enviam a opção escolhida; o servidor valida a resposta.
    // Mantemos a compatibilidade com clientes antigos, limitando a pontuação.
    const acertou = Number.isInteger(choice) ? choice === question?.r : pontosAntigos > 0;
    j.pontos += acertou ? 3 : Math.max(0, Math.min(3, pontosAntigos));
    j.respondeu = true;
    const jogadores = jogadoresPublicos(room);
    room.jogadores.forEach(player => { if (player.ws?.readyState === 1) player.ws.send(JSON.stringify({ type: 'game_score', jogadores })); });
    const todosResponderam = room.jogadores.every(player => player.respondeu) || room.jogadores.length === 1;
    // Quem acerta primeiro ganha a ronda: a próxima pergunta chega para os dois.
    if ((acertou || todosResponderam) && !room.advancing) {
      room.advancing = true;
      setTimeout(() => proximaPergunta(msg.roomId), 700);
    }
  }

  else if (msg.type === 'game_chat') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    room.jogadores.forEach(j => { if (j.ws.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_chat_msg', userName, texto: msg.texto })); });
  }

  else if (msg.type === 'game_end') {
    const room = gameRooms.get(msg.roomId);
    if (!room) return;
    terminarPartida(msg.roomId);
  }
}







const gameQueue = [];

function handleGameQueue(ws, msg) {
  const userId = msg.userId;
  const userName = msg.userName || 'Jogador';
  const avatar = msg.avatar || '';
  const livro = msg.livro || 'Todos';

  if (msg.type === 'game_queue') {
    console.log('🎮 GAME_QUEUE:', userId, livro, 'fila:', gameQueue.length);
    console.log('🎮 Jogadores na fila:', gameQueue.map(p => p.userId + ' ws:' + p.ws.readyState));
    setLobbyStatus(userId, 'waiting');
    broadcastDuelLobby();
    // Limpeza: remove jogadores mortos ou duplicados
    for (let i = gameQueue.length - 1; i >= 0; i--) {
      if (gameQueue[i].userId === userId || gameQueue[i].ws.readyState !== 1) {
        gameQueue.splice(i, 1);
      }
    }
    // Procurar alguem na fila (qualquer livro)
    const idx = gameQueue.findIndex(p => p.userId !== userId && p.ws.readyState === 1);
    if (idx !== -1) {
      const outro = gameQueue.splice(idx, 1)[0];
      const roomId = Math.random().toString(36).substring(2,8).toUpperCase();
      const nivelJogo = msg.nivel || 0;
      let perguntas = [];
      try { perguntas = (() => {
        const pj = require('./data/perguntas.json');
        let p = pj.filter(x => livro === 'Todos' || x.livro === livro);
        if (!p.length) p = pj;
        const sh = a => [...a].sort(() => Math.random() - 0.5);
        // Nivel 0-4: facil, 5-9: medio, 10-13: dificil
        let pool;
        if (nivelJogo <= 4) pool = sh(p.filter(x=>x.nivel==='facil'));
        else if (nivelJogo <= 9) pool = sh(p.filter(x=>x.nivel==='medio'));
        else pool = sh(p.filter(x=>x.nivel==='dificil'));
        if (pool.length < 10) pool = [...pool, ...sh(p)];
        return pool.slice(0,10);
      })(); } catch(e) {}
      const matchMsg1 = JSON.stringify({ type: 'game_matched', roomId, livro, perguntas, adversario: { userId: msg.userId, userName: msg.userName, avatar: msg.avatar } });
      const matchMsg2 = JSON.stringify({ type: 'game_matched', roomId, livro, perguntas, adversario: { userId: outro.userId, userName: outro.userName, avatar: outro.avatar } });
      if (outro.ws.readyState === 1) outro.ws.send(matchMsg1);
      if (ws.readyState === 1) ws.send(matchMsg2);
      gameRooms.set(roomId, { id: roomId, livro, perguntas, iniciado: true, perguntaIdx: 0, jogadores: [{ userId: outro.userId, userName: outro.userName, avatar: outro.avatar, pontos: 0, ws: outro.ws }, { userId, userName, avatar, pontos: 0, ws }] });
      setLobbyStatus(outro.userId, 'playing');
      setLobbyStatus(userId, 'playing');
      broadcastDuelLobby();
      agendarPergunta(roomId);
    } else {
      const playerEntry = { userId, userName, avatar, livro, ws };
      gameQueue.push(playerEntry);
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'game_queued' }));
      ws.on('close', () => {
        const ci = gameQueue.indexOf(playerEntry);
        if (ci !== -1) gameQueue.splice(ci, 1);
      });
      setTimeout(() => {
        const still = gameQueue.indexOf(playerEntry);
        if (still !== -1 && ws.readyState === 1) {
          gameQueue.splice(still, 1);
          const roomId = Math.random().toString(36).substring(2,8).toUpperCase();
          let perguntas = [];
          try { perguntas = (() => {
            const pj = require('./data/perguntas.json');
            let p = pj.filter(x => livro === 'Todos' || x.livro === livro);
            if (!p.length) p = pj;
            const sh = a => a.sort(() => Math.random() - 0.5);
            return [...sh(p.filter(x=>x.nivel==='facil')).slice(0,2), ...sh(p.filter(x=>x.nivel==='medio')).slice(0,2), ...sh(p.filter(x=>x.nivel==='dificil')).slice(0,1)];
          })(); } catch(e) {}
          const botPersonagens = [
            { userId: 'bot-333', userName: 'Moises', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=moises' },
            { userId: 'bot-333', userName: 'Davi', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=davi' },
            { userId: 'bot-333', userName: 'Salomao', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=salomao' },
            { userId: 'bot-333', userName: 'Paulo', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=paulo' },
            { userId: 'bot-333', userName: 'Pedro', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=pedro' },
            { userId: 'bot-333', userName: 'Elias', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=elias' },
            { userId: 'bot-333', userName: 'Daniel', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=daniel' },
            { userId: 'bot-333', userName: 'Josue', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=josue' },
            { userId: 'bot-333', userName: 'Joao', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=joao' },
            { userId: 'bot-333', userName: 'Abraao', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=abraao' },
          ];
          const botAdv = botPersonagens[Math.floor(Math.random() * botPersonagens.length)];
          ws.send(JSON.stringify({ type: 'game_matched', roomId, livro, perguntas, adversario: botAdv, isBot: true }));
          gameRooms.set(roomId, { id: roomId, livro, perguntas, iniciado: true, perguntaIdx: 0, isBot: true, jogadores: [{ userId: 'bot-333', userName: 'Pastor Bot', avatar: '', pontos: 0, ws: null }, { userId, userName, avatar, pontos: 0, ws }] });
          setLobbyStatus(userId, 'playing');
          broadcastDuelLobby();
          agendarPergunta(roomId);
        }
      }, 30000);
    }
  }

  if (msg.type === 'game_cancel_queue') {
    const idx = gameQueue.findIndex(p => p.userId === userId);
    if (idx !== -1) gameQueue.splice(idx, 1);
    setLobbyStatus(userId, 'available');
    broadcastDuelLobby();
  }
}
module.exports = { setupWebSocket, notifyUser };

// clean




// nivel system
