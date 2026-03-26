const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Helper para criar notificações
async function createNotification(userId, type, title, body, data = {}) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, body, JSON.stringify(data)]
    );
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

// GET /api/notifications — listar notificações do usuário logado
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count — contador de não lidas
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    const dm = await db.query(
      `SELECT COUNT(*) AS count FROM direct_messages WHERE receiver_id = $1 AND is_read = false`,
      [req.user.id]
    );
    res.json({
      count: parseInt(r.rows[0]?.count || 0) + parseInt(dm.rows[0]?.count || 0)
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all — marcar todas como lidas
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/:id/read — marcar notificação específica como lida
router.post('/:id/read', authenticate, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/admin-issues — Admin/Pastor vê relatórios de problemas
router.get('/admin-issues', authenticate, async (req, res) => {
  if (req.user.role !== 'pastor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  try {
    const result = await db.query(
      `SELECT n.*, u.full_name AS reporter_name
       FROM notifications n
       JOIN users u ON u.id = (n.data->>'reporterId')::uuid
       WHERE n.type = 'technical_issue'
       ORDER BY n.created_at DESC LIMIT 50`
    );
    res.json({ issues: result.rows });
  } catch (err) {
    console.error('Error fetching admin issues:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, createNotification };
