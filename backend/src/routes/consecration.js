const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/consecration/stats — total consecrations + who is fasting now
router.get('/stats', async (req, res) => {
  try {
    const total = await db.prepare('SELECT COUNT(*) AS count FROM consecrations').get();
    const today = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) AS count FROM consecrations WHERE created_at >= CURRENT_DATE`
    ).get();
    const recent = await db.prepare(
      `SELECT c.id, u.full_name, u.avatar_url, c.created_at FROM consecrations c
       JOIN users u ON u.id = c.user_id ORDER BY c.created_at DESC LIMIT 20`
    ).all();
    res.json({
      totalConsecrations: parseInt(total?.count || 0),
      todayFasting: parseInt(today?.count || 0),
      recent,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/consecration — register consecration
router.post('/', authenticate, async (req, res) => {
  try {
    const { purpose } = req.body;
    const c = await db.prepare(
      `INSERT INTO consecrations (user_id, purpose) VALUES (?, ?) RETURNING *`
    ).get(req.user.id, purpose || 'Consagração e jejum');
    res.status(201).json({ consecration: c });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
