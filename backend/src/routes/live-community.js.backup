const express = require('express');
const router = express.Router();
const db = require('../db/connection');

async function ensureTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS live_community_users (user_id VARCHAR(100) PRIMARY KEY, last_seen TIMESTAMP DEFAULT NOW())`);
  await db.query(`CREATE TABLE IF NOT EXISTS live_chat_history (id SERIAL PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(100), user_avatar TEXT, message TEXT, created_at TIMESTAMP DEFAULT NOW())`);
}
ensureTables().catch(console.error);

router.get('/playlist', async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, artist, url AS file_url, cover_url FROM music WHERE is_public = true ORDER BY RANDOM() LIMIT 50');
    res.json({ songs: result.rows });
  } catch (err) { res.status(500).json({ error: 'Erro' }); }
});

router.get('/stats', async (req, res) => {
  try {
    await db.query(`DELETE FROM live_community_users WHERE last_seen < NOW() - INTERVAL '10 minutes'`);
    const r = await db.query('SELECT COUNT(*) FROM live_community_users');
    res.json({ onlineCount: parseInt(r.rows[0].count) });
  } catch (err) { res.json({ onlineCount: 0 }); }
});

router.post('/join', async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) await db.query(`INSERT INTO live_community_users (user_id, last_seen) VALUES ($1, NOW()) ON CONFLICT (user_id) DO UPDATE SET last_seen = NOW()`, [userId]);
    await db.query(`DELETE FROM live_community_users WHERE last_seen < NOW() - INTERVAL '10 minutes'`);
    const r = await db.query('SELECT COUNT(*) FROM live_community_users');
    res.json({ onlineCount: parseInt(r.rows[0].count) });
  } catch (err) { res.json({ onlineCount: 0 }); }
});

router.post('/leave', async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) await db.query('DELETE FROM live_community_users WHERE user_id = $1', [userId]);
    const r = await db.query('SELECT COUNT(*) FROM live_community_users');
    res.json({ onlineCount: parseInt(r.rows[0].count) });
  } catch (err) { res.json({ onlineCount: 0 }); }
});

router.get('/history', async (req, res) => {
  try {
    const r = await db.query(`SELECT user_id as "userId", user_name as "userName", user_avatar as "userAvatar", message as text, created_at as time FROM live_chat_history ORDER BY created_at DESC LIMIT 50`);
    res.json({ messages: r.rows.reverse() });
  } catch (err) { res.json({ messages: [] }); }
});

router.post('/history', async (req, res) => {
  const { userId, userName, userAvatar, message } = req.body;
  try {
    await db.query(`INSERT INTO live_chat_history (user_id, user_name, user_avatar, message) VALUES ($1, $2, $3, $4)`, [userId, userName, userAvatar, message]);
    await db.query(`DELETE FROM live_chat_history WHERE id NOT IN (SELECT id FROM live_chat_history ORDER BY created_at DESC LIMIT 200)`);
    res.json({ ok: true });
  } catch (err) { res.json({ ok: false }); }
});

module.exports = router;
