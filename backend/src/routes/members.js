const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Middleware: only pastors/admins
function pastorOnly(req, res, next) {
  if (req.user.role !== 'pastor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a pastores' });
  }
  next();
}

// GET /api/members — list all members (pastor only)
router.get('/', authenticate, pastorOnly, async (req, res) => {
  try {
    const members = await db.prepare(
      `SELECT id, email, full_name, display_name, avatar_url, role, is_active, last_seen_at, created_at
       FROM users ORDER BY created_at DESC`
    ).all();
    res.json({ members });
  } catch (err) {
    console.error('Error listing members:', err);
    res.status(500).json({ error: 'Erro ao listar membros' });
  }
});

// GET /api/members/pastors — list all pastors for donations (authenticated users only)
router.get('/pastors', authenticate, async (req, res) => {
  try {
    const pastors = await db.prepare(
      `SELECT u.id, u.full_name, c.name AS church_name
       FROM users u
       LEFT JOIN churches c ON c.pastor_id = u.id
       WHERE u.role = 'pastor' AND u.is_active = true
       ORDER BY u.full_name ASC`
    ).all();
    res.json({ pastors });
  } catch (err) {
    console.error('Error listing pastors:', err);
    res.status(500).json({ error: 'Erro ao listar pastores' });
  }
});

// GET /api/members/messages/:userId — get direct messages with a user
router.get('/messages/:userId', authenticate, pastorOnly, async (req, res) => {
  try {
    const messages = await db.prepare(
      `SELECT * FROM direct_messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC LIMIT 100`
    ).all(req.user.id, req.params.userId, req.params.userId, req.user.id);
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// POST /api/members/messages — send direct message
router.post('/messages', authenticate, pastorOnly, async (req, res) => {
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
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

module.exports = router;
