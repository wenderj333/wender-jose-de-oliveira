const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { sendPushNotification } = require('../services/notifications');

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
  // FCM push
  try {
    const userRes = await db.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
    const fcmToken = userRes.rows[0]?.fcm_token;
    if (fcmToken) {
      await sendPushNotification(fcmToken, title, body || title, data);
    }
  } catch(fcmErr) { console.error('FCM error:', fcmErr.message); }
}

// GET /api/notifications — listar notificações do usuário logado
router.get('/', authenticate, async (req, res) => {
  try {
    // Junta a foto e o nome de quem gerou o aviso (amizade, Amém, mensagem…), como no Facebook
    const result = await db.query(
      `SELECT n.*, a.avatar_url AS actor_avatar, a.full_name AS actor_name
         FROM notifications n
         LEFT JOIN users a ON a.id::text = COALESCE(n.data->>'from', n.data->>'senderId', n.data->>'userId')
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC LIMIT 60`,
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
    let dm;
    try {
      dm = await db.query(
        `SELECT COUNT(*) AS count FROM direct_messages WHERE receiver_id = $1 AND is_read = false
           AND sender_id NOT IN (SELECT restricted_id FROM dm_restricted WHERE user_id = $1)`,
        [req.user.id]
      );
    } catch (_) {
      dm = await db.query(
        `SELECT COUNT(*) AS count FROM direct_messages WHERE receiver_id = $1 AND is_read = false`,
        [req.user.id]
      );
    }
    let groupUnread = 0;
    try {
      const g = await db.query(`SELECT COUNT(*) AS count FROM dm_group_messages gm JOIN dm_group_members m ON m.group_id = gm.group_id AND m.user_id = $1
        WHERE gm.id > m.last_read_id AND gm.sender_id IS DISTINCT FROM $1 AND gm.kind <> 'system'`, [req.user.id]);
      groupUnread = parseInt(g.rows[0]?.count || 0);
    } catch (_) { /* tabelas dos grupos ainda não existem */ }
    const notifications = parseInt(r.rows[0]?.count || 0);
    const messages = parseInt(dm.rows[0]?.count || 0) + groupUnread;
    res.json({ count: notifications + messages, notifications, messages });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/fcm-token — guardar o token do dispositivo sem o expor em logs
router.post('/fcm-token', authenticate, async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (token.length < 20 || token.length > 4096) {
    return res.status(400).json({ error: 'Token de notificações inválido' });
  }
  try {
    await db.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [token, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving notification token:', err.message);
    res.status(500).json({ error: 'Não foi possível ativar as notificações' });
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

// POST /api/notifications/:id/unread — marcar como não lida (menu "…" do sino)
router.post('/:id/unread', authenticate, async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET is_read = false WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as unread:', err.message);
    res.status(500).json({ error: 'Não foi possível atualizar' });
  }
});

// DELETE /api/notifications/:id — remover esta notificação
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).json({ error: 'Não foi possível remover' });
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

