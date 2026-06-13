const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const Anthropic = require('@anthropic-ai/sdk');

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

// POST /api/chat/request
router.post('/request', async (req, res) => {
  try {
    const { language = 'pt', name, helpType, churchId } = req.body;
    const r = await db.query(
      `INSERT INTO chat_rooms (requester_name, requester_language, help_type, target_church_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name || 'Anonimo', language, helpType || 'general', churchId || null]
    );
    res.json({ success: true, roomId: r.rows[0].id, room: r.rows[0] });
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// GET /api/chat/rooms
router.get('/rooms', async (req, res) => {
  try {
    const r = await db.query(`SELECT * FROM chat_rooms WHERE status='waiting' ORDER BY created_at DESC`);
    res.json(r.rows);
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// GET /api/chat/rooms/:roomId/messages
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const r = await db.query(`SELECT * FROM chat_messages WHERE room_id=$1 ORDER BY created_at ASC`, [req.params.roomId]);
    res.json(r.rows);
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

// POST /api/chat/rooms/:roomId/messages
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
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
router.patch('/rooms/:roomId/status', async (req, res) => {
  try {
    const { status, pastorLanguage } = req.body;
    await db.query(`UPDATE chat_rooms SET status=$1, pastor_language=$2 WHERE id=$3`, [status, pastorLanguage || 'pt', req.params.roomId]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: 'Erro' }); }
});

module.exports = router;
