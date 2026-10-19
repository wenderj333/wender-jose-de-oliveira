const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Chat público da Oração Mundial: uma conversa para todas as pessoas.
// O nome e a foto vêm sempre da conta (não do navegador), para ninguém se fazer passar por outro.

let ready = null;
function ensureTable() {
  if (!ready) {
    ready = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS prayer_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        user_name VARCHAR(255),
        user_avatar TEXT,
        text TEXT NOT NULL,
        reply_to BIGINT,
        reply_name VARCHAR(255),
        reply_text VARCHAR(160),
        deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await db.query('CREATE INDEX IF NOT EXISTS prayer_chat_messages_created_idx ON prayer_chat_messages (created_at DESC)');
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}
setTimeout(() => ensureTable().then(() => console.log('Prayer chat table ready')).catch(() => {}), 4000);
router.use(async (req, res, next) => { try { await ensureTable(); } catch (_) {} next(); });

const FIELDS = `id, user_id AS "userId", user_name AS "userName", user_avatar AS "userAvatar", text, reply_to AS "replyTo", reply_name AS "replyName", reply_text AS "replyText", created_at AS "time"`;
const shape = (r) => ({ ...r, id: String(r.id), replyTo: r.replyTo ? String(r.replyTo) : null, userId: String(r.userId) });
const broadcast = (payload) => { try { require('../websocket').broadcastAll(payload); } catch (_) {} };

// Últimas mensagens (ou só as novas depois de ?after=id)
router.get('/', async (req, res) => {
  try {
    const after = /^\d+$/.test(String(req.query.after || '')) ? String(req.query.after) : null;
    const rows = after
      ? (await db.query(`SELECT ${FIELDS} FROM prayer_chat_messages WHERE deleted = false AND id > $1 ORDER BY id ASC LIMIT 100`, [after])).rows
      : (await db.query(`SELECT * FROM (SELECT ${FIELDS} FROM prayer_chat_messages WHERE deleted = false ORDER BY id DESC LIMIT 80) t ORDER BY id ASC`)).rows;
    res.json({ messages: rows.map(shape) });
  } catch (err) {
    console.error('prayer-chat GET:', err.message);
    res.json({ messages: [] });
  }
});

// Limite simples por pessoa: 1 mensagem a cada 2 s e no máximo 15 por minuto
const recent = new Map();
function tooFast(userId) {
  const now = Date.now();
  const list = (recent.get(userId) || []).filter((t) => now - t < 60000);
  if (list.length && now - list[list.length - 1] < 2000) return true;
  if (list.length >= 15) return true;
  list.push(now); recent.set(userId, list);
  if (recent.size > 5000) recent.clear();
  return false;
}

router.post('/', authenticate, async (req, res) => {
  try {
    const text = String(req.body?.text || '').replace(/\s+\n/g, '\n').trim().slice(0, 500);
    if (!text) return res.status(400).json({ error: 'empty' });
    if (tooFast(String(req.user.id))) return res.status(429).json({ error: 'slow_down' });
    let reply = null;
    if (/^\d+$/.test(String(req.body?.replyTo || ''))) {
      const r = await db.query('SELECT id, user_name, text FROM prayer_chat_messages WHERE id = $1 AND deleted = false', [String(req.body.replyTo)]);
      if (r.rows[0]) reply = r.rows[0];
    }
    const ins = await db.query(
      `INSERT INTO prayer_chat_messages (user_id, user_name, user_avatar, text, reply_to, reply_name, reply_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${FIELDS}`,
      [req.user.id, req.user.full_name || 'Irmão', req.user.avatar_url || null, text, reply ? reply.id : null, reply ? reply.user_name : null, reply ? String(reply.text).slice(0, 150) : null]
    );
    const message = shape(ins.rows[0]);
    broadcast({ type: 'prayer_chat_new', message });
    if (Math.random() < 0.02) db.query(`DELETE FROM prayer_chat_messages WHERE id < (SELECT COALESCE(MAX(id), 0) - 5000 FROM prayer_chat_messages)`).catch(() => {});
    res.json({ message });
  } catch (err) {
    console.error('prayer-chat POST:', err.message);
    res.status(500).json({ error: 'server' });
  }
});

// Apagar: o autor da mensagem ou um administrador
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!/^\d+$/.test(String(req.params.id))) return res.status(400).json({ error: 'bad_id' });
    const r = await db.query('SELECT user_id FROM prayer_chat_messages WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    const isAdmin = ['admin', 'moderator'].includes(String(req.user.role));
    if (String(r.rows[0].user_id) !== String(req.user.id) && !isAdmin) return res.status(403).json({ error: 'forbidden' });
    await db.query('UPDATE prayer_chat_messages SET deleted = true WHERE id = $1', [req.params.id]);
    broadcast({ type: 'prayer_chat_del', id: String(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    console.error('prayer-chat DELETE:', err.message);
    res.status(500).json({ error: 'server' });
  }
});

module.exports = router;
