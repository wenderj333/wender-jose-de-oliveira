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
    await db.query('ALTER TABLE reflection_entries ADD COLUMN IF NOT EXISTS reflection_date DATE NOT NULL DEFAULT CURRENT_DATE');
    await db.query('ALTER TABLE reflection_entries ADD COLUMN IF NOT EXISTS faith_step TEXT NOT NULL DEFAULT \'\'');
  } catch (error) {
    console.error('Reflection migration:', error.message);
  }
})();

router.get('/today', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, day, language, answers, faith_step, reflection_date, created_at
       FROM reflection_entries
       WHERE user_id = $1 AND reflection_date = CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    const dates = await db.query(
      `SELECT DISTINCT reflection_date FROM reflection_entries
       WHERE user_id = $1 AND reflection_date <= CURRENT_DATE
       ORDER BY reflection_date DESC`,
      [req.user.id]
    );
    const completedDates = new Set(dates.rows.map(row => String(row.reflection_date).slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    while (completedDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    res.json({ entry: result.rows[0] || null, streak, total: dates.rows.length });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível carregar o diário.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { answers, day, lang = 'pt', faithStep = '' } = req.body || {};
  if (!Array.isArray(answers) || !answers.some(answer => String(answer || '').trim())) {
    return res.status(400).json({ error: 'Escreve pelo menos uma resposta.' });
  }
  const dayNumber = Number(day);
  if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 6) {
    return res.status(400).json({ error: 'Dia inválido.' });
  }
  try {
    const cleanAnswers = JSON.stringify(answers.map(answer => String(answer || '').trim()));
    const existing = await db.query(
      `SELECT id FROM reflection_entries WHERE user_id = $1 AND reflection_date = CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    const result = existing.rows[0]
      ? await db.query(
        `UPDATE reflection_entries SET day = $1, language = $2, answers = $3, faith_step = $4, created_at = NOW()
         WHERE id = $5 RETURNING id, day, language, answers, faith_step, reflection_date, created_at`,
        [dayNumber, String(lang).slice(0, 10), cleanAnswers, String(faithStep || '').slice(0, 280), existing.rows[0].id]
      )
      : await db.query(
        `INSERT INTO reflection_entries (user_id, day, language, answers, faith_step)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, day, language, answers, faith_step, reflection_date, created_at`,
        [req.user.id, dayNumber, String(lang).slice(0, 10), cleanAnswers, String(faithStep || '').slice(0, 280)]
      );
    res.status(existing.rows[0] ? 200 : 201).json({ entry: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível guardar a reflexão.' });
  }
});

module.exports = router;
