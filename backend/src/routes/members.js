const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// GET /api/members/online-count — pessoas ativas nos últimos 5 minutos (número real, com cache curto)
let onlineCache = { at: 0, count: 0 };
router.get('/online-count', async (req, res) => {
  try {
    if (Date.now() - onlineCache.at > 30000) {
      const r = await db.query(`SELECT COUNT(*)::int AS n FROM users WHERE last_seen_at > NOW() - INTERVAL '5 minutes'`);
      onlineCache = { at: Date.now(), count: r.rows[0].n || 0 };
    }
    res.json({ count: onlineCache.count });
  } catch (e) { res.json({ count: 0 }); }
});

router.get('/admin', async (req, res) => {
  if (!ADMIN_SECRET || req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }
  try {
    const result = await db.query('SELECT id, email, full_name, display_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ members: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const q = query.slice(0, 60).replace(/[\\%_]/g, m => '\\' + m);
    // Inclui o estado de amizade com quem está a ver (e a direção do pedido), para os botões ficarem certos
    const result = await db.query(`SELECT u.id, u.full_name, u.display_name, u.avatar_url, u.role, u.is_active, u.last_seen_at, u.created_at,
        f.id AS friendship_id, f.status AS friendship_status,
        CASE WHEN f.id IS NULL THEN NULL WHEN f.requester_id = $2 THEN 'sent' ELSE 'received' END AS direction
      FROM users u
      LEFT JOIN friendships f ON ((f.requester_id = $2 AND f.addressee_id = u.id) OR (f.requester_id = u.id AND f.addressee_id = $2)) AND f.status IN ('pending', 'accepted')
      WHERE COALESCE(u.is_active, true) AND u.id <> $2 AND ($1 = '' OR u.full_name ILIKE '%' || $1 || '%' OR u.display_name ILIKE '%' || $1 || '%')
      ORDER BY CASE WHEN LOWER(u.full_name) = LOWER($1) THEN 0 ELSE 1 END, u.last_seen_at DESC NULLS LAST, u.created_at DESC
      LIMIT 100`, [q, req.user.id]);
    res.json({ members: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/pastors', authenticate, async (req, res) => {
  try {
    const result = await db.query("SELECT u.id, u.full_name FROM users u WHERE u.role = $1 AND COALESCE(u.is_active, true) = true ORDER BY u.full_name ASC", ['pastor']);
    res.json({ pastors: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
