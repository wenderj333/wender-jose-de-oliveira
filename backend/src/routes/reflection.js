const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

(async () => {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await db.query(`CREATE TABLE IF NOT EXISTS reflection_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day SMALLINT NOT NULL,
      language VARCHAR(10) NOT NULL DEFAULT 'pt',
      answers JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  } catch (error) {
    console.error('Reflection migration:', error.message);
  }
})();

router.post('/', authenticate, async (req, res) => {
  const { answers, day, lang = 'pt' } = req.body || {};
  if (!Array.isArray(answers) || !answers.some(answer => String(answer || '').trim())) {
    return res.status(400).json({ error: 'Escreve pelo menos uma resposta.' });
  }
  const dayNumber = Number(day);
  if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 6) {
    return res.status(400).json({ error: 'Dia inválido.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO reflection_entries (user_id, day, language, answers) VALUES ($1, $2, $3, $4) RETURNING id, day, language, answers, created_at',
      [req.user.id, dayNumber, String(lang).slice(0, 10), JSON.stringify(answers.map(answer => String(answer || '').trim()))]
    );
    res.status(201).json({ entry: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível guardar a reflexão.' });
  }
});

module.exports = router;
