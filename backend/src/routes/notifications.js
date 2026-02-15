const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await db.prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
    ).all(req.user.id);
    res.json({ notifications });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const r = await db.prepare(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = false`
    ).get(req.user.id);
    // Also count unread direct messages
    const dm = await db.prepare(
      `SELECT COUNT(*) AS count FROM direct_messages WHERE receiver_id = ? AND is_read = false`
    ).get(req.user.id);
    res.json({ count: parseInt(r?.count || 0) + parseInt(dm?.count || 0) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await db.prepare(`UPDATE notifications SET is_read = true WHERE user_id = ?`).run(req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/:id/read
router.post('/:id/read', authenticate, async (req, res) => {
  try {
    await db.prepare(`UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
