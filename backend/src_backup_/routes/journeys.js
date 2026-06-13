const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Auto-migrate
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS journey_responses (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        journey_id TEXT NOT NULL,
        day_index INTEGER NOT NULL,
        response_text TEXT NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[journeys] Table ready');
  } catch (e) { console.error('[journeys] Migration error:', e.message); }
})();

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    const jwt = require('jsonwebtoken');
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// POST /api/journeys/respond — save a response
router.post('/respond', auth, async (req, res) => {
  try {
    const { journeyId, dayIndex, responseText, isPublic } = req.body;
    if (!journeyId || !dayIndex || !responseText?.trim()) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Upsert — one response per user per journey per day
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_resp_unique
      ON journey_responses(user_id, journey_id, day_index)
    `).catch(() => {});

    // Delete existing then insert
    const delStmt = db.prepare('DELETE FROM journey_responses WHERE user_id = ? AND journey_id = ? AND day_index = ?');
    await delStmt.run(req.user.id, journeyId, dayIndex);

    const stmt = db.prepare('INSERT INTO journey_responses (user_id, journey_id, day_index, response_text, is_public) VALUES (?, ?, ?, ?, ?)');
    await stmt.run(req.user.id, journeyId, dayIndex, responseText.trim(), isPublic ? true : false);

    res.json({ success: true });
  } catch (e) {
    console.error('[journeys] respond error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/journeys/my?journeyId=X — get my responses for a journey
router.get('/my', auth, async (req, res) => {
  try {
    const { journeyId } = req.query;
    const stmt = db.prepare('SELECT day_index, response_text, is_public FROM journey_responses WHERE user_id = ? AND journey_id = ? ORDER BY day_index');
    const rows = await stmt.all(req.user.id, journeyId);
    res.json(rows);
  } catch (e) {
    console.error('[journeys] my error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/journeys/public?journeyId=X&dayIndex=Y — get public responses for a day
router.get('/public', async (req, res) => {
  try {
    const { journeyId, dayIndex } = req.query;
    const stmt = db.prepare(`
      SELECT jr.response_text, jr.created_at, u.name as user_name
      FROM journey_responses jr
      LEFT JOIN users u ON u.id = jr.user_id
      WHERE jr.journey_id = ? AND jr.day_index = ? AND jr.is_public = true
      ORDER BY jr.created_at DESC
      LIMIT 20
    `);
    const rows = await stmt.all(journeyId, parseInt(dayIndex));
    res.json(rows);
  } catch (e) {
    console.error('[journeys] public error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
