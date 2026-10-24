const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

(async () => {
  try {
    // Mural espiritual e "+1 alma orando contigo": antes só existiam no navegador de cada pessoa
    await db.query(`CREATE TABLE IF NOT EXISTS consecration_posts (
      id BIGSERIAL PRIMARY KEY, user_id UUID NOT NULL, type VARCHAR(20) DEFAULT 'testimony', text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await db.query(`CREATE TABLE IF NOT EXISTS consecration_reactions (
      post_id BIGINT NOT NULL, user_id UUID NOT NULL, reaction VARCHAR(12) NOT NULL,
      PRIMARY KEY (post_id, user_id, reaction))`);
    await db.query(`CREATE TABLE IF NOT EXISTS consecration_prayers (
      id BIGSERIAL PRIMARY KEY, user_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await db.query('CREATE INDEX IF NOT EXISTS idx_consecration_prayers_day ON consecration_prayers(created_at)');
  } catch (e) { console.warn('consecration migration:', e.message); }
})();
const REACTIONS = ['praying', 'strength', 'amen', 'peace'];
const POST_TYPES = ['testimony', 'prayer', 'reflection', 'verse', 'gratitude'];

// GET /api/consecration/stats — total + currently fasting count (anonymous)
router.get('/stats', async (req, res) => {
  try {
    const total = await db.prepare('SELECT COUNT(*) AS count FROM consecrations').get();
    const active = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) AS count FROM consecrations WHERE created_at >= CURRENT_DATE`
    ).get();
    let prayersToday = 0;
    try { prayersToday = (await db.query('SELECT COUNT(*)::int AS n FROM consecration_prayers WHERE created_at >= CURRENT_DATE')).rows[0].n; } catch (_) {}
    res.json({
      totalConsecrations: parseInt(total?.count || 0),
      activeFasting: parseInt(active?.count || 0),
      prayersToday,
    });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// GET /api/consecration/active — participantes atuais (apenas os dados necessários para as bolhas)
router.get('/active', async (req, res) => {
  try {
    const rows = await db.prepare(
      `SELECT c.user_id, COALESCE(NULLIF(u.full_name, ''), 'Irmão da comunidade') AS name,
              u.avatar_url, c.start_date
       FROM consecrations c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.created_at >= CURRENT_DATE
       ORDER BY c.start_date ASC LIMIT 10`
    ).all();
    res.json({ participants: rows || [] });
  } catch (err) {
    res.status(500).json({ error: 'Não foi possível carregar os participantes' });
  }
});

// GET /api/consecration/status — check if current user is fasting today
router.get('/status', authenticate, async (req, res) => {
  try {
    const row = await db.prepare(
      `SELECT id FROM consecrations WHERE user_id = ? AND created_at >= CURRENT_DATE LIMIT 1`
    ).get(req.user.id);
    const first = await db.query(`SELECT to_char(MIN(created_at), 'YYYY-MM-DD') AS d, COUNT(DISTINCT created_at::date)::int AS days FROM consecrations WHERE user_id = $1`, [req.user.id]).catch(() => ({ rows: [{}] }));
    res.json({ active: !!row, firstDay: first.rows[0]?.d || null, days: first.rows[0]?.days || 0 });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// POST /api/consecration/start e /stop — explícitos (o "sair" antes enviava DELETE /toggle, que não existia)
async function startToday(userId) {
  const ex = await db.query('SELECT id FROM consecrations WHERE user_id = $1 AND created_at >= CURRENT_DATE LIMIT 1', [userId]);
  if (!ex.rows.length) await db.query('INSERT INTO consecrations (user_id, purpose) VALUES ($1, $2)', [userId, 'Consagração e jejum']);
}
async function stopToday(userId) {
  await db.query('DELETE FROM consecrations WHERE user_id = $1 AND created_at >= CURRENT_DATE', [userId]);
}
router.post('/start', authenticate, async (req, res) => {
  try { await startToday(req.user.id); res.json({ active: true }); } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});
router.post('/stop', authenticate, async (req, res) => {
  try { await stopToday(req.user.id); res.json({ active: false }); } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});
router.delete('/toggle', authenticate, async (req, res) => {
  try { await stopToday(req.user.id); res.json({ active: false }); } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// POST /api/consecration/pray — "+1 alma orando contigo" (no máximo 1 por pessoa a cada 30 s)
router.post('/pray', authenticate, async (req, res) => {
  try {
    const recent = await db.query("SELECT 1 FROM consecration_prayers WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 seconds' LIMIT 1", [req.user.id]);
    if (!recent.rows.length) await db.query('INSERT INTO consecration_prayers (user_id) VALUES ($1)', [req.user.id]);
    const n = (await db.query('SELECT COUNT(*)::int AS n FROM consecration_prayers WHERE created_at >= CURRENT_DATE')).rows[0].n;
    res.json({ prayersToday: n });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// Mural espiritual partilhado
router.get('/mural', async (req, res) => {
  try {
    let vid = null;
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) { try { vid = require('jsonwebtoken').verify(h.slice(7), require('../middleware/auth').JWT_SECRET).id; } catch (_) {} }
    const r = await db.query(
      `SELECT p.id, p.type, p.text, p.created_at, p.user_id, COALESCE(NULLIF(u.full_name, ''), 'Irmão da comunidade') AS author, u.avatar_url AS avatar,
              COALESCE((SELECT json_object_agg(x.reaction, x.n) FROM (SELECT reaction, COUNT(*)::int AS n FROM consecration_reactions WHERE post_id = p.id GROUP BY reaction) x), '{}'::json) AS reactions,
              COALESCE((SELECT json_agg(reaction) FROM consecration_reactions WHERE post_id = p.id AND user_id = $1::uuid), '[]'::json) AS mine
         FROM consecration_posts p LEFT JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC LIMIT 40`, [vid]);
    res.json({ posts: r.rows });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});
router.post('/mural', authenticate, async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim().slice(0, 1500);
    if (!text) return res.status(400).json({ error: 'empty' });
    const type = POST_TYPES.includes(req.body?.type) ? req.body.type : 'testimony';
    try {
      const reason = await require('../services/requestGuard').checkRequest(text, 'request');
      if (reason) return res.status(422).json({ error: 'moderated', reason });
    } catch (_) {}
    const recent = await db.query("SELECT COUNT(*)::int AS n FROM consecration_posts WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'", [req.user.id]);
    if (recent.rows[0].n >= 10) return res.status(429).json({ error: 'too_many' });
    const r = await db.query('INSERT INTO consecration_posts (user_id, type, text) VALUES ($1, $2, $3) RETURNING id', [req.user.id, type, text]);
    res.status(201).json({ id: r.rows[0].id });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});
router.post('/mural/:id/react', authenticate, async (req, res) => {
  try {
    const reaction = REACTIONS.includes(req.body?.reaction) ? req.body.reaction : null;
    const id = parseInt(req.params.id, 10);
    if (!reaction || !(id > 0)) return res.status(400).json({ error: 'invalid' });
    const del = await db.query('DELETE FROM consecration_reactions WHERE post_id = $1 AND user_id = $2 AND reaction = $3 RETURNING 1', [id, req.user.id, reaction]);
    if (!del.rows.length) await db.query('INSERT INTO consecration_reactions (post_id, user_id, reaction) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, req.user.id, reaction]);
    const n = (await db.query('SELECT COUNT(*)::int AS n FROM consecration_reactions WHERE post_id = $1 AND reaction = $2', [id, reaction])).rows[0].n;
    res.json({ reaction, on: !del.rows.length, count: n });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});
router.delete('/mural/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await db.query(`DELETE FROM consecration_posts WHERE id = $1 AND (user_id = $2 OR $3 = 'admin') RETURNING id`, [id, req.user.id, req.user.role || '']);
    if (!r.rows.length) return res.status(404).json({ error: 'not_found' });
    await db.query('DELETE FROM consecration_reactions WHERE post_id = $1', [id]).catch(() => {});
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// POST /api/consecration/toggle — toggle consecration on/off for today
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const existing = await db.prepare(
      `SELECT id FROM consecrations WHERE user_id = ? AND created_at >= CURRENT_DATE LIMIT 1`
    ).get(req.user.id);

    if (existing) {
      // Deactivate - remove today's consecration
      await db.prepare(`DELETE FROM consecrations WHERE id = ?`).run(existing.id);
      res.json({ active: false });
    } else {
      // Activate - create new consecration
      await db.prepare(
        `INSERT INTO consecrations (user_id, purpose) VALUES (?, ?)`
      ).run(req.user.id, 'Consagração e jejum');
      res.json({ active: true });
    }
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

module.exports = router;
