const express = require('express');
const router = express.Router();
const { pool } = require('../config/connection');

// GET /api/live-community/playlist - obter músicas para tocar
router.get('/playlist', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, artist, file_url, cover_url FROM music WHERE is_public = true ORDER BY RANDOM() LIMIT 50'
    );
    res.json({ songs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar playlist' });
  }
});

// GET /api/live-community/stats - estatísticas (online count)
router.get('/stats', async (req, res) => {
  // Por agora retornar mock — WebSocket vai contar real depois
  res.json({ onlineCount: Math.floor(Math.random() * 200) + 50 });
});

module.exports = router;
