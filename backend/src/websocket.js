const { WebSocketServer } = require('ws');
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
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.text)}&langpair=${msg.sourceLang}|${msg.targetLang}`;
                const resp = await fetch(url);
                const data = await resp.json();
                if (data.responseData && data.responseData.translatedText) {
                  translated = data.responseData.translatedText;
                }
              } catch (e) { console.error('Translation error:', e); }
            }
            const chatDb = require('./db/connection');
            await chatDb.prepare(
              'INSERT INTO chat_messages (room_id, sender_role, sender_name, original_text, translated_text, original_lang, target_lang) VALUES (?, ?, ?, ?, ?, ?, ?)'
            ).run(msg.roomId, msg.role, msg.name, msg.text, translated, msg.sourceLang, msg.targetLang);
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

module.exports = { setupWebSocket };
