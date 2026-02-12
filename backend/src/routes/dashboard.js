const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get();
    const churchesCount = db.prepare('SELECT COUNT(*) AS count FROM churches').get();
    const prayersCount = db.prepare('SELECT COUNT(*) AS count FROM prayers').get();
    const answeredCount = db.prepare("SELECT COUNT(*) AS count FROM prayers WHERE is_answered = 1").get();
    const recentPrayers = db.prepare(
      `SELECT p.id, p.title, p.content, p.category, p.is_urgent, p.prayer_count, p.created_at,
              u.full_name AS author_name
       FROM prayers p JOIN users u ON p.author_id = u.id
       WHERE p.visibility = 'public'
       ORDER BY p.created_at DESC LIMIT 5`
    ).all();

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

    const members = db.prepare('SELECT COUNT(*) AS count FROM church_roles WHERE church_id = ?').get(churchId);
    const activeLast30 = db.prepare(
      `SELECT COUNT(DISTINCT cr.user_id) AS count FROM church_roles cr
       JOIN users u ON cr.user_id = u.id
       WHERE cr.church_id = ? AND u.last_seen_at > datetime('now', '-30 days')`
    ).get(churchId);
    const newLast30 = db.prepare(
      `SELECT COUNT(*) AS count FROM church_roles WHERE church_id = ? AND assigned_at > datetime('now', '-30 days')`
    ).get(churchId);
    const prayers = db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE church_id = ?').get(churchId);
    const answeredPrayers = db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE church_id = ? AND is_answered = 1').get(churchId);
    const tithesTotal = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM tithes
       WHERE church_id = ? AND created_at > datetime('now', '-30 days')`
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
    const rows = db.prepare(
      `SELECT u.id, u.full_name, u.avatar_url, u.email, u.last_seen_at
       FROM church_roles cr JOIN users u ON cr.user_id = u.id
       WHERE cr.church_id = ? AND (u.last_seen_at < datetime('now', '-30 days') OR u.last_seen_at IS NULL)
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
    const rows = db.prepare(
      `SELECT strftime('%Y-%m-01', assigned_at) AS month, COUNT(*) AS new_members
       FROM church_roles WHERE church_id = ?
       GROUP BY month ORDER BY month DESC LIMIT 12`
    ).all(req.params.churchId);
    res.json({ growth: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
