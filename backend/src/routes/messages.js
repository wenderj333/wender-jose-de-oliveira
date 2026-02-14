const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/messages/conversations — list all conversations for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await db.prepare(`
      SELECT
        CASE WHEN dm.sender_id = ? THEN dm.receiver_id ELSE dm.sender_id END AS other_id,
        u.full_name AS other_name,
        u.avatar_url AS other_avatar,
        dm.content AS last_content,
        dm.created_at AS last_at,
        (SELECT COUNT(*) FROM direct_messages dm2
         WHERE dm2.sender_id = CASE WHEN dm.sender_id = ? THEN dm.receiver_id ELSE dm.sender_id END
         AND dm2.receiver_id = ? AND dm2.is_read = false) AS unread
      FROM direct_messages dm
      JOIN users u ON u.id = CASE WHEN dm.sender_id = ? THEN dm.receiver_id ELSE dm.sender_id END
      WHERE dm.id IN (
        SELECT DISTINCT ON (
          LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
        ) id
        FROM direct_messages
        WHERE sender_id = ? OR receiver_id = ?
        ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC
      )
      ORDER BY dm.created_at DESC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);
    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:userId — get messages with a specific user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const messages = await db.prepare(
      `SELECT * FROM direct_messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC LIMIT 200`
    ).all(req.user.id, req.params.userId, req.params.userId, req.user.id);

    // Mark as read
    await db.prepare(
      `UPDATE direct_messages SET is_read = true
       WHERE sender_id = ? AND receiver_id = ? AND is_read = false`
    ).run(req.params.userId, req.user.id);

    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages — send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'receiverId e content são obrigatórios' });
    }
    const msg = await db.prepare(
      `INSERT INTO direct_messages (sender_id, receiver_id, content)
       VALUES (?, ?, ?) RETURNING *`
    ).get(req.user.id, receiverId, content.trim());
    res.status(201).json({ message: msg });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
