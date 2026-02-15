const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// POST /api/reports/issue — user reports a technical issue
router.post('/issue', authenticate, async (req, res) => {
  try {
    const { issueType, description, severity } = req.body;

    if (!description || !issueType) {
      return res.status(400).json({ error: 'Tipo e descrição do problema são obrigatórios.' });
    }

    const newIssue = await db.prepare(`
      INSERT INTO technical_issues (reporter_id, issue_type, description, severity)
      VALUES (?, ?, ?, ?) RETURNING *
    `).get(req.user.id, issueType, description, severity || 'medium');

    // Notify all admins and pastors about the new issue
    const adminsAndPastors = await db.prepare('SELECT id FROM users WHERE role IN ('admin', 'pastor')').all();
    for (const { id: userId } of adminsAndPastors) {
      await createNotification(
        userId,
        'technical_issue',
        '🚨 Novo Relatório de Problema',
        `Um novo problema técnico foi reportado por ${req.user.full_name || req.user.email}.`,
        { issueId: newIssue.id, reporterId: req.user.id, url: `/notificacoes/admin-issues` } // Link para a página de admin (ainda não existe)
      );
    }

    res.status(201).json({ message: 'Problema reportado com sucesso!', issue: newIssue });
  } catch (err) {
    console.error('Error reporting issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add admin routes to view, update, and resolve issues

module.exports = router;
