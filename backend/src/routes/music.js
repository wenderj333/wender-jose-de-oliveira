const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

// GET all music (public)
router.get('/', async (req, res) => {
  try {
    const result = db.prepare('SELECT * FROM music ORDER BY created_at DESC').all();
    res.json({ songs: result });
  } catch (err) {
    console.error('Error fetching music:', err);
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  }
});

// POST new music (auth required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Título e URL são obrigatórios' });

    const result = db.prepare(
      'INSERT INTO music (user_id, title, artist, url, user_name) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).get(req.user.id, title, artist || 'Desconhecido', url, req.user.full_name || 'Anônimo');

    res.json({ song: result });
  } catch (err) {
    console.error('Error adding music:', err);
    res.status(500).json({ error: 'Erro ao adicionar música' });
  }
});

// DELETE music (own only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const song = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
    if (!song) return res.status(404).json({ error: 'Música não encontrada' });
    if (song.user_id !== req.user.id && req.user.role !== 'pastor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    db.prepare('DELETE FROM music WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting music:', err);
    res.status(500).json({ error: 'Erro ao deletar música' });
  }
});

module.exports = router;
