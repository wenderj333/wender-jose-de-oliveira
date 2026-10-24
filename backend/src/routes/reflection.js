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
    // Datas como texto (YYYY-MM-DD): o driver devolve DATE como objeto Date, e a comparação antiga nunca coincidia
    const dates = await db.query(
      `SELECT DISTINCT to_char(reflection_date, 'YYYY-MM-DD') AS d FROM reflection_entries
       WHERE user_id = $1 AND reflection_date <= CURRENT_DATE
       ORDER BY 1 DESC`,
      [req.user.id]
    );
    const todayRow = await db.query(`SELECT to_char(CURRENT_DATE, 'YYYY-MM-DD') AS d`);
    const completedDates = new Set(dates.rows.map(row => row.d));
    let streak = 0;
    const cursor = new Date(todayRow.rows[0].d + 'T12:00:00Z');
    // Se hoje ainda não refletiu, a sequência conta a partir de ontem (não se perde de manhã)
    if (!completedDates.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (completedDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    const week = dates.rows.slice(0, 14).map(row => row.d);
    res.json({ entry: result.rows[0] || null, streak, total: dates.rows.length, today: todayRow.rows[0].d, recent: week });
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

// GET /api/reflection/history — diário espiritual: reflexões anteriores (mais recentes primeiro)
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const before = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.before || '')) ? String(req.query.before) : null;
    const result = await db.query(
      `SELECT id, day, language, answers, faith_step, to_char(reflection_date, 'YYYY-MM-DD') AS date, created_at
         FROM reflection_entries
        WHERE user_id = $1 AND ($2::date IS NULL OR reflection_date < $2::date)
        ORDER BY reflection_date DESC, created_at DESC
        LIMIT $3`, [req.user.id, before, limit]);
    res.set('Cache-Control', 'no-store');
    res.json({ entries: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'history' });
  }
});

// DELETE /api/reflection/:id — apagar uma reflexão do próprio diário
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'not_found' });
    const r = await db.query('DELETE FROM reflection_entries WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json({ deleted: true });
  } catch (error) { res.status(500).json({ error: 'delete' }); }
});

module.exports = router;
