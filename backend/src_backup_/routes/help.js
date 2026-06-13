const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigo-com-fe-secret-dev';

let wss = null;
router.setWss = (w) => { wss = w; };

// Optional auth middleware
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      req.user = decoded;
    } catch (e) { /* ignore */ }
  }
  next();
}

// Auto-migrate: add destination column if missing
(async () => {
  try {
    await db.query(
      `ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS destination VARCHAR(20) DEFAULT 'pastor'`
    );
    console.log('✅ help_requests.destination column ready');
  } catch (err) {
    // Column may already exist or table doesn't exist yet — fine
    if (!err.message?.includes('already exists')) {
      console.warn('⚠️  help_requests migration:', err.message);
    }
  }
})();

// POST /api/help-requests
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { type, name, contact, message, destination = 'pastor', anonymous = false } = req.body;
    if (!type || !contact) {
      return res.status(400).json({ error: 'Tipo e contato são obrigatórios' });
    }

    const validDestinations = ['public', 'group', 'pastor'];
    const dest = validDestinations.includes(destination) ? destination : 'pastor';

    const newRequest = await db.prepare(
      `INSERT INTO help_requests (type, name, contact, message, destination)
       VALUES (?, ?, ?, ?, ?) RETURNING *`
    ).get(type, name || null, contact, message || null, dest);

    // If destination === 'public' and user is authenticated, also create a feed post
    if (dest === 'public' && req.user) {
      try {
        const authorName = anonymous ? 'Anónimo' : (name || req.user.full_name || 'Utilizador');
        const feedContent = `🙏 Pedido de Oração\n\n${message || contact}\n\n— ${authorName}`;
        await db.prepare(
          `INSERT INTO feed_posts (author_id, content, category, visibility)
           VALUES (?, ?, ?, ?) RETURNING id`
        ).get(req.user.id, feedContent, 'prayer', 'public');
      } catch (feedErr) {
        console.warn('⚠️  Could not create feed post:', feedErr.message);
      }
    }

    if (wss) {
      const payload = JSON.stringify({ type: 'new_help_request', request: newRequest });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(payload);
      });
    }

    res.status(201).json({ id: newRequest.id, message: 'Pedido de oração recebido!' });
  } catch (err) {
    console.error('Erro ao salvar pedido de oração:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/help-requests
router.get('/', async (req, res) => {
  try {
    const requests = await db.prepare(
      'SELECT * FROM help_requests ORDER BY created_at DESC LIMIT 100'
    ).all();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PATCH /api/help-requests/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    await db.prepare('UPDATE help_requests SET status = ? WHERE id = ?').run(status, req.params.id);

    if (wss) {
      const payload = JSON.stringify({ type: 'help_request_update', id: Number(req.params.id), status });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(payload);
      });
    }

    res.json({ message: 'Status atualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
