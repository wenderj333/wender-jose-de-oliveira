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

module.exports = { setupWebSocket };
