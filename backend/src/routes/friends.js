const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// All routes require authentication
router.use(authenticate);

// GET /api/friends — list accepted friends
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await db.prepare(`
      SELECT f.id as friendship_id, u.id, u.full_name, u.display_name, u.avatar_url, f.created_at
      FROM friendships f
      JOIN users u ON (u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END)
      WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
      ORDER BY u.full_name
    `).all(userId, userId, userId);
    res.json({ friends });
  } catch (err) {
    console.error('Erro ao buscar amigos:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/friends/requests — list pending incoming requests
router.get('/requests', async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await db.prepare(`
      SELECT f.id as friendship_id, u.id, u.full_name, u.display_name, u.avatar_url, f.created_at
      FROM friendships f
      JOIN users u ON u.id = f.requester_id
      WHERE f.addressee_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `).all(userId);
    res.json({ requests });
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/friends/search?q=name — search users by name
router.get('/search', async (req, res) => {
  try {
    const userId = req.user.id;
    const q = req.query.q || '';
    if (q.length < 2) return res.json({ users: [] });

    const users = await db.prepare(`
      SELECT u.id, u.full_name, u.display_name, u.avatar_url,
        f.id as friendship_id, f.status as friendship_status,
        CASE WHEN f.requester_id = ? THEN 'sent' ELSE 'received' END as direction
      FROM users u
      LEFT JOIN friendships f ON (
        (f.requester_id = ? AND f.addressee_id = u.id)
        OR (f.requester_id = u.id AND f.addressee_id = ?)
      )
      WHERE u.id != ? AND (LOWER(u.full_name) LIKE LOWER(?) OR LOWER(u.display_name) LIKE LOWER(?))
      ORDER BY u.full_name
      LIMIT 20
    `).all(userId, userId, userId, userId, `%${q}%`, `%${q}%`);
    res.json({ users });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/friends/request — send friend request
router.post('/request', async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressee_id } = req.body;
    if (!addressee_id) return res.status(400).json({ error: 'addressee_id obrigatório' });
    if (addressee_id === userId) return res.status(400).json({ error: 'Não pode adicionar a si mesmo' });

    // Check if friendship already exists
    const existing = await db.prepare(`
      SELECT id, status FROM friendships
      WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
    `).get(userId, addressee_id, addressee_id, userId);

    if (existing) {
      if (existing.status === 'accepted') return res.status(400).json({ error: 'Já são amigos' });
      if (existing.status === 'pending') return res.status(400).json({ error: 'Pedido já enviado' });
      // If rejected, allow re-request by updating
      await db.prepare(`UPDATE friendships SET status = 'pending', requester_id = ?, addressee_id = ?, updated_at = NOW() WHERE id = ?`).run(userId, addressee_id, existing.id);
      try { await createNotification(addressee_id, 'friend_request', 'Pedido de amizade', `${req.user.full_name || 'Alguem'} quer ser seu amigo!`, { from: userId }); } catch(e) {}
      return res.json({ message: 'Pedido enviado' });
    }

    await db.prepare(`INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)`).run(userId, addressee_id);
    try { await createNotification(addressee_id, 'friend_request', 'Pedido de amizade', `${req.user.full_name || 'Alguem'} quer ser seu amigo!`, { from: userId }); } catch(e) {}
    res.json({ message: 'Pedido enviado' });
  } catch (err) {
    console.error('Erro ao enviar pedido:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/friends/accept/:friendshipId
router.put('/accept/:friendshipId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;
    const result = await db.prepare(`
      UPDATE friendships SET status = 'accepted', updated_at = NOW()
      WHERE id = ? AND addressee_id = ? AND status = 'pending'
    `).run(friendshipId, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Pedido nao encontrado' });
    // Notify the requester that their request was accepted
    const friendship = await db.prepare('SELECT requester_id FROM friendships WHERE id = ?').get(friendshipId);
    if (friendship) {
      try { await createNotification(friendship.requester_id, 'friend_accepted', 'Amizade aceita!', `${req.user.full_name || 'Alguem'} aceitou seu pedido de amizade!`, { from: userId }); } catch(e) {}
    }
    res.json({ message: 'Amizade aceita' });
  } catch (err) {
    console.error('Erro ao aceitar:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/friends/reject/:friendshipId
router.put('/reject/:friendshipId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;
    const result = await db.prepare(`
      UPDATE friendships SET status = 'rejected', updated_at = NOW()
      WHERE id = ? AND addressee_id = ? AND status = 'pending'
    `).run(friendshipId, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ message: 'Pedido rejeitado' });
  } catch (err) {
    console.error('Erro ao rejeitar:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/friends/:friendshipId — remove friend
router.delete('/:friendshipId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;
    const result = await db.prepare(`
      DELETE FROM friendships WHERE id = ? AND (requester_id = ? OR addressee_id = ?)
    `).run(friendshipId, userId, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Amizade não encontrada' });
    res.json({ message: 'Amigo removido' });
  } catch (err) {
    console.error('Erro ao remover:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
