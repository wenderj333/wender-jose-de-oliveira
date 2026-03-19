const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// ─── GET /api/messages/conversations ─────────────────────────────────────────
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const uid = req.user.id;
    const result = await db.query(`
      SELECT DISTINCT ON (other_id)
        other_id,
        other_name,
        other_avatar,
        last_content,
        last_at,
        unread
      FROM (
        SELECT
          CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END AS other_id,
          u.full_name AS other_name,
          u.avatar_url AS other_avatar,
          dm.content AS last_content,
          dm.created_at AS last_at,
          (
            SELECT COUNT(*) FROM direct_messages dm2
            WHERE dm2.sender_id = CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END
              AND dm2.receiver_id = $1 AND dm2.is_read = false
          ) AS unread
        FROM direct_messages dm
        JOIN users u ON u.id = CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END
        WHERE dm.sender_id = $1 OR dm.receiver_id = $1
        ORDER BY dm.created_at DESC
      ) sub
      ORDER BY other_id, last_at DESC
    `, [uid]);

    // Re-sort by last_at after DISTINCT
    const sorted = result.rows.sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
    res.json({ conversations: sorted });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/messages/:userId — chat history ────────────────────────────────
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const me = req.user.id;
    const other = req.params.userId;

    // Check friendship
    const friendship = await db.query(`
      SELECT status FROM friendships
      WHERE ((requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1))
    `, [me, other]);

    const status = friendship.rows[0]?.status || 'none';

    // Get messages
    const msgs = await db.query(`
      SELECT dm.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
      FROM direct_messages dm
      JOIN users u ON u.id = dm.sender_id
      WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
         OR (dm.sender_id = $2 AND dm.receiver_id = $1)
      ORDER BY dm.created_at ASC
      LIMIT 200
    `, [me, other]);

    // Mark as read
    await db.query(`
      UPDATE direct_messages SET is_read = true
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [other, me]);

    // Get other user info
    const userInfo = await db.query(
      'SELECT id, full_name, avatar_url, last_seen_at FROM users WHERE id = $1',
      [other]
    );

    res.json({
      messages: msgs.rows,
      friendshipStatus: status,
      otherUser: userInfo.rows[0] || null,
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/messages — send a message ────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const me = req.user.id;
    const { receiverId, to_user_id, content } = req.body;
    const targetId = receiverId || to_user_id;

    if (!targetId || !content?.trim()) {
      return res.status(400).json({ error: 'receiverId e content são obrigatórios' });
    }

    // ✅ Verificação de amizade obrigatória
    const friendship = await db.query(`
      SELECT status FROM friendships
      WHERE ((requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1))
    `, [me, targetId]);

    const status = friendship.rows[0]?.status;
    if (status !== 'accepted') {
      return res.status(403).json({
        error: 'not_friends',
        message: 'Vocês precisam ser amigos para enviar mensagens.',
      });
    }

    const result = await db.query(`
      INSERT INTO direct_messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [me, targetId, content.trim()]);

    const msg = result.rows[0];

    // Notificação
    try {
      const sender = await db.query('SELECT full_name FROM users WHERE id = $1', [me]);
      const name = sender.rows[0]?.full_name || 'Alguém';
      const preview = content.trim().length > 50 ? content.trim().substring(0, 50) + '...' : content.trim();
      await db.query(`
        INSERT INTO notifications (user_id, type, title, body)
        VALUES ($1, 'message', $2, $3)
      `, [targetId, `💬 Nova mensagem de ${name}`, preview]);
    } catch (_) {}

    res.status(201).json({ message: msg });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/messages/mark-read ────────────────────────────────────────────
router.post('/mark-read', authenticate, async (req, res) => {
  try {
    const { senderId } = req.body;
    await db.query(`
      UPDATE direct_messages SET is_read = true
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [senderId, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
