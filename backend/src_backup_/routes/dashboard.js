const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const usersCount = await db.prepare('SELECT COUNT(*) AS count FROM users').get();
    const churchesCount = await db.prepare('SELECT COUNT(*) AS count FROM churches').get();
    const prayersCount = await db.prepare('SELECT COUNT(*) AS count FROM prayers').get();
    const answeredCount = await db.prepare("SELECT COUNT(*) AS count FROM prayers WHERE is_answered = true").get();
    let recentPrayers = [];
    if (req.user.role === 'pastor' || req.user.role === 'admin') {
      recentPrayers = await db.prepare(
        `SELECT p.id, p.title, p.content, p.category, p.is_urgent, p.prayer_count, p.created_at,
                u.full_name AS author_name
         FROM prayers p JOIN users u ON p.author_id = u.id
         WHERE p.visibility = 'public'
         ORDER BY p.created_at DESC LIMIT 5`
      ).all();
    }

    res.json({
      stats: {
        totalUsers: usersCount.count,
        totalChurches: churchesCount.count,
        totalPrayers: prayersCount.count,
        answeredPrayers: answeredCount.count,
      },
      recentActivity: recentPrayers,
    });
  } catch (err) {
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/dashboard/:churchId/stats
router.get('/:churchId/stats', authenticate, async (req, res) => {
  try {
    const { churchId } = req.params;

    const members = await db.prepare('SELECT COUNT(*) AS count FROM church_roles WHERE church_id = ?').get(churchId);
    const activeLast30 = await db.prepare(
      `SELECT COUNT(DISTINCT cr.user_id) AS count FROM church_roles cr
       JOIN users u ON cr.user_id = u.id
       WHERE cr.church_id = ? AND u.last_seen_at > NOW() - INTERVAL '30 days'`
    ).get(churchId);
    const newLast30 = await db.prepare(
      `SELECT COUNT(*) AS count FROM church_roles WHERE church_id = ? AND assigned_at > NOW() - INTERVAL '30 days'`
    ).get(churchId);
    const prayers = await db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE church_id = ?').get(churchId);
    const answeredPrayers = await db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE church_id = ? AND is_answered = true').get(churchId);
    const tithesTotal = await db.prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM tithes
       WHERE church_id = ? AND created_at > NOW() - INTERVAL '30 days'`
    ).get(churchId);

    res.json({
      stats: {
        totalMembers: members.count,
        activeMembers: activeLast30.count,
        newMembers30d: newLast30.count,
        totalPrayers: prayers.count,
        answeredPrayers: answeredPrayers.count,
        tithesThisMonth: parseFloat(tithesTotal.total),
      },
    });
  } catch (err) {
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/dashboard/:churchId/inactive
router.get('/:churchId/inactive', authenticate, async (req, res) => {
  try {
    const rows = await db.prepare(
      `SELECT u.id, u.full_name, u.avatar_url, u.email, u.last_seen_at
       FROM church_roles cr JOIN users u ON cr.user_id = u.id
       WHERE cr.church_id = ? AND (u.last_seen_at < NOW() - INTERVAL '30 days' OR u.last_seen_at IS NULL)
       ORDER BY u.last_seen_at ASC`
    ).all(req.params.churchId);
    res.json({ members: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/dashboard/:churchId/growth
router.get('/:churchId/growth', authenticate, async (req, res) => {
  try {
    const rows = await db.prepare(
      `SELECT to_char(assigned_at, 'YYYY-MM-01') AS month, COUNT(*) AS new_members
       FROM church_roles WHERE church_id = ?
       GROUP BY month ORDER BY month DESC LIMIT 12`
    ).all(req.params.churchId);
    res.json({ growth: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/dashboard/users
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await db.prepare('SELECT id, full_name, avatar_url FROM users ORDER BY full_name').all();
    res.json({ users });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/dashboard/users - Lista de todos os usuários
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await db.prepare(
      'SELECT id, full_name, avatar_url FROM users ORDER BY full_name'
    ).all();
    res.json({ users });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
