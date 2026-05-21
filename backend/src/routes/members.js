const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const ADMIN_SECRET = 'sigo333wenderj';

router.get('/admin', async (req, res) => {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }
  try {
    const result = await db.query('SELECT id, email, full_name, display_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ members: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT u.id, u.email, u.full_name, u.display_name, u.avatar_url, u.role, u.is_active, u.last_seen_at, u.created_at FROM users u ORDER BY u.created_at DESC', []);
    res.json({ members: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pastors', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT u.id, u.full_name FROM users u WHERE u.role =  AND u.is_active = true ORDER BY u.full_name ASC', ['pastor']);
    res.json({ pastors: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/:userId', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM direct_messages WHERE (sender_id =  AND receiver_id = ) OR (sender_id =  AND receiver_id = ) ORDER BY created_at ASC LIMIT 100', [req.user.id, req.params.userId]);
    res.json({ messages: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ error: 'Campos obrigatorios' });
    const result = await db.query('INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES (, , ) RETURNING *', [req.user.id, receiverId, content.trim()]);
    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
