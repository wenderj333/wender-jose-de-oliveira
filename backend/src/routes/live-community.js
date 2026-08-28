const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const cloudinary = require('cloudinary').v2;
const { authenticate } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function ensureTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS live_community_users (user_id VARCHAR(100) PRIMARY KEY, room_id VARCHAR(10) NOT NULL DEFAULT 'pt', last_seen TIMESTAMP DEFAULT NOW())`);
  await db.query(`ALTER TABLE live_community_users ADD COLUMN IF NOT EXISTS room_id VARCHAR(10) NOT NULL DEFAULT 'pt'`);
  await db.query(`CREATE TABLE IF NOT EXISTS live_chat_history (id SERIAL PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(100), user_avatar TEXT, message TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await db.query(`ALTER TABLE live_chat_history ADD COLUMN IF NOT EXISTS room_id VARCHAR(10) NOT NULL DEFAULT 'pt'`);
  await db.query(`CREATE TABLE IF NOT EXISTS live_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    public_id TEXT NOT NULL UNIQUE,
    secure_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '2 days'
  )`);
}
ensureTables().catch(console.error);

async function cleanupExpiredRecordings() {
  if (!process.env.CLOUDINARY_API_SECRET) return;
  const expired = await db.query(`SELECT id, public_id FROM live_recordings WHERE expires_at <= NOW() LIMIT 25`);
  for (const recording of expired.rows) {
    try {
      await cloudinary.uploader.destroy(recording.public_id, { resource_type: 'video', invalidate: true });
      await db.query('DELETE FROM live_recordings WHERE id = $1', [recording.id]);
    } catch (error) { console.error('Live recording cleanup:', error.message); }
  }
}
setInterval(() => cleanupExpiredRecordings().catch(console.error), 60 * 60 * 1000).unref();
cleanupExpiredRecordings().catch(console.error);

router.get('/playlist', async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, artist, url AS file_url, cover_url FROM music WHERE is_public = true ORDER BY RANDOM() LIMIT 50');
    res.json({ songs: result.rows });
  } catch (err) { res.status(500).json({ error: 'Erro' }); }
});

router.get('/stats', async (req, res) => {
  try {
    const roomId = String(req.query.roomId || 'pt').slice(0, 10);
    await db.query(`DELETE FROM live_community_users WHERE last_seen < NOW() - INTERVAL '10 minutes'`);
    const r = await db.query('SELECT COUNT(*) FROM live_community_users WHERE room_id = $1', [roomId]);
    res.json({ onlineCount: parseInt(r.rows[0].count) });
  } catch (err) { res.json({ onlineCount: 0 }); }
});

router.post('/join', async (req, res) => {
  const { userId, roomId } = req.body;
  try {
    const room = String(roomId || 'pt').slice(0, 10);
    if (userId) await db.query(`INSERT INTO live_community_users (user_id, room_id, last_seen) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET room_id = EXCLUDED.room_id, last_seen = NOW()`, [userId, room]);
    await db.query(`DELETE FROM live_community_users WHERE last_seen < NOW() - INTERVAL '10 minutes'`);
    const r = await db.query('SELECT COUNT(*) FROM live_community_users WHERE room_id = $1', [room]);
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
    const roomId = String(req.query.roomId || 'pt').slice(0, 10);
    const r = await db.query(`SELECT user_id as "userId", user_name as "userName", user_avatar as "userAvatar", message as text, created_at as time FROM live_chat_history WHERE room_id = $1 ORDER BY created_at DESC LIMIT 50`, [roomId]);
    res.json({ messages: r.rows.reverse() });
  } catch (err) { res.json({ messages: [] }); }
});

router.post('/history', async (req, res) => {
  const { roomId, userId, userName, userAvatar, message } = req.body;
  try {
    await db.query(`INSERT INTO live_chat_history (room_id, user_id, user_name, user_avatar, message) VALUES ($1, $2, $3, $4, $5)`, [String(roomId || 'pt').slice(0, 10), userId, userName, userAvatar, message]);
    await db.query(`DELETE FROM live_chat_history WHERE id NOT IN (SELECT id FROM live_chat_history ORDER BY created_at DESC LIMIT 200)`);
    res.json({ ok: true });
  } catch (err) { res.json({ ok: false }); }
});


router.post('/start', authenticate, async (req, res) => {
  const { userName, userAvatar, title } = req.body;
  const userId = req.user.id;
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS active_lives (id SERIAL PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(100), user_avatar TEXT, title TEXT, started_at TIMESTAMP DEFAULT NOW())`);
    await db.query(`DELETE FROM active_lives WHERE user_id = $1`, [userId]);
    await db.query(`INSERT INTO active_lives (user_id, user_name, user_avatar, title) VALUES ($1, $2, $3, $4)`, [userId, userName, userAvatar, title || 'Live ao Vivo']);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Erro' }); }
});

router.post('/stop', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(`DELETE FROM active_lives WHERE user_id = $1`, [userId]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Erro' }); }
});

router.get('/recording-signature', authenticate, (req, res) => {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ error: 'Gravação temporariamente indisponível.' });
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'sigo-com-fe/live-recordings';
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  res.json({ timestamp, folder, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});

router.post('/recordings', authenticate, async (req, res) => {
  try {
    const { publicId, secureUrl } = req.body;
    if (!publicId || !String(publicId).startsWith('sigo-com-fe/live-recordings/') || !secureUrl || !String(secureUrl).startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ error: 'Gravação inválida.' });
    }
    const result = await db.query(`INSERT INTO live_recordings (user_id, public_id, secure_url)
      VALUES ($1, $2, $3) ON CONFLICT (public_id) DO NOTHING
      RETURNING id, secure_url, expires_at`, [req.user.id, publicId, secureUrl]);
    res.status(201).json({ recording: result.rows[0] || null, retentionHours: 48 });
  } catch (err) { res.status(500).json({ error: 'Não foi possível guardar a gravação.' }); }
});

router.get('/active', async (req, res) => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS active_lives (id SERIAL PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(100), user_avatar TEXT, title TEXT, started_at TIMESTAMP DEFAULT NOW())`);
    await db.query(`DELETE FROM active_lives WHERE started_at < NOW() - INTERVAL '4 hours'`);
    const r = await db.query(`SELECT * FROM active_lives ORDER BY started_at DESC LIMIT 1`);
    res.json({ live: r.rows[0] || null });
  } catch (err) { res.json({ live: null }); }
});
module.exports = router;
