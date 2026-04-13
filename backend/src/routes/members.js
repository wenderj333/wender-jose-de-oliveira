const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.display_name, u.avatar_url, u.role, u.is_active, u.last_seen_at, u.created_at, f.status AS friendship_status FROM users u LEFT JOIN friendships f ON (f.requester_id = $1 AND f.addressee_id = u.id) OR (f.addressee_id = $1 AND f.requester_id = u.id) ORDER BY u.created_at DESC`,
      [req.user.id]
    );
    res.json({ members: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pastors', authenticate, async (req, res) => {
  try {
    const result = await db.query(`SELECT u.id, u.full_name FROM users u WHERE u.role = 'pastor' AND u.is_active = true ORDER BY u.full_name ASC`);
    res.json({ pastors: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/:userId', authenticate, async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM direct_messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC LIMIT 100`, [req.user.id, req.params.userId]);
    res.json({ messages: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ error: 'Campos obrigatorios' });
    const result = await db.query(`INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`, [req.user.id, receiverId, content.trim()]);
    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
