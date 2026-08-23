const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

(async () => {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await db.query(`CREATE TABLE IF NOT EXISTS diary_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT NOT NULL,
      feeling TEXT,
      prayer TEXT,
      verse TEXT,
      is_private BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await db.query('CREATE INDEX IF NOT EXISTS idx_diary_entries_user_created ON diary_entries(user_id, created_at DESC)');
  } catch (error) {
    console.error('Diary migration:', error.message);
  }
})();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, content, feeling, prayer, verse, is_private, created_at FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ entries: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível carregar o diário.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title = '', content, feeling = '', prayer = '', verse = '', isPrivate = true } = req.body || {};
  if (!String(content || '').trim()) return res.status(400).json({ error: 'O texto do diário é obrigatório.' });
  try {
    const result = await db.query(
      `INSERT INTO diary_entries (user_id, title, content, feeling, prayer, verse, is_private)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, content, feeling, prayer, verse, is_private, created_at`,
      [req.user.id, String(title).trim() || null, String(content).trim(), String(feeling).trim() || null, String(prayer).trim() || null, String(verse).trim() || null, Boolean(isPrivate)]
    );
    res.status(201).json({ entry: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível guardar o diário.' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM diary_entries WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Entrada não encontrada.' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível apagar a entrada.' });
  }
});

module.exports = router;
