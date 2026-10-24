const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// Mantido por compatibilidade (o server.js chama setWss); os avisos agora vão só para pastores/admins
let wss = null;
router.setWss = (w) => { wss = w; };

(async () => {
  try {
    await db.query(`ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS destination VARCHAR(20) DEFAULT 'pastor'`);
    await db.query('ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS user_id UUID');
    await db.query('ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false');
  } catch (err) {
    if (!err.message?.includes('already exists')) console.warn('⚠️  help_requests migration:', err.message);
  }
})();

// Avisa em tempo real só quem pode ver os pedidos (pastores e admins)
async function notifyLeaders(payload) {
  try {
    const { notifyUser } = require('../websocket');
    const r = await db.query(`SELECT id FROM users WHERE role IN ('pastor', 'admin') AND COALESCE(is_active, true) = true`);
    for (const row of r.rows) notifyUser(String(row.id), payload);
  } catch (_) { /* sem websocket */ }
}

// POST /api/help-requests — pedir oração / ajuda (precisa de sessão)
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, message, destination = 'pastor' } = req.body || {};
    const anonymous = req.body?.anonymous === true;
    if (!type || !String(message || '').trim()) return res.status(400).json({ error: 'Escreva o seu pedido.', code: 'empty' });
    const text = String(message).trim().slice(0, 2000);
    const dest = ['public', 'group', 'pastor'].includes(destination) ? destination : 'pastor';

    // Público: vai para a Oração Mundial (que respeita o anonimato e passa pelo guardião)
    if (dest === 'public') {
      try {
        const reason = await require('../services/requestGuard').checkRequest(text, 'request');
        if (reason) return res.status(422).json({ error: 'moderated', reason });
      } catch (_) { /* sem guardião */ }
    }

    // O contacto e o nome vêm da conta, e nunca são guardados quando o pedido é anónimo
    const name = anonymous ? null : (req.user.full_name || null);
    const contact = anonymous ? 'anónimo' : (req.user.email || 'via-app');
    const newRequest = await db.prepare(
      `INSERT INTO help_requests (type, name, contact, message, destination, user_id, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(String(type).slice(0, 50), name, contact, text, dest, req.user.id, anonymous);

    if (dest === 'public') {
      try {
        await db.query(
          `INSERT INTO help_posts (user_id, category, post_type, content, is_anonymous) VALUES ($1, 'outro', 'prayer', $2, $3)`,
          [req.user.id, text, anonymous]);
      } catch (e) { console.warn('⚠️  help_requests → Oração Mundial:', e.message); }
    }

    notifyLeaders({ type: 'new_help_request', request: newRequest });
    res.status(201).json({ id: newRequest.id, message: 'Pedido de oração recebido!' });
  } catch (err) {
    console.error('Erro ao salvar pedido de oração:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/help-requests — só pastores e admins (antes estava aberto a qualquer pessoa, com e-mails)
router.get('/', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const requests = await db.prepare('SELECT * FROM help_requests ORDER BY created_at DESC LIMIT 100').all();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PATCH /api/help-requests/:id — só pastores e admins
router.patch('/:id', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['pending', 'in_progress', 'resolved'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const id = parseInt(req.params.id, 10);
    if (!(id > 0)) return res.status(404).json({ error: 'not_found' });
    await db.prepare('UPDATE help_requests SET status = ? WHERE id = ?').run(status, id);
    notifyLeaders({ type: 'help_request_update', id, status });
    res.json({ message: 'Status atualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
