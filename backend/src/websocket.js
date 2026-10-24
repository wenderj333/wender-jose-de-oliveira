const { WebSocketServer } = require('ws');
const Anthropic = require('@anthropic-ai/sdk');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const db = require('./db/connection');
const { sendPushNotification } = require('./services/notifications');
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

// ---- Sala de voz da Oração Mundial ----
// room -> Map<userId, { ws, name, avatar, speaking, role }>
const prayerVoiceRooms = new Map();
const prayerVoiceVotes = new Map(); // targetUserId -> Set<voterId>
const prayerVoiceBlocked = new Map(); // userId -> blockedUntil (ms)
const PV_MAX_SPEAKERS = 1; // um de cada vez (evita eco), com fila e tempo
const PV_BLOCK_VOTES = 5;
const PV_MUTE_VOTES = 5;
const PV_MUTE_MINUTES = 15;
const prayerVoiceMuteVotes = new Map(); // room:target -> Set<voterId>
const prayerVoiceSilenced = new Map(); // userId -> silencedUntil (ms)
function pvIsSilenced(userId) {
  const until = prayerVoiceSilenced.get(userId);
  if (!until) return false;
  if (Date.now() > until) { prayerVoiceSilenced.delete(userId); return false; }
  return true;
}
const PV_LANG_ROOM_RE = /^geral-(pt|es|en|de|fr|ro|ru)$/;
const PV_ROOMS = new Set(['geral', 'saude', 'familia', 'financas', 'emprego', 'casamento', 'filhos', 'libertacao', 'paz', 'gratidao']);
function pvIsBlocked(userId) {
  const until = prayerVoiceBlocked.get(userId);
  if (!until) return false;
  if (Date.now() > until) { prayerVoiceBlocked.delete(userId); return false; }
  return true;
}
const PV_ROOM_CAP = 15; // pessoas por sala de voz; quando enche abre a Sala 2, 3, ...
const pvBase = (key) => String(key).split('#')[0];
const pvPart = (key) => { const n = parseInt(String(key).split('#')[1], 10); return n > 1 ? n : 1; };
const pvKey = (room, part) => (part > 1 ? room + '#' + part : room);
function pvFindUser(room, userId) {
  for (const [key, members] of prayerVoiceRooms) if (pvBase(key) === room && members.has(userId)) return key;
  return null;
}
function pvPickPart(room) {
  for (let part = 1; part <= 200; part++) {
    const key = pvKey(room, part);
    const members = prayerVoiceRooms.get(key);
    if (!members || members.size < PV_ROOM_CAP) return key;
  }
  return pvKey(room, 201);
}
// Tempo de cada vez conforme a fila: ninguém à espera = sem limite
// Tempo de cada pessoa (configurável por sala: 30 s a 20 min; padrão 3 min). Sem fila = sem limite.
const PV_TURN_DEFAULT = 180;
const pvTurnSettings = new Map(); // sala -> segundos
const pvRoomOwners = new Map(); // sala privada -> owner_id
db.query(`CREATE TABLE IF NOT EXISTS prayer_room_settings (room VARCHAR(20) PRIMARY KEY, turn_seconds INT NOT NULL, updated_by UUID, updated_at TIMESTAMP DEFAULT NOW())`)
  .then(() => db.query('SELECT room, turn_seconds FROM prayer_room_settings'))
  .then(r => { for (const row of r.rows || []) pvTurnSettings.set(row.room, row.turn_seconds); })
  .catch(e => console.error('prayer_room_settings', e.message));
const pvTurnSeconds = (room) => pvTurnSettings.get(pvBase(room)) || (pvBase(room).startsWith('geral-') && pvTurnSettings.get('geral')) || PV_TURN_DEFAULT;
const pvTurnMs = (waiting, room) => (waiting <= 0 ? 0 : pvTurnSeconds(room) * 1000);
const pvWaiting = (members) => [...members.values()].filter(m => m.hand && !m.speaking).length;
function pvStartLimitIfQueue(members) {
  // Alguém entrou na fila: o tempo de quem está a orar começa a contar a partir de agora
  if (!pvWaiting(members)) return;
  for (const m of members.values()) if (m.speaking && !m.limitFrom) m.limitFrom = Date.now();
}
function pvPromote(key) {
  // Abriu um lugar para falar: avisa o primeiro da fila (mão levantada)
  const members = prayerVoiceRooms.get(key);
  if (!members) return;
  const speakers = [...members.values()].filter(m => m.speaking).length;
  if (speakers >= PV_MAX_SPEAKERS) return;
  const next = [...members.entries()].filter(([, m]) => m.hand && !m.speaking).sort((a, b) => a[1].hand - b[1].hand)[0];
  if (!next || next[1].ws.readyState !== 1) return;
  const [nextId, nm] = next;
  if (nm.ready && !pvIsSilenced(nextId) && !pvIsBlocked(nextId)) {
    // Já deixou o microfone pronto ao entrar na fila: entra no ar sozinho
    nm.speaking = true; nm.hand = 0; nm.notified = false; nm.ready = false;
    nm.limitFrom = pvWaiting(members) ? Date.now() : 0;
    try { nm.ws.send(JSON.stringify({ type: 'pv_go_live' })); } catch (_) {}
    return;
  }
  if (!nm.notified) {
    nm.notified = Date.now();
    try { nm.ws.send(JSON.stringify({ type: 'pv_your_turn' })); } catch (_) {}
  }
}
// Contas da equipe Sigo com Fé: são tratadas como líderes na sala de voz (env SIGO_ADMIN_EMAILS, separado por vírgula)
const PV_ADMIN_EMAILS = new Set(['wenderj333@gmail.com', 'wenderj32@gmail.com', ...String(process.env.SIGO_ADMIN_EMAILS || '').split(',')].map(e => e.trim().toLowerCase()).filter(Boolean));
function pvState(room) {
  const members = prayerVoiceRooms.get(room);
  if (!members) return [];
  return [...members.entries()].map(([userId, m]) => ({ userId, name: m.name, avatar: m.avatar, speaking: m.speaking, leader: m.role === 'admin' || m.role === 'pastor', silenced: pvIsSilenced(userId), hand: m.hand || 0, ready: Boolean(m.hand && m.ready), video: Boolean(m.video), turnLeft: (m.speaking && m.limitFrom) ? Math.max(0, m.limitFrom + pvTurnMs(pvWaiting(members), room) - Date.now()) : null }));
}
function pvBroadcast(room) {
  const members = prayerVoiceRooms.get(room);
  if (!members) return;
  let parts = 0; for (const k of prayerVoiceRooms.keys()) if (pvBase(k) === pvBase(room)) parts++;
  const payload = JSON.stringify({ type: 'pv_state', room: pvBase(room), part: pvPart(room), parts, members: pvState(room), maxSpeakers: PV_MAX_SPEAKERS, cap: PV_ROOM_CAP, turnSeconds: pvTurnSeconds(room), ownerId: pvRoomOwners.get(pvBase(room)) || null });
  for (const m of members.values()) if (m.ws.readyState === 1) { try { m.ws.send(payload); } catch (_) {} }
}
function pvLeave(ws) {
  const info = clients.get(ws);
  if (!info?.pvRoom || !info.userId) return;
  const members = prayerVoiceRooms.get(info.pvRoom);
  if (members && members.get(info.userId)?.ws === ws) {
    members.delete(info.userId);
    if (!members.size) prayerVoiceRooms.delete(info.pvRoom); else { pvPromote(info.pvRoom); pvBroadcast(info.pvRoom); }
  }
  info.pvRoom = null;
}

async function notifyIncomingCall(call) {
  const destination = `/mensagens/${call.callerId}?incoming=${call.mode}&callId=${call.id}&callerName=${encodeURIComponent(call.callerName || 'Alguém')}`;
  const title = call.mode === 'video' ? 'Videochamada recebida' : 'Chamada recebida';
  const body = `${call.callerName || 'Alguém'} está a ligar-lhe. Toque para atender.`;
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, $2, $3, $4, $5)`,
      [call.receiverId, 'incoming_call', title, body, JSON.stringify({ destination, call_id: call.id, caller_id: call.callerId, mode: call.mode })]
    );
    const result = await db.query('SELECT fcm_token FROM users WHERE id = $1', [call.receiverId]);
    if (result.rows[0]?.fcm_token) await sendPushNotification(result.rows[0].fcm_token, title, body, { destination, call_id: call.id, caller_id: call.callerId, mode: call.mode });
  } catch (error) {
    // A chamada em tempo real continua a funcionar mesmo que o aviso não possa ser enviado.
    console.error('Erro ao enviar aviso de chamada:', error.message);
  }
}

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

// Chat da Oração Mundial: as rotas HTTP gravam a mensagem e avisam todos aqui
let wssRef = null;
const prayerChatWatchers = new Set();
const communityChatWatchers = new Set();
function broadcastAll(payload) {
  if (!wssRef) return;
  const message = JSON.stringify(payload);
  wssRef.clients.forEach((client) => { if (client.readyState === 1) { try { client.send(message); } catch (_) {} } });
}
function prayerChatPresence() {
  let online = 0;
  for (const w of prayerChatWatchers) { if (w.readyState === 1) online += 1; else prayerChatWatchers.delete(w); }
  const message = JSON.stringify({ type: 'prayer_chat_presence', online });
  for (const w of prayerChatWatchers) { try { w.send(message); } catch (_) {} }
}

function communityChatPresence() {
  let online = 0;
  for (const w of communityChatWatchers) { if (w.readyState === 1) online += 1; else communityChatWatchers.delete(w); }
  const message = JSON.stringify({ type: 'community_chat_presence', online });
  for (const w of communityChatWatchers) { try { w.send(message); } catch (_) {} }
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  wssRef = wss;
  // Sala de voz: acaba o tempo de quem está a orar e passa a vez; quem foi chamado e não começou sai da fila
  setInterval(() => {
    const now = Date.now();
    for (const [key, members] of prayerVoiceRooms) {
      let changed = false;
      const waiting = pvWaiting(members);
      for (const m of members.values()) {
        if (m.speaking && m.limitFrom && waiting && now >= m.limitFrom + pvTurnMs(waiting, key)) {
          m.speaking = false; m.limitFrom = 0; m.video = false; changed = true;
          try { m.ws.send(JSON.stringify({ type: 'pv_turn_over' })); } catch (_) {}
        }
        if (m.hand && m.notified && !m.speaking && now - m.notified > 45000) { m.hand = 0; m.notified = false; changed = true; }
      }
      if (changed) { pvPromote(key); pvBroadcast(key); }
    }
  }, 3000);
  // "Online" (bolinha verde em Membros): quem tem o site/app aberto e identificado conta como visto agora
  const touchOnline = () => {
    const ids = [...new Set([...clients.values()].map(c => c && c.userId).filter(Boolean).map(String))].filter(id => /^[0-9a-f-]{36}$/i.test(id));
    if (ids.length) db.query('UPDATE users SET last_seen_at = NOW() WHERE id = ANY($1::uuid[])', [ids]).catch(e => console.error('last_seen', e.message));
  };
  setInterval(touchOnline, 120000);
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
          case 'community_chat_watch': {
            if (msg.open) communityChatWatchers.add(ws); else communityChatWatchers.delete(ws);
            communityChatPresence();
            break;
          }
          case 'prayer_chat_watch': {
            if (msg.open) prayerChatWatchers.add(ws); else prayerChatWatchers.delete(ws);
            prayerChatPresence();
            break;
          }
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
          case 'game_bot_match':
            handleGameQueue(ws, msg);
            break;
          case 'game_lobby_join':
          case 'game_lobby_leave':
          case 'game_lobby_chat':
          case 'game_invite':
          case 'game_invite_accept':
          case 'game_invite_decline':
            await handleDuelLobby(ws, msg);
            break;
          case 'identify':
            try {
              const decoded = jwt.verify(msg.token, JWT_SECRET);
              if (decoded.id !== msg.userId) throw new Error('user mismatch');
              // Keep the room selected while the identity is validated. Without
              // this merge, an early `live_join` could be erased and the user
              // would appear as offline to everyone else in the room.
              clients.set(ws, { ...(clients.get(ws) || {}), userId: decoded.id, churchId: msg.churchId });
              db.query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [decoded.id]).catch(() => {});
            } catch (_) { ws.close(1008, 'authentication required'); break; }
            // Send current live sessions
            const liveSessions = await PastorSession.getLiveSessions();
            const liveCount = await PastorSession.getLiveCount();
            ws.send(JSON.stringify({
              type: 'live_sessions',
              sessions: liveSessions,
              totalChurchesPraying: liveCount,
            }));
            // Se a pessoa abriu o app logo após tocar no aviso, entregue a
            // chamada que ainda está a tocar para ela poder aceitar.
            for (const call of privateCalls.values()) {
              if (call.receiverId === decoded.id) {
                ws.send(JSON.stringify({ type: 'call_incoming', callId: call.id, callerId: call.callerId, callerName: call.callerName, callerAvatar: call.callerAvatar || null, mode: call.mode }));
              }
            }
            break;

          case 'call_request': {
            const caller = clients.get(ws);
            if (!caller?.userId || !msg.targetUserId || !['audio', 'video'].includes(msg.mode)) break;
            if (!msg.callId || String(msg.targetUserId) === String(caller.userId)) break;
            const prevCall = privateCalls.get(msg.callId);
            if (prevCall && prevCall.callerId !== caller.userId) break; // não pode sequestrar a chamada de outra pessoa
            // Quem bloqueou (ou foi bloqueado) não recebe chamadas dessa pessoa
            try {
              const blk = await db.query('SELECT 1 FROM dm_blocks WHERE (user_id::text = $1 AND blocked_id::text = $2) OR (user_id::text = $2 AND blocked_id::text = $1) LIMIT 1', [String(caller.userId), String(msg.targetUserId)]);
              if (blk.rows.length) { ws.send(JSON.stringify({ type: 'call_declined', callId: msg.callId, mode: msg.mode, reason: 'blocked' })); break; }
            } catch (_) { /* tabela ainda não existe: ninguém bloqueou */ }
            // Nome e foto de quem liga vêm da conta (antes o navegador podia mostrar qualquer nome, ex.: de um pastor)
            try {
              const cu = await db.query('SELECT full_name, display_name, avatar_url FROM users WHERE id = $1', [caller.userId]);
              if (cu.rows[0]) { msg.callerName = cu.rows[0].display_name || cu.rows[0].full_name || 'Sigo com Fé'; msg.callerAvatar = cu.rows[0].avatar_url || null; }
            } catch (_) {}
            msg.callerName = String(msg.callerName || '').slice(0, 80);
            const target = [...clients.entries()].find(([, info]) => info?.userId === msg.targetUserId)?.[0];
            const call = { id: msg.callId, callerId: caller.userId, receiverId: msg.targetUserId, mode: msg.mode, callerName: msg.callerName, callerAvatar: msg.callerAvatar || null };
            privateCalls.set(msg.callId, call);
            if (target?.readyState === 1) {
              target.send(JSON.stringify({ type: 'call_incoming', callId: call.id, callerId: call.callerId, callerName: call.callerName, callerAvatar: call.callerAvatar, mode: call.mode }));
            } else {
              await notifyIncomingCall(call);
            }
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

          case 'pv_join': {
            const info = clients.get(ws);
            if (!info?.userId) { ws.send(JSON.stringify({ type: 'pv_error', code: 'login' })); break; }
            // 'geral' = sala internacional; 'geral-pt', 'geral-en'… = sala de cada língua
            const room = (PV_ROOMS.has(String(msg.room)) || /^p-[A-Z0-9]{6}$/.test(String(msg.room)) || PV_LANG_ROOM_RE.test(String(msg.room))) ? String(msg.room) : 'geral';
            if (pvIsBlocked(info.userId)) { ws.send(JSON.stringify({ type: 'pv_error', code: 'blocked' })); break; }
            if (info.pvRoom && pvBase(info.pvRoom) !== room) pvLeave(ws);
            if (!info.pvRole) {
              try { const r = await db.query('SELECT role, email, full_name, avatar_url FROM users WHERE id = $1', [info.userId]); info.pvRole = r.rows[0]?.role || 'member'; if (PV_ADMIN_EMAILS.has(String(r.rows[0]?.email || '').toLowerCase())) info.pvRole = 'admin'; info.pvName = r.rows[0]?.full_name; info.pvAvatar = r.rows[0]?.avatar_url; } catch (_) { info.pvRole = 'member'; }
            }
            if (/^p-[A-Z0-9]{6}$/.test(room) && !pvRoomOwners.has(room)) {
              try { const o = await db.query('SELECT owner_id FROM prayer_private_rooms WHERE code = $1', [room.slice(2)]); pvRoomOwners.set(room, o.rows[0]?.owner_id ? String(o.rows[0].owner_id) : ''); } catch (_) {}
            }
            // Já estava nesta sala (outro aparelho ou reconexão)? Fica na mesma parte.
            const existingKey = pvFindUser(room, info.userId);
            const key = existingKey || pvPickPart(room);
            if (!prayerVoiceRooms.has(key)) prayerVoiceRooms.set(key, new Map());
            const previous = prayerVoiceRooms.get(key).get(info.userId);
            if (previous && previous.ws !== ws && previous.ws.readyState === 1) { try { previous.ws.send(JSON.stringify({ type: 'pv_kicked', reason: 'other_device' })); } catch (_) {} const pi = clients.get(previous.ws); if (pi) pi.pvRoom = null; }
            prayerVoiceRooms.get(key).set(info.userId, { ws, name: info.pvName || String(msg.name || '').slice(0, 80), avatar: info.pvAvatar || null, speaking: false, role: info.pvRole, hand: 0 });
            info.pvRoom = key;
            pvBroadcast(key);
            break;
          }
          case 'pv_leave': { pvLeave(ws); break; }
          case 'pv_mic': {
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const me = members?.get(info.userId);
            if (!me) break;
            if (msg.on) {
              if (pvIsBlocked(info.userId)) { ws.send(JSON.stringify({ type: 'pv_error', code: 'blocked' })); break; }
              if (pvIsSilenced(info.userId)) { ws.send(JSON.stringify({ type: 'pv_error', code: 'silenced', until: prayerVoiceSilenced.get(info.userId) })); break; }
              const speakers = [...members.values()].filter(m => m.speaking).length;
              // Há fila? Só o primeiro da fila pode começar; os outros entram na fila
              const firstInLine = [...members.entries()].filter(([, m]) => m.hand && !m.speaking).sort((a, b) => a[1].hand - b[1].hand)[0];
              const jumpsQueue = firstInLine && firstInLine[0] !== info.userId;
              if (!me.speaking && (speakers >= PV_MAX_SPEAKERS || jumpsQueue)) {
                // Lugar cheio: entra na fila (mão levantada) e é avisado quando abrir lugar
                if (!me.hand) { me.hand = Date.now(); me.notified = false; }
                me.ready = Boolean(msg.ready); me.video = Boolean(msg.video);
                const position = [...members.values()].filter(m => m.hand && !m.speaking && m.hand <= me.hand).length;
                ws.send(JSON.stringify({ type: 'pv_error', code: 'full', queued: true, position }));
                pvStartLimitIfQueue(members);
                pvBroadcast(info.pvRoom);
                break;
              }
              me.speaking = true; me.hand = 0; me.notified = false; me.ready = false; me.video = Boolean(msg.video);
              me.limitFrom = pvWaiting(members) ? Date.now() : 0;
            } else { me.speaking = false; me.limitFrom = 0; me.video = false; pvPromote(info.pvRoom); }
            pvBroadcast(info.pvRoom);
            break;
          }
          case 'pv_settings': {
            // Líderes (admin/pastor) e o dono da sala privada mudam o tempo de cada pessoa
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const me = members?.get(info.userId);
            if (!me) break;
            const base = pvBase(info.pvRoom);
            const leader = me.role === 'admin' || me.role === 'pastor';
            const owner = pvRoomOwners.get(base) && pvRoomOwners.get(base) === String(info.userId);
            if (!leader && !owner) { ws.send(JSON.stringify({ type: 'pv_error', code: 'not_allowed' })); break; }
            const secs = Math.round(Number(msg.turnSeconds));
            if (!Number.isFinite(secs) || secs < 30 || secs > 1200) break;
            pvTurnSettings.set(base, secs);
            try { await db.query('INSERT INTO prayer_room_settings (room, turn_seconds, updated_by, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (room) DO UPDATE SET turn_seconds = EXCLUDED.turn_seconds, updated_by = EXCLUDED.updated_by, updated_at = NOW()', [base, secs, info.userId]); } catch (_) {}
            for (const [k] of prayerVoiceRooms) if (pvBase(k) === base) pvBroadcast(k);
            ws.send(JSON.stringify({ type: 'pv_settings_ok', turnSeconds: secs }));
            break;
          }
          case 'pv_react': {
            // 🙏 Amém de quem está a ouvir (sem abrir o microfone)
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const me = members?.get(info.userId);
            if (!me) break;
            const now = Date.now();
            // Reações de louvor: amém, glória a Deus, aleluia, Deus seja louvado (cada um vê na sua língua)
            if (me.lastReact && now - me.lastReact < 700) break;
            me.reactWin = (me.reactWin || []).filter(t => now - t < 10000);
            if (me.reactWin.length >= 10) break;
            me.reactWin.push(now);
            me.lastReact = now;
            const kind = ['amen', 'gloria', 'aleluia', 'louvado'].includes(String(msg.kind)) ? String(msg.kind) : 'amen';
            const payload = JSON.stringify({ type: 'pv_react', from: info.userId, name: me.name, emoji: '🙏', kind });
            for (const m of members.values()) if (m.ws.readyState === 1) { try { m.ws.send(payload); } catch (_) {} }
            break;
          }
          case 'pv_hand': {
            const info = clients.get(ws);
            const me = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom)?.get(info.userId);
            if (!me) break;
            me.hand = msg.on ? (me.hand || Date.now()) : 0; me.notified = false;
            if (!msg.on) me.ready = false;
            const hm = prayerVoiceRooms.get(info.pvRoom);
            if (msg.on) pvStartLimitIfQueue(hm); else pvPromote(info.pvRoom);
            pvBroadcast(info.pvRoom);
            break;
          }
          case 'pv_signal': {
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const target = members?.get(String(msg.to));
            if (!members?.has(info.userId) || !target || target.ws.readyState !== 1) break;
            target.ws.send(JSON.stringify({ type: 'pv_signal', from: info.userId, signal: msg.signal, key: msg.key }));
            break;
          }
          case 'pv_mute': {
            // Silenciar alguém que faz barulho: 5 pessoas (ou um líder) => microfone desligado por 15 minutos
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const targetId = String(msg.target || '');
            if (!members?.has(info.userId) || !targetId || targetId === info.userId || !members.has(targetId)) break;
            const voterRole = members.get(info.userId)?.role;
            const leader = voterRole === 'admin' || voterRole === 'pastor';
            const key = info.pvRoom + ':' + targetId;
            const voters = prayerVoiceMuteVotes.get(key) || new Set();
            voters.add(info.userId);
            prayerVoiceMuteVotes.set(key, voters);
            const needed = Math.min(PV_MUTE_VOTES, Math.max(2, members.size - 1));
            if (leader || voters.size >= needed) {
              const until = Date.now() + PV_MUTE_MINUTES * 60 * 1000;
              prayerVoiceSilenced.set(targetId, until);
              prayerVoiceMuteVotes.delete(key);
              const t = members.get(targetId);
              if (t) { t.speaking = false; t.hand = 0; try { t.ws.send(JSON.stringify({ type: 'pv_silenced', until, minutes: PV_MUTE_MINUTES })); } catch (_) {} }
              pvPromote(info.pvRoom);
              pvBroadcast(info.pvRoom);
            }
            ws.send(JSON.stringify({ type: 'pv_mute_ok', target: targetId, votes: leader ? needed : voters.size, needed, done: leader || voters.size >= needed }));
            break;
          }
          case 'pv_block': {
            const info = clients.get(ws);
            const members = info?.pvRoom && prayerVoiceRooms.get(info.pvRoom);
            const targetId = String(msg.target || '');
            if (!members?.has(info.userId) || !targetId || targetId === info.userId) break;
            const voterRole = members.get(info.userId)?.role;
            const voters = prayerVoiceVotes.get(targetId) || new Set();
            voters.add(info.userId);
            prayerVoiceVotes.set(targetId, voters);
            const leader = voterRole === 'admin' || voterRole === 'pastor';
            if (leader || voters.size >= PV_BLOCK_VOTES) {
              prayerVoiceBlocked.set(targetId, Date.now() + 24 * 3600 * 1000);
              prayerVoiceVotes.delete(targetId);
              for (const [room, roomMembers] of prayerVoiceRooms) {
                const t = roomMembers.get(targetId);
                if (t) { try { t.ws.send(JSON.stringify({ type: 'pv_kicked', reason: 'blocked' })); } catch (_) {} roomMembers.delete(targetId); const ti = clients.get(t.ws); if (ti) ti.pvRoom = null; pvBroadcast(room); }
              }
              try { await db.query('INSERT INTO reports (reporter_id, reported_user_id, reason, description) VALUES ($1, $2, $3, $4)', [info.userId, targetId, 'harassment', leader ? 'Bloqueado por líder na sala de voz da Oração Mundial' : `Bloqueado por ${PV_BLOCK_VOTES} pessoas na sala de voz da Oração Mundial`]); } catch (_) {}
            }
            ws.send(JSON.stringify({ type: 'pv_block_ok', target: targetId, votes: leader ? PV_BLOCK_VOTES : voters.size, needed: PV_BLOCK_VOTES }));
            break;
          }

          case 'pastor_start_praying':
            const liveUrl = typeof msg.liveUrl === 'string' && /^https?:\/\//i.test(msg.liveUrl.trim()) ? msg.liveUrl.trim() : '';
            const session = await PastorSession.startSession(
              msg.pastorId,
              msg.churchId,
              msg.prayerFocus || '',
              msg.campaignName || '',
              Number.isInteger(Number(msg.campaignDay)) ? Number(msg.campaignDay) : null,
              Number.isInteger(Number(msg.campaignTotal)) ? Number(msg.campaignTotal) : null,
              liveUrl,
              msg.chatEnabled !== false,
              msg.vowEnabled === true
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
                campaignName: msg.campaignName || '',
                campaignDay: Number.isInteger(Number(msg.campaignDay)) ? Number(msg.campaignDay) : null,
                campaignTotal: Number.isInteger(Number(msg.campaignTotal)) ? Number(msg.campaignTotal) : null,
                liveUrl,
                chatEnabled: msg.chatEnabled !== false,
                vowEnabled: msg.vowEnabled === true,
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
            const starter = clients.get(ws) || {};
            if (!starter.userId || !msg.streamId) break;
            const existing = liveStreams.get(msg.streamId);
            if (existing && existing.broadcasterWs !== ws) break; // não pode tomar a transmissão de outra pessoa
            msg.broadcasterId = starter.userId;
            msg.broadcasterName = String(msg.broadcasterName || '').slice(0, 80);
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
            if (!stream || stream.broadcasterWs !== ws) break; // só quem transmite pode terminar
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
            if (!msg.streamId) { // Comunidade ao vivo (salas por língua)
              const clientInfo = clients.get(ws) || {};
              clientInfo.liveCommunityRoom = String(msg.roomId || 'pt').slice(0, 10);
              clients.set(ws, clientInfo);
              broadcastCommunityPresence(clients, clientInfo.liveCommunityRoom);
              break;
            }
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
            if (!msg.streamId) {
              const clientInfo = clients.get(ws) || {};
              const roomId = clientInfo.liveCommunityRoom || String(msg.roomId || 'pt').slice(0, 10);
              clientInfo.liveCommunityRoom = null;
              clients.set(ws, clientInfo);
              broadcastCommunityPresence(clients, roomId);
              break;
            }
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
            if (!clientInfo.userId || !clientInfo.liveCommunityRoom) break; // só quem tem sessão e entrou na sala
            const roomId = clientInfo.liveCommunityRoom;
            const text = String(msg.text || '').trim().slice(0, 1000);
            if (!text) break;
            if (!clientInfo.liveProfile) {
              try {
                const pr = await db.query('SELECT full_name, display_name, avatar_url FROM users WHERE id = $1', [clientInfo.userId]);
                const u = pr.rows[0] || {};
                clientInfo.liveProfile = { name: u.full_name || u.display_name || 'Membro', avatar: u.avatar_url || null };
                clients.set(ws, clientInfo);
              } catch (_) { break; }
            }
            const communityChat = { type: 'live_chat_broadcast', roomId, userId: clientInfo.userId, userName: clientInfo.liveProfile.name, userAvatar: clientInfo.liveProfile.avatar, text, id: Date.now().toString(), time: new Date().toISOString() };
            broadcastToCommunityRoom(clients, roomId, communityChat);
            break;
          }
          case 'live_chat': {
            if ((clients.get(ws) || {}).liveStreamId !== msg.streamId) break;
            msg.name = String(msg.name || '').slice(0, 80); msg.text = String(msg.text || '').slice(0, 1000);
            const chatData = { type: 'live_chat_message', streamId: msg.streamId, name: msg.name, text: msg.text, id: Date.now().toString(), time: new Date().toISOString() };
            broadcastToStream(wss, msg.streamId, chatData, ws);
            break;
          }

          case 'live_reaction': {
            if ((clients.get(ws) || {}).liveStreamId !== msg.streamId) break;
            msg.emoji = String(msg.emoji || '').slice(0, 8); msg.name = String(msg.name || '').slice(0, 80);
            broadcastToStream(wss, msg.streamId, { type: 'live_reaction', streamId: msg.streamId, emoji: msg.emoji, name: msg.name }, ws);
            break;
          }

          case 'chat_join_room': {
            // Segurança: quem pediu ajuda entra com a chave secreta da conversa; o pastor tem de estar
            // identificado, ser pastor/admin e ser quem aceitou a conversa
            const clientInfo = clients.get(ws) || {};
            let allowedRole = null; let displayName = String(msg.name || '').slice(0, 80);
            try {
              const cdb = require('./db/connection');
              const rr = await cdb.query('SELECT id, access_key, pastor_id FROM chat_rooms WHERE id = $1', [msg.roomId]);
              const room = rr.rows[0];
              if (room && msg.role === 'pastor' && clientInfo.userId) {
                const ur = await cdb.query('SELECT role, full_name FROM users WHERE id = $1', [clientInfo.userId]);
                const u = ur.rows[0];
                if (u && (u.role === 'admin' || (u.role === 'pastor' && (!room.pastor_id || String(room.pastor_id) === String(clientInfo.userId))))) { allowedRole = 'pastor'; displayName = displayName || u.full_name || 'Pastor'; }
              } else if (room && msg.role !== 'pastor' && room.access_key && msg.key && String(msg.key) === String(room.access_key)) {
                allowedRole = 'requester';
              }
            } catch (_) { allowedRole = null; }
            if (!allowedRole) { try { ws.send(JSON.stringify({ type: 'chat_error', roomId: msg.roomId, code: 'forbidden' })); } catch (_) {} break; }
            clientInfo.chatRoomId = String(msg.roomId);
            clientInfo.chatRole = allowedRole;
            clientInfo.chatName = displayName || 'Anônimo';
            clientInfo.chatLang = String(msg.language || 'pt').slice(0, 10);
            clients.set(ws, clientInfo);
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_user_joined',
              roomId: msg.roomId,
              role: allowedRole,
              name: clientInfo.chatName,
              language: clientInfo.chatLang,
            }, ws);
            break;
          }

          case 'chat_message': {
            const sender = clients.get(ws) || {};
            if (!sender.chatRoomId || sender.chatRoomId !== String(msg.roomId)) break; // só quem entrou (com permissão) nesta conversa
            msg.role = sender.chatRole; msg.name = sender.chatName;
            msg.text = String(msg.text || '').slice(0, 4000);
            if (!msg.text.trim()) break;
            let translated = msg.text;
            if (msg.targetLang && msg.sourceLang && msg.targetLang !== msg.sourceLang) {
              try {
                translated = await translateWithClaude(msg.text, msg.sourceLang, msg.targetLang);
              } catch (e) { console.error('Translation error:', e); }
            }
            const chatDb = require('./db/connection');
            // Guardar não pode impedir a entrega da mensagem
            await chatDb.query(
              'INSERT INTO chat_messages (room_id, sender_role, sender_name, original_text, translated_text, original_lang, target_lang) VALUES ($1,$2,$3,$4,$5,$6,$7)',
              [msg.roomId, msg.role, msg.name, msg.text, translated, msg.sourceLang, msg.targetLang]).catch(e => console.warn('chat save:', e.message));
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_new_message',
              roomId: msg.roomId,
              role: msg.role,
              name: msg.name,
              originalText: msg.text,
              translatedText: translated,
              sourceLang: msg.sourceLang,
              timestamp: new Date().toISOString(),
            }, ws);
            break;
          }

          case 'chat_typing':
            if (!(clients.get(ws) || {}).chatRoomId || (clients.get(ws) || {}).chatRoomId !== String(msg.roomId)) break;
            broadcastToRoom(wss, clients, msg.roomId, {
              type: 'chat_typing',
              roomId: msg.roomId,
              role: msg.role,
              name: msg.name,
            }, ws);
            break;

          case 'chat_leave_room': {
            const ci = clients.get(ws) || {};
            if (!ci.chatRoomId || ci.chatRoomId !== String(msg.roomId)) break;
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
      removeDuelLobbyPlayer(ws);
      if (prayerChatWatchers.delete(ws)) prayerChatPresence();
      if (communityChatWatchers.delete(ws)) communityChatPresence();
      try { pvLeave(ws); } catch (_) {}
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
      if (info && info.chatRoomId != null && String(info.chatRoomId) === String(roomId)) {
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
let duelLobbySchemaReady = false;

// Cada visitante recebe um apelido numérico, sem revelar nenhum dado pessoal.
function visitorDisplayName(userId) {
  let hash = 0;
  for (const character of String(userId)) hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  return `Visitante #${String((hash % 9000) + 1000)}`;
}

async function ensureDuelLobbySchema() {
  if (duelLobbySchemaReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS duel_lobby_messages (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      user_name VARCHAR(60) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_duel_lobby_messages_created_at
      ON duel_lobby_messages(created_at DESC);
  `);
  duelLobbySchemaReady = true;
}

function lobbyPlayersPayload() {
  return [...duelLobbyPlayers.values()].map(({ userId, userName, avatar, status, isGuest }) => ({
    userId,
    // Não expomos dados pessoais dos visitantes antes do registo.
    userName: isGuest ? visitorDisplayName(userId) : userName,
    avatar: isGuest ? '' : avatar,
    status: status || 'available',
    isGuest: Boolean(isGuest),
  }));
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

async function handleDuelLobby(ws, msg) {
  const userId = String(msg.userId || '').trim();
  if (!userId) return;

  if (msg.type === 'game_lobby_join') {
    const isGuest = userId.startsWith('guest-');
    const isNewConnection = duelLobbyPlayers.get(userId)?.ws !== ws;
    duelLobbyPlayers.set(userId, {
      userId,
      userName: isGuest ? visitorDisplayName(userId) : String(msg.userName || 'Jogador').trim().slice(0, 60),
      avatar: isGuest ? '' : String(msg.avatar || '').slice(0, 2000),
      status: duelLobbyPlayers.get(userId)?.status || 'available',
      isGuest,
      ws,
    });
    broadcastDuelLobby();
    // Também responde quando a página do Duelo é aberta de novo na mesma
    // ligação WebSocket; os outros sinais de presença não recarregam o chat.
    if (isNewConnection || msg.loadHistory === true) {
      try {
        await ensureDuelLobbySchema();
        await db.query("DELETE FROM duel_lobby_messages WHERE created_at < NOW() - INTERVAL '48 hours'");
        const history = await db.query(
          "SELECT id, user_id, user_name, message, created_at FROM duel_lobby_messages WHERE created_at >= NOW() - INTERVAL '48 hours' ORDER BY created_at ASC LIMIT 100"
        );
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            type: 'game_lobby_chat_history',
            messages: history.rows.map(item => ({
              id: String(item.id),
              userId: item.user_id,
              userName: item.user_name,
              text: item.message,
              createdAt: item.created_at,
            })),
          }));
        }
      } catch (error) {
        console.error('Não foi possível carregar o histórico do chat do Duelo:', error.message);
      }
    }
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
    try {
      await ensureDuelLobbySchema();
      await db.query("DELETE FROM duel_lobby_messages WHERE created_at < NOW() - INTERVAL '48 hours'");
      const saved = await db.query(
        'INSERT INTO duel_lobby_messages (user_id, user_name, message) VALUES ($1, $2, $3) RETURNING id, created_at',
        [userId, sender.userName, text]
      );
      const message = saved.rows[0];
      const data = JSON.stringify({ type: 'game_lobby_chat', message: {
        id: String(message.id), userId, userName: sender.userName, text, createdAt: message.created_at,
      } });
      duelLobbyPlayers.forEach(player => { if (player.ws?.readyState === 1) player.ws.send(data); });
    } catch (error) {
      console.error('Não foi possível guardar a mensagem do chat do Duelo:', error.message);
      ws.send(JSON.stringify({ type: 'game_lobby_chat_error', message: 'Não foi possível guardar a mensagem. Tente novamente.' }));
    }
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
  if (room.botTurnTimer) clearTimeout(room.botTurnTimer);
  const jogadores = jogadoresPublicos(room);
  const vencedor = jogadores.reduce((melhor, jogador) => jogador.pontos > melhor.pontos ? jogador : melhor, jogadores[0]);
  room.jogadores.forEach(j => { if (j.ws?.readyState === 1) j.ws.send(JSON.stringify({ type: 'game_finished', jogadores, vencedor })); });
  // Só partidas entre pessoas reais e com sessão contam para o ranking (contra o bot não conta),
  // e o nome vem da conta (antes vinha do navegador e dava para pontuar em nome de outra pessoa).
  const realPlayers = room.jogadores.filter(j => !String(j.userId).startsWith('bot-') && !String(j.userId).startsWith('guest-'));
  if (!room.isBot && realPlayers.length >= 2) realPlayers.forEach(async (jogador) => {
    try {
      const sessionUser = jogador.ws ? clients.get(jogador.ws)?.userId : null;
      if (!sessionUser || String(sessionUser) !== String(jogador.userId)) return;
      const u = await db.query('SELECT full_name, avatar_url FROM users WHERE id = $1', [sessionUser]);
      const nome = u.rows[0]?.full_name; if (!nome) return;
      await db.query(
        'INSERT INTO duelo_ranking (nome,pontos,foto) VALUES ($1,$2,$3) ON CONFLICT (nome) DO UPDATE SET pontos=duelo_ranking.pontos+$2, foto=COALESCE($3,duelo_ranking.foto), updated_at=NOW()',
        [nome, Math.min(Number(jogador.pontos) || 0, 60), u.rows[0].avatar_url || null],
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
  if (room.botTurnTimer) clearTimeout(room.botTurnTimer);
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
  if (room.isBot) agendarRespostaDoBot(roomId, room.perguntaIdx);
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
    void pontosAntigos;
    const acertou = Number.isInteger(choice) && choice === question?.r;
    if (acertou) j.pontos += 3;
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

const BIBLE_BOT_ACCURACY = 0.72;
const BIBLE_BOT_OPPONENTS = [
  { userId: 'bot-moises', userName: 'Pastor Bot', avatar: '' },
  { userId: 'bot-davi', userName: 'Davi Bot', avatar: '' },
  { userId: 'bot-salomao', userName: 'Salomão Bot', avatar: '' },
];

function enviarPlacar(room) {
  const jogadores = jogadoresPublicos(room);
  room.jogadores.forEach(player => {
    if (player.ws?.readyState === 1) player.ws.send(JSON.stringify({ type: 'game_score', jogadores }));
  });
}

function agendarRespostaDoBot(roomId, questionIndex) {
  const room = gameRooms.get(roomId);
  if (!room?.isBot) return;
  const bot = room.jogadores.find(player => String(player.userId).startsWith('bot-'));
  if (!bot) return;
  const delay = 1900 + Math.floor(Math.random() * 2100);
  room.botTurnTimer = setTimeout(() => {
    const atual = gameRooms.get(roomId);
    if (!atual || atual !== room || atual.advancing || atual.perguntaIdx !== questionIndex || bot.respondeu) return;
    const question = atual.perguntas?.[atual.perguntaIdx];
    if (!question) return;
    const acertou = Math.random() < BIBLE_BOT_ACCURACY;
    bot.respondeu = true;
    if (acertou) bot.pontos += 3;
    enviarPlacar(atual);
    if (acertou && !atual.advancing) {
      atual.advancing = true;
      setTimeout(() => proximaPergunta(roomId), 700);
    }
  }, delay);
}

function iniciarDueloComBot(ws, msg) {
  const userId = String(msg.userId || '').trim();
  if (!userId || ws.readyState !== 1) return;
  const userName = String(msg.userName || 'Jogador').trim().slice(0, 60);
  const avatar = String(msg.avatar || '').slice(0, 2000);
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bot = BIBLE_BOT_OPPONENTS[Math.floor(Math.random() * BIBLE_BOT_OPPONENTS.length)];
  const perguntas = questionsForDuel('Todos');
  const jogadores = [
    { ...bot, pontos: 0, respondeu: false, ws: null },
    { userId, userName, avatar, pontos: 0, respondeu: false, ws },
  ];
  gameRooms.set(roomId, { id: roomId, livro: 'Todos', perguntas, iniciado: true, perguntaIdx: 0, jogadores, isBot: true });
  setLobbyStatus(userId, 'playing');
  broadcastDuelLobby();
  ws.send(JSON.stringify({ type: 'game_matched', roomId, perguntas, adversario: bot, isBot: true }));
  agendarPergunta(roomId);
}
function handleGameQueue(ws, msg) {
  const userId = msg.userId;
  const userName = msg.userName || 'Jogador';
  const avatar = msg.avatar || '';
  const livro = msg.livro || 'Todos';

  if (msg.type === 'game_bot_match') {
    iniciarDueloComBot(ws, msg);
    return;
  }
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
// Quem está numa sala de voz também conta como "orando agora" (bolinhas da Oração Mundial)
function voicePresence() {
  const out = [];
  for (const [key, members] of prayerVoiceRooms) {
    const room = pvBase(key);
    for (const [userId, m] of members) out.push({ user_id: String(userId), name: m.name || '', avatar_url: m.avatar || null, room });
  }
  return out;
}
module.exports = { setupWebSocket, notifyUser, voicePresence, broadcastAll };

// clean




// nivel system
