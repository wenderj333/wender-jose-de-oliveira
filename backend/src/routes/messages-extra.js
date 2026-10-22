const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Mensagens, parte 2: configurações (estado online), arquivar, bloquear e conversas em grupo.
// Fica montado em /api/messages ANTES do router antigo, por isso as rotas fixas (/settings, /groups…)
// são tratadas aqui e o resto (/:userId) continua no messages.js.

let ready = null;
function ensureTables() {
  if (!ready) {
    ready = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS dm_settings (
        user_id UUID PRIMARY KEY,
        show_online BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await db.query(`ALTER TABLE dm_settings ADD COLUMN IF NOT EXISTS who_can_message VARCHAR(10) DEFAULT 'everyone'`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_restricted (
        user_id UUID NOT NULL,
        restricted_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, restricted_id)
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_accepted (
        user_id UUID NOT NULL,
        other_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, other_id)
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_archived (
        user_id UUID NOT NULL,
        conv_key VARCHAR(80) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, conv_key)
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_blocks (
        user_id UUID NOT NULL,
        blocked_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, blocked_id)
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_groups (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        avatar_url TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS dm_group_members (
        group_id BIGINT NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(10) DEFAULT 'member',
        last_read_id BIGINT DEFAULT 0,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (group_id, user_id)
      )`);
      await db.query('CREATE INDEX IF NOT EXISTS dm_group_members_user_idx ON dm_group_members (user_id)');
      await db.query(`CREATE TABLE IF NOT EXISTS dm_group_messages (
        id BIGSERIAL PRIMARY KEY,
        group_id BIGINT NOT NULL,
        sender_id UUID,
        content TEXT NOT NULL,
        kind VARCHAR(10) DEFAULT 'text',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await db.query('CREATE INDEX IF NOT EXISTS dm_group_messages_group_idx ON dm_group_messages (group_id, id)');
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}
setTimeout(() => ensureTables().then(() => console.log('DM extra tables ready')).catch((e) => console.error('dm tables', e.message)), 5000);
router.use(async (req, res, next) => { try { await ensureTables(); } catch (_) {} next(); });

const notify = (userId, payload) => { try { require('../websocket').notifyUser(userId, payload); } catch (_) {} };
async function pushTo(userIds, title, body, data) {
  try {
    const { sendPushNotification } = require('../services/notifications');
    const r = await db.query('SELECT id, fcm_token FROM users WHERE id = ANY($1::uuid[]) AND fcm_token IS NOT NULL', [userIds]);
    for (const row of r.rows) { sendPushNotification(row.fcm_token, title, body, data).catch(() => {}); }
  } catch (_) { /* push é opcional */ }
}
const isUuid = (x) => /^[0-9a-f-]{36}$/i.test(String(x || ''));

// ─── Configurações ───────────────────────────────────────────────────────────
router.get('/settings', authenticate, async (req, res) => {
  try {
    const me = req.user.id;
    const s = await db.query('SELECT show_online, who_can_message FROM dm_settings WHERE user_id = $1', [me]);
    const restricted = await db.query(
      `SELECT u.id, u.full_name, u.avatar_url FROM dm_restricted r JOIN users u ON u.id = r.restricted_id
        WHERE r.user_id = $1 ORDER BY r.created_at DESC`, [me]);
    const blocked = await db.query(
      `SELECT u.id, u.full_name, u.avatar_url FROM dm_blocks b JOIN users u ON u.id = b.blocked_id
        WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [me]);
    const archived = await db.query('SELECT conv_key FROM dm_archived WHERE user_id = $1', [me]);
    res.json({
      showOnline: s.rows[0] ? s.rows[0].show_online !== false : true,
      whoCanMessage: s.rows[0]?.who_can_message === 'friends' ? 'friends' : 'everyone',
      blocked: blocked.rows,
      restricted: restricted.rows,
      archived: archived.rows.map(r => r.conv_key),
    });
  } catch (err) { console.error('dm settings GET:', err.message); res.status(500).json({ error: 'server' }); }
});

router.put('/settings', authenticate, async (req, res) => {
  try {
    await db.query(`INSERT INTO dm_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [req.user.id]);
    if (typeof req.body?.showOnline === 'boolean') await db.query('UPDATE dm_settings SET show_online = $2, updated_at = NOW() WHERE user_id = $1', [req.user.id, req.body.showOnline]);
    if (['everyone', 'friends'].includes(req.body?.whoCanMessage)) await db.query('UPDATE dm_settings SET who_can_message = $2, updated_at = NOW() WHERE user_id = $1', [req.user.id, req.body.whoCanMessage]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Arquivar / desarquivar. key = id da pessoa, ou "g:<id do grupo>"
router.post('/archive', authenticate, async (req, res) => {
  try {
    const key = String(req.body?.key || '');
    if (!isUuid(key) && !/^g:\d+$/.test(key)) return res.status(400).json({ error: 'bad_key' });
    if (req.body?.archived === false) await db.query('DELETE FROM dm_archived WHERE user_id = $1 AND conv_key = $2', [req.user.id, key]);
    else await db.query('INSERT INTO dm_archived (user_id, conv_key) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, key]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Bloquear / desbloquear uma pessoa
router.post('/block', authenticate, async (req, res) => {
  try {
    const other = String(req.body?.userId || '');
    if (!isUuid(other) || other === String(req.user.id)) return res.status(400).json({ error: 'bad_user' });
    if (req.body?.blocked === false) await db.query('DELETE FROM dm_blocks WHERE user_id = $1 AND blocked_id = $2', [req.user.id, other]);
    else await db.query('INSERT INTO dm_blocks (user_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, other]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Restringir / deixar de restringir: as mensagens da pessoa vão para Pedidos, sem aviso nem som,
// e ela não vê se você está online nem se leu
router.post('/restrict', authenticate, async (req, res) => {
  try {
    const other = String(req.body?.userId || '');
    if (!isUuid(other) || other === String(req.user.id)) return res.status(400).json({ error: 'bad_user' });
    if (req.body?.restricted === false) await db.query('DELETE FROM dm_restricted WHERE user_id = $1 AND restricted_id = $2', [req.user.id, other]);
    else await db.query('INSERT INTO dm_restricted (user_id, restricted_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, other]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Pedidos de mensagem: aceitar (passa para as conversas) ou recusar (vai para o arquivo)
router.post('/requests/:action', authenticate, async (req, res) => {
  try {
    const other = String(req.body?.userId || '');
    if (!isUuid(other)) return res.status(400).json({ error: 'bad_user' });
    if (req.params.action === 'accept') {
      await db.query('INSERT INTO dm_accepted (user_id, other_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, other]);
      await db.query('DELETE FROM dm_restricted WHERE user_id = $1 AND restricted_id = $2', [req.user.id, other]);
      await db.query('DELETE FROM dm_archived WHERE user_id = $1 AND conv_key = $2', [req.user.id, other]);
    } else if (req.params.action === 'decline') {
      await db.query('INSERT INTO dm_archived (user_id, conv_key) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, other]);
      await db.query('UPDATE direct_messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2', [other, req.user.id]);
    } else return res.status(400).json({ error: 'bad_action' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// ─── Grupos ──────────────────────────────────────────────────────────────────
async function membership(groupId, userId) {
  const r = await db.query('SELECT role FROM dm_group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
  return r.rows[0] || null;
}
async function memberIds(groupId) {
  return (await db.query('SELECT user_id FROM dm_group_members WHERE group_id = $1', [groupId])).rows.map(r => String(r.user_id));
}
async function systemMessage(groupId, text) {
  const r = await db.query(`INSERT INTO dm_group_messages (group_id, sender_id, content, kind) VALUES ($1, NULL, $2, 'system') RETURNING id`, [groupId, text]);
  return r.rows[0].id;
}

// Lista de grupos de quem está a usar, com a última mensagem e as não lidas
router.get('/groups', authenticate, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT g.id, g.name, g.avatar_url, m.role,
        (SELECT COUNT(*) FROM dm_group_members x WHERE x.group_id = g.id)::int AS members,
        lm.content AS last_content, lm.kind AS last_kind, COALESCE(lm.created_at, g.created_at) AS last_at, lu.full_name AS last_sender,
        (SELECT COUNT(*) FROM dm_group_messages gm WHERE gm.group_id = g.id AND gm.id > m.last_read_id AND gm.sender_id IS DISTINCT FROM $1 AND gm.kind <> 'system')::int AS unread
      FROM dm_group_members m
      JOIN dm_groups g ON g.id = m.group_id
      LEFT JOIN LATERAL (SELECT * FROM dm_group_messages gm WHERE gm.group_id = g.id ORDER BY gm.id DESC LIMIT 1) lm ON true
      LEFT JOIN users lu ON lu.id = lm.sender_id
      WHERE m.user_id = $1
      ORDER BY last_at DESC`, [req.user.id]);
    res.json({ groups: r.rows.map(g => ({ ...g, id: String(g.id) })) });
  } catch (err) { console.error('groups GET:', err.message); res.json({ groups: [] }); }
});

// Criar grupo: nome, foto (opcional) e pessoas
router.post('/groups', authenticate, async (req, res) => {
  try {
    const me = String(req.user.id);
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const avatar = /^https:\/\//.test(String(req.body?.avatarUrl || '')) ? String(req.body.avatarUrl) : null;
    const ids = [...new Set((Array.isArray(req.body?.memberIds) ? req.body.memberIds : []).map(String).filter(isUuid))].filter(x => x !== me).slice(0, 250);
    if (!name) return res.status(400).json({ error: 'name_required' });
    if (!ids.length) return res.status(400).json({ error: 'members_required' });
    // não junta quem bloqueou o criador
    const blockedMe = (await db.query('SELECT user_id FROM dm_blocks WHERE blocked_id = $1 AND user_id = ANY($2::uuid[])', [me, ids])).rows.map(r => String(r.user_id));
    const finalIds = ids.filter(x => !blockedMe.includes(x));
    const valid = (await db.query('SELECT id FROM users WHERE id = ANY($1::uuid[]) AND COALESCE(is_active, true)', [finalIds])).rows.map(r => String(r.id));
    const g = await db.query('INSERT INTO dm_groups (name, avatar_url, created_by) VALUES ($1, $2, $3) RETURNING id', [name, avatar, me]);
    const gid = g.rows[0].id;
    await db.query(`INSERT INTO dm_group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`, [gid, me]);
    for (const uid of valid) await db.query(`INSERT INTO dm_group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [gid, uid]);
    const lastId = await systemMessage(gid, `created|${req.user.full_name || ''}`);
    await db.query('UPDATE dm_group_members SET last_read_id = $2 WHERE group_id = $1', [gid, lastId]);
    valid.forEach(uid => notify(uid, { type: 'group_message', groupId: String(gid), groupName: name, senderName: req.user.full_name || '', preview: '' }));
    res.status(201).json({ group: { id: String(gid), name, avatar_url: avatar } });
  } catch (err) { console.error('groups POST:', err.message); res.status(500).json({ error: 'server' }); }
});

// Abrir um grupo: dados, membros e mensagens (marca como lidas)
router.get('/groups/:id', authenticate, async (req, res) => {
  try {
    const gid = String(req.params.id);
    if (!/^\d+$/.test(gid)) return res.status(400).json({ error: 'bad_id' });
    const me = await membership(gid, req.user.id);
    if (!me) return res.status(403).json({ error: 'not_member' });
    const g = (await db.query('SELECT id, name, avatar_url, created_by, created_at FROM dm_groups WHERE id = $1', [gid])).rows[0];
    const members = (await db.query(`SELECT u.id, u.full_name, u.avatar_url, m.role FROM dm_group_members m JOIN users u ON u.id = m.user_id
      WHERE m.group_id = $1 ORDER BY (m.role = 'admin') DESC, u.full_name`, [gid])).rows;
    const msgs = (await db.query(`SELECT * FROM (SELECT gm.id, gm.sender_id, gm.content, gm.kind, gm.created_at, u.full_name AS sender_name, u.avatar_url AS sender_avatar
      FROM dm_group_messages gm LEFT JOIN users u ON u.id = gm.sender_id WHERE gm.group_id = $1 ORDER BY gm.id DESC LIMIT 200) t ORDER BY id ASC`, [gid])).rows
      .map(m => ({ ...m, id: String(m.id) }));
    if (msgs.length) await db.query('UPDATE dm_group_members SET last_read_id = GREATEST(last_read_id, $3) WHERE group_id = $1 AND user_id = $2', [gid, req.user.id, msgs[msgs.length - 1].id]);
    res.json({ group: { ...g, id: String(g.id), myRole: me.role }, members, messages: msgs });
  } catch (err) { console.error('group GET:', err.message); res.status(500).json({ error: 'server' }); }
});

// Mandar mensagem no grupo
const recent = new Map();
router.post('/groups/:id/messages', authenticate, async (req, res) => {
  try {
    const gid = String(req.params.id);
    if (!/^\d+$/.test(gid) || !(await membership(gid, req.user.id))) return res.status(403).json({ error: 'not_member' });
    const content = String(req.body?.content || '').trim().slice(0, 4000);
    if (!content) return res.status(400).json({ error: 'empty' });
    const uid = String(req.user.id), now = Date.now();
    const list = (recent.get(uid) || []).filter(t => now - t < 60000);
    if (list.length >= 30) return res.status(429).json({ error: 'slow_down' });
    list.push(now); recent.set(uid, list); if (recent.size > 5000) recent.clear();
    const r = await db.query(`INSERT INTO dm_group_messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, sender_id, content, kind, created_at`, [gid, uid, content]);
    const msg = { ...r.rows[0], id: String(r.rows[0].id), sender_name: req.user.full_name, sender_avatar: req.user.avatar_url };
    await db.query('UPDATE dm_group_members SET last_read_id = $3 WHERE group_id = $1 AND user_id = $2', [gid, uid, msg.id]);
    const g = (await db.query('SELECT name FROM dm_groups WHERE id = $1', [gid])).rows[0];
    const others = (await memberIds(gid)).filter(x => x !== uid);
    const preview = content.startsWith('__SCF_VOICE__:') ? '🎤' : content.slice(0, 60);
    others.forEach(o => notify(o, { type: 'group_message', groupId: gid, groupName: g?.name || '', senderName: req.user.full_name || '', preview }));
    pushTo(others, `👥 ${g?.name || 'Grupo'}`, `${req.user.full_name || ''}: ${preview}`, { groupId: gid, type: 'group_message' });
    res.status(201).json({ message: msg });
  } catch (err) { console.error('group msg POST:', err.message); res.status(500).json({ error: 'server' }); }
});

// Apagar a própria mensagem (ou admin do grupo)
router.delete('/groups/:id/messages/:mid', authenticate, async (req, res) => {
  try {
    const { id: gid, mid } = req.params;
    if (!/^\d+$/.test(gid) || !/^\d+$/.test(mid)) return res.status(400).json({ error: 'bad_id' });
    const me = await membership(gid, req.user.id);
    if (!me) return res.status(403).json({ error: 'not_member' });
    const r = await db.query('SELECT sender_id FROM dm_group_messages WHERE id = $1 AND group_id = $2', [mid, gid]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    if (String(r.rows[0].sender_id) !== String(req.user.id) && me.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    await db.query('DELETE FROM dm_group_messages WHERE id = $1', [mid]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Mudar nome / foto (admin)
router.put('/groups/:id', authenticate, async (req, res) => {
  try {
    const gid = String(req.params.id);
    const me = /^\d+$/.test(gid) && await membership(gid, req.user.id);
    if (!me || me.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const name = req.body?.name !== undefined ? String(req.body.name).trim().slice(0, 80) : null;
    const avatar = req.body?.avatarUrl !== undefined ? (/^https:\/\//.test(String(req.body.avatarUrl)) ? String(req.body.avatarUrl) : null) : undefined;
    if (name) { await db.query('UPDATE dm_groups SET name = $2 WHERE id = $1', [gid, name]); await systemMessage(gid, `renamed|${req.user.full_name || ''}|${name}`); }
    if (avatar !== undefined) await db.query('UPDATE dm_groups SET avatar_url = $2 WHERE id = $1', [gid, avatar]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Adicionar pessoas (admin)
router.post('/groups/:id/members', authenticate, async (req, res) => {
  try {
    const gid = String(req.params.id);
    const me = /^\d+$/.test(gid) && await membership(gid, req.user.id);
    if (!me || me.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const ids = [...new Set((Array.isArray(req.body?.userIds) ? req.body.userIds : []).map(String).filter(isUuid))].slice(0, 100);
    const blockedMe = (await db.query('SELECT user_id FROM dm_blocks WHERE blocked_id = $1 AND user_id = ANY($2::uuid[])', [req.user.id, ids])).rows.map(r => String(r.user_id));
    const valid = (await db.query('SELECT id, full_name FROM users WHERE id = ANY($1::uuid[]) AND COALESCE(is_active, true)', [ids.filter(x => !blockedMe.includes(x))])).rows;
    for (const u of valid) {
      const ins = await db.query('INSERT INTO dm_group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [gid, u.id]);
      if (ins.rowCount) await systemMessage(gid, `added|${req.user.full_name || ''}|${u.full_name || ''}`);
    }
    res.json({ ok: true, added: valid.length });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

// Tirar alguém (admin) ou sair do grupo (o próprio)
router.delete('/groups/:id/members/:uid', authenticate, async (req, res) => {
  try {
    const gid = String(req.params.id);
    const target = req.params.uid === 'me' ? String(req.user.id) : String(req.params.uid);
    const me = /^\d+$/.test(gid) && await membership(gid, req.user.id);
    if (!me) return res.status(403).json({ error: 'not_member' });
    const self = target === String(req.user.id);
    if (!self && me.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const u = (await db.query('SELECT full_name FROM users WHERE id = $1', [target])).rows[0];
    const del = await db.query('DELETE FROM dm_group_members WHERE group_id = $1 AND user_id = $2', [gid, target]);
    if (del.rowCount) await systemMessage(gid, self ? `left|${u?.full_name || ''}` : `removed|${req.user.full_name || ''}|${u?.full_name || ''}`);
    // se o último admin saiu, o membro mais antigo passa a admin
    const admins = await db.query(`SELECT 1 FROM dm_group_members WHERE group_id = $1 AND role = 'admin'`, [gid]);
    if (!admins.rows.length) await db.query(`UPDATE dm_group_members SET role = 'admin' WHERE group_id = $1 AND user_id = (SELECT user_id FROM dm_group_members WHERE group_id = $1 ORDER BY joined_at LIMIT 1)`, [gid]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server' }); }
});

module.exports = router;
