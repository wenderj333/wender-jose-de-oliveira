const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// Ensure reports table exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
      reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      reported_post_id UUID,
      reason VARCHAR(50) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, []);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false`);
}

ensureTable().catch(err => console.error('reports table init error:', err));

// POST /api/reports — create a report (auth required)
router.post('/', authenticate, async (req, res) => {
  try {
    const { reported_user_id, reported_post_id, reason, description } = req.body;
    const validReasons = ['inappropriate', 'disrespectful', 'spam', 'harassment', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Motivo inválido' });
    }
    if (!reported_user_id && !reported_post_id) {
      return res.status(400).json({ error: 'Deve indicar o utilizador ou publicação a denunciar' });
    }

    await db.query(
      `INSERT INTO reports (reporter_id, reported_user_id, reported_post_id, reason, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        reported_user_id || null,
        reported_post_id || null,
        reason,
        description || null,
      ]
    );

    res.json({
      success: true,
      message: 'Denúncia enviada. Obrigado por ajudar a manter a comunidade segura. 🙏',
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Erro ao enviar denúncia' });
  }
});

// GET /api/reports — central moderation queue (admins only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.id, r.reason, r.description, r.status, r.created_at,
             reporter.full_name AS reporter_name, reporter.email AS reporter_email,
             reported.id AS reported_user_id, reported.full_name AS reported_name,
             reported.email AS reported_email, reported.avatar_url AS reported_avatar,
             reported.is_suspended
      FROM reports r
      LEFT JOIN users reporter ON reporter.id = r.reporter_id
      LEFT JOIN users reported ON reported.id = r.reported_user_id
      ORDER BY CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END, r.created_at DESC
      LIMIT 200
    `);
    res.json({ reports: result.rows });
  } catch (err) {
    console.error('Error listing reports:', err);
    res.status(500).json({ error: 'Erro ao carregar denúncias' });
  }
});

// PATCH /api/reports/:id — resolve a report and, when needed, suspend the account.
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, accountAction } = req.body || {};
    if (!['pending', 'reviewed', 'dismissed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const report = await db.query('SELECT reported_user_id FROM reports WHERE id = $1', [req.params.id]);
    if (!report.rows[0]) return res.status(404).json({ error: 'Denúncia não encontrada' });

    if (report.rows[0].reported_user_id && ['suspend', 'restore'].includes(accountAction)) {
      await db.query('UPDATE users SET is_suspended = $1 WHERE id = $2', [accountAction === 'suspend', report.rows[0].reported_user_id]);
    }
    await db.query('UPDATE reports SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error moderating report:', err);
    res.status(500).json({ error: 'Erro ao atualizar denúncia' });
  }
});

module.exports = router;
