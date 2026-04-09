const express = require('express');
const router = express.Router();
const { pool } = require('../config/connection');

// GET /api/live-community/playlist - obter músicas para tocar
router.get('/playlist', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, artist, url AS file_url, cover_url FROM music WHERE is_public = true ORDER BY RANDOM() LIMIT 50'
    );
    console.log(`✅ Live Community: ${result.rows.length} músicas públicas encontradas`);
    res.json({ songs: result.rows });
  } catch (err) {
    console.error('❌ Erro ao carregar playlist:', err);
    res.status(500).json({ error: 'Erro ao carregar playlist' });
  }
});

// Rastrear usuários online (em memória)
let liveUsers = new Set();

// GET /api/live-community/stats - estatísticas (online count)
router.get('/stats', async (req, res) => {
  res.json({ onlineCount: liveUsers.size });
});

// POST /api/live-community/join - marcar como online
router.post('/join', async (req, res) => {
  const { userId } = req.body;
  if (userId) {
    liveUsers.add(userId);
    console.log(`✅ User ${userId} joined live community. Online: ${liveUsers.size}`);
  }
  res.json({ onlineCount: liveUsers.size });
});

// POST /api/live-community/leave - marcar como offline
router.post('/leave', async (req, res) => {
  const { userId } = req.body;
  if (userId) {
    liveUsers.delete(userId);
    console.log(`👋 User ${userId} left live community. Online: ${liveUsers.size}`);
  }
  res.json({ onlineCount: liveUsers.size });
});

// Limpar usuários inativos a cada 5 minutos
setInterval(() => {
  if (liveUsers.size > 0) {
    console.log(`🧹 Cleaning inactive users. Before: ${liveUsers.size}`);
    liveUsers.clear(); // Simples: limpa tudo (em produção, rastrear timestamps)
  }
}, 5 * 60 * 1000);

module.exports = router;
