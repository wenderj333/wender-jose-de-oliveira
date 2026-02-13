const express = require('express');
const router = express.Router();
const db = require('../db/connection');

let wss = null;
router.setWss = (w) => { wss = w; };

// POST /api/help-requests
router.post('/', async (req, res) => {
  try {
    const { type, name, contact, message } = req.body;
    if (!type || !contact) {
      return res.status(400).json({ error: 'Tipo e contato são obrigatórios' });
    }
    const newRequest = await db.prepare(
      'INSERT INTO help_requests (type, name, contact, message) VALUES (?, ?, ?, ?) RETURNING *'
    ).get(type, name || null, contact, message || null);

    if (wss) {
      const payload = JSON.stringify({ type: 'new_help_request', request: newRequest });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(payload);
      });
    }

    res.status(201).json({ id: newRequest.id, message: 'Pedido de ajuda recebido!' });
  } catch (err) {
    console.error('Erro ao salvar pedido de ajuda:', err);
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
