const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, adminOnly } = require('../middleware/auth');

// Helper para criar notificações
async function createNotification(userId, type, title, body, data = {}) {
  try {
    await db.prepare(`
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, title, body, JSON.stringify(data));
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

// GET /api/notifications — listar notificações do usuário logado
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await db.prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
    ).all(req.user.id);
    res.json({ notifications });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/unread-count — contador de não lidas
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const r = await db.prepare(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = false`
    ).get(req.user.id);
    const dm = await db.prepare(
      `SELECT COUNT(*) AS count FROM direct_messages WHERE receiver_id = ? AND is_read = false`
    ).get(req.user.id);
    res.json({ count: parseInt(r?.count || 0) + parseInt(dm?.count || 0) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/read-all — marcar todas como lidas
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await db.prepare(`UPDATE notifications SET is_read = true WHERE user_id = ?`).run(req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/:id/read — marcar notificação específica como lida
router.post('/:id/read', authenticate, async (req, res) => {
  try {
    await db.prepare(`UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/admin-issues — Admin/Pastor vê relatórios de problemas
router.get('/admin-issues', authenticate, adminOnly, async (req, res) => {
  try {
    const issues = await db.prepare(
      `SELECT n.*, u.full_name AS reporter_name FROM notifications n
       JOIN users u ON u.id = n.data->>'reporterId'::text::uuid
       WHERE n.type = 'technical_issue' ORDER BY n.created_at DESC LIMIT 50`
    ).all();
    res.json({ issues });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { router, createNotification };
