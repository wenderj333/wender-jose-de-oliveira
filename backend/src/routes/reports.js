const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;
