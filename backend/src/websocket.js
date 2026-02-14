const { WebSocketServer } = require('ws');
const PastorSession = require('./models/PastorSession');

const clients = new Map(); // ws -> { userId, churchId }

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

module.exports = { setupWebSocket };
