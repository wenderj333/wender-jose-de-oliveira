const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { authenticate, requireRole, JWT_SECRET } = require('../middleware/auth');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Auto-migration
(async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS chat_rooms (
      id SERIAL PRIMARY KEY, requester_name VARCHAR(100),
      requester_language VARCHAR(10) DEFAULT 'pt',
      pastor_language VARCHAR(10) DEFAULT 'pt',
      help_type VARCHAR(50), status VARCHAR(20) DEFAULT 'waiting',
      target_church_id INTEGER, created_at TIMESTAMP DEFAULT NOW()
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY, room_id INTEGER, sender VARCHAR(50),
      original_text TEXT, translated_text TEXT,
      sender_language VARCHAR(10), created_at TIMESTAMP DEFAULT NOW()
    )`);
    // Chave secreta de cada conversa (só quem pediu ajuda a conhece) e o pastor que a atendeu
    await db.query('ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS access_key TEXT');
    await db.query('ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS pastor_id UUID');
    console.log('Chat tables ready');
  } catch(e) { console.error('Chat migration:', e.message); }
})();

// Traduzir mensagem
async function translateMessage(text, fromLang, toLang) {
  if (fromLang === toLang) return text;
  try {
    const langNames = { pt: 'Portuguese', en: 'English', de: 'German', fr: 'French', es: 'Spanish', ro: 'Romanian', ru: 'Russian' };
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 500,
      messages: [{ role: 'user', content: `Translate this text from ${langNames[fromLang] || fromLang} to ${langNames[toLang] || toLang}. Return ONLY the translation, nothing else:\n\n${text}` }]
    });
    return msg.content[0].text;
  } catch(e) { return text; }
}

// Quem pode ver/escrever numa conversa: quem tem a chave, o pastor que a atende, ou um admin
async function roomAccess(req, roomId) {
  const r = await db.query('SELECT * FROM chat_rooms WHERE id = $1', [roomId]);
  const room = r.rows[0];
  if (!room) return { room: null, ok: false };
  const key = String(req.query.key || req.body?.key || req.headers['x-chat-key'] || '');
  if (room.access_key && key && key === room.access_key) return { room, ok: true, as: 'requester' };
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    try {
      const d = jwt.verify(h.slice(7), JWT_SECRET);
      const u = await db.query('SELECT id, role FROM users WHERE id = $1', [d.id]);
      const user = u.rows[0];
      if (user && (user.role === 'admin' || (user.role === 'pastor' && (!room.pastor_id || String(room.pastor_id) === String(user.id))))) return { room, ok: true, as: 'pastor', user };
    } catch (_) { /* token inválido */ }
  }
  return { room, ok: false };
}
const publicRoom = (room) => { if (!room) return room; const { access_key, ...rest } = room; return rest; };

// POST /api/chat/request
router.post('/request', async (req, res) => {
  try {
    const { language = 'pt', name, helpType, churchId } = req.body || {};
    const key = crypto.randomBytes(18).toString('hex');
    const r = await db.query(
      `INSERT INTO chat_rooms (requester_name, requester_language, help_type, target_church_id, access_key) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [String(name || 'Anonimo').slice(0, 100), String(language).slice(0, 10), String(helpType || 'general').slice(0, 50), Number.isInteger(churchId) ? churchId : null, key]
    );
    res.json({ success: true, roomId: r.rows[0].id, key, room: publicRoom(r.rows[0]) });
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// GET /api/chat/rooms
router.get('/rooms', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const r = await db.query(`SELECT * FROM chat_rooms WHERE status='waiting' ORDER BY created_at DESC LIMIT 100`);
    res.json(r.rows.map(publicRoom));
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

router.get('/churches-online', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM churches ORDER BY name ASC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar igrejas.' });
  }
});

router.post('/rooms/:roomId/join', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const { language = 'pt' } = req.body || {};
    const result = await db.query(
      "UPDATE chat_rooms SET status = 'active', pastor_language = $1, pastor_id = $3 WHERE id = $2 AND status = 'waiting' RETURNING *",
      [String(language).slice(0, 10), req.params.roomId, req.user.id]
    );
    if (!result.rows[0]) return res.status(409).json({ error: 'Esta conversa já foi atendida por outro pastor.', code: 'taken' });
    res.json({ room: publicRoom(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao entrar na sala.' });
  }
});

router.post('/rooms/:roomId/close', async (req, res) => {
  try {
    const acc = await roomAccess(req, req.params.roomId);
    if (!acc.room) return res.status(404).json({ error: 'Sala não encontrada.' });
    if (!acc.ok) return res.status(403).json({ error: 'forbidden' });
    const result = await db.query("UPDATE chat_rooms SET status = 'closed' WHERE id = $1 RETURNING *", [req.params.roomId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Sala não encontrada.' });
    res.json({ room: publicRoom(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao encerrar a sala.' });
  }
});

// GET /api/chat/rooms/:roomId/messages
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const acc = await roomAccess(req, req.params.roomId);
    if (!acc.ok) return res.status(403).json({ error: 'forbidden' });
    const r = await db.query(`SELECT * FROM chat_messages WHERE room_id=$1 ORDER BY created_at ASC`, [req.params.roomId]);
    res.json(r.rows);
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// POST /api/chat/rooms/:roomId/messages
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const acc = await roomAccess(req, req.params.roomId);
    if (!acc.ok) return res.status(403).json({ error: 'forbidden' });
    const { sender, text, senderLanguage, recipientLanguage } = req.body;
    const translated = await translateMessage(text, senderLanguage || 'pt', recipientLanguage || 'pt');
    const r = await db.query(
      `INSERT INTO chat_messages (room_id, sender, original_text, translated_text, sender_language) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.roomId, sender, text, translated, senderLanguage || 'pt']
    );
    res.json({ message: r.rows[0] });
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// PATCH /api/chat/rooms/:roomId/status
router.patch('/rooms/:roomId/status', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const { status, pastorLanguage } = req.body;
    await db.query(`UPDATE chat_rooms SET status=$1, pastor_language=$2 WHERE id=$3`, [status, pastorLanguage || 'pt', req.params.roomId]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

module.exports = router;
