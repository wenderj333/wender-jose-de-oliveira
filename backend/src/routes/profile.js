const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/profile/:userId — public profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await db.prepare(
      `SELECT u.id, u.full_name, u.display_name, u.avatar_url, u.bio, u.role, u.created_at,
              cr.role_name AS church_role, c.name AS church_name, c.id AS church_id
       FROM users u
       LEFT JOIN church_roles cr ON cr.user_id = u.id
       LEFT JOIN churches c ON c.id = cr.church_id
       WHERE u.id = ?
       LIMIT 1`
    ).get(req.params.userId);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ user });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/profile/:userId/stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    const prayers = await db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE author_id = ?').get(userId);
    const posts = await db.prepare('SELECT COUNT(*) AS count FROM feed_posts WHERE author_id = ?').get(userId);
    const friends = await db.prepare(
      `SELECT COUNT(*) AS count FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`
    ).get(userId, userId);

    res.json({
      prayers: parseInt(prayers?.count || 0),
      posts: parseInt(posts?.count || 0),
      friends: parseInt(friends?.count || 0),
    });
  } catch (err) {
    console.error('Erro ao buscar stats:', err);
    // If friendships table doesn't exist yet, return zeros
    if (err.message && err.message.includes('friendships')) {
      return res.json({ prayers: 0, posts: 0, friends: 0 });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/profile — update own profile (auth required)
router.put('/', authenticate, async (req, res) => {
  try {
    const { display_name, bio, avatar_url, phone } = req.body;
    await db.prepare(
      `UPDATE users SET display_name = ?, bio = ?, avatar_url = ?, phone = ?, updated_at = NOW() WHERE id = ?`
    ).run(display_name || null, bio || null, avatar_url || null, phone || null, req.user.id);

    const updated = await db.prepare(
      'SELECT id, full_name, display_name, avatar_url, bio, phone, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user: updated });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
