const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/consecration/stats — total + currently fasting count (anonymous)
router.get('/stats', async (req, res) => {
  try {
    const total = await db.prepare('SELECT COUNT(*) AS count FROM consecrations').get();
    const active = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) AS count FROM consecrations WHERE created_at >= CURRENT_DATE`
    ).get();
    res.json({
      totalConsecrations: parseInt(total?.count || 0),
      activeFasting: parseInt(active?.count || 0),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/consecration/status — check if current user is fasting today
router.get('/status', authenticate, async (req, res) => {
  try {
    const row = await db.prepare(
      `SELECT id FROM consecrations WHERE user_id = ? AND created_at >= CURRENT_DATE LIMIT 1`
    ).get(req.user.id);
    res.json({ active: !!row });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/consecration/toggle — toggle consecration on/off for today
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const existing = await db.prepare(
      `SELECT id FROM consecrations WHERE user_id = ? AND created_at >= CURRENT_DATE LIMIT 1`
    ).get(req.user.id);

    if (existing) {
      // Deactivate - remove today's consecration
      await db.prepare(`DELETE FROM consecrations WHERE id = ?`).run(existing.id);
      res.json({ active: false });
    } else {
      // Activate - create new consecration
      await db.prepare(
        `INSERT INTO consecrations (user_id, purpose) VALUES (?, ?)`
      ).run(req.user.id, 'Consagração e jejum');
      res.json({ active: true });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
