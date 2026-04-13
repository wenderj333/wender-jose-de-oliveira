const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/live-community/playlist
router.get('/playlist', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, artist, url AS file_url, cover_url FROM music WHERE is_public = true ORDER BY RANDOM() LIMIT 50'
    );
    res.json({ songs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar playlist' });
  }
});

// Rastrear usuarios com timestamp
let liveUsers = new Map(); // userId -> lastSeen timestamp

// GET /api/live-community/stats
router.get('/stats', async (req, res) => {
  res.json({ onlineCount: liveUsers.size });
});

// POST /api/live-community/join
router.post('/join', async (req, res) => {
  const { userId } = req.body;
  if (userId) {
    liveUsers.set(userId, Date.now());
    console.log(`User ${userId} joined. Online: ${liveUsers.size}`);
  }
  res.json({ onlineCount: liveUsers.size });
});

// POST /api/live-community/leave
router.post('/leave', async (req, res) => {
  const { userId } = req.body;
  if (userId) {
    liveUsers.delete(userId);
    console.log(`User ${userId} left. Online: ${liveUsers.size}`);
  }
  res.json({ onlineCount: liveUsers.size });
});

// Limpar usuarios inativos ha mais de 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [userId, lastSeen] of liveUsers.entries()) {
    if (now - lastSeen > 10 * 60 * 1000) {
      liveUsers.delete(userId);
      console.log(`Removed inactive user: ${userId}`);
    }
  }
  console.log(`Online users: ${liveUsers.size}`);
}, 2 * 60 * 1000);

module.exports = router;
