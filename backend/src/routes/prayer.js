const express = require('express');
const router = express.Router();
const Prayer = require('../models/Prayer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Optional auth — extracts user if token present, but doesn't block
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret');
      req.user = decoded;
    } catch (e) { /* ignore invalid token */ }
  }
  next();
}

// GET /api/prayers - Feed de pedidos de oração (privado: só vê os seus)
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      // Logado: só vê os seus próprios pedidos
      const prayers = await db.prepare(
        `SELECT p.*, u.full_name AS author_name FROM prayers p
         JOIN users u ON u.id = p.author_id
         WHERE p.author_id = ?
         ORDER BY p.created_at DESC LIMIT ?`
      ).all(req.user.id, parseInt(req.query.limit) || 20);
      return res.json({ prayers });
    }
    // Não logado: não vê nenhum pedido (são privados)
    res.json({ prayers: [], message: 'Faça login para ver seus pedidos de oração' });
  } catch (err) {
    console.error('Erro ao buscar orações:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/prayers/answered - Mural de Vitórias
router.get('/answered', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const prayers = await Prayer.getAnswered({
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });
    res.json({ prayers });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/prayers/:id
router.get('/:id', async (req, res) => {
  try {
    const prayer = await Prayer.getById(req.params.id);
    if (!prayer) return res.status(404).json({ error: 'Pedido não encontrado' });
    const responses = await Prayer.getPrayerResponses(req.params.id);
    res.json({ prayer, responses });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/prayers - Criar pedido
router.post('/', authenticate, async (req, res) => {
  try {
    const prayer = await Prayer.create({
      author_id: req.user.id,
      ...req.body,
    });
    res.status(201).json({ prayer });
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/prayers/:id/pray - "Estou orando por você"
router.post('/:id/pray', authenticate, async (req, res) => {
  try {
    const response = await Prayer.addPrayerResponse(
      req.params.id,
      req.user.id,
      req.body.message || null
    );
    res.status(201).json({ response });
  } catch (err) {
    console.error('Erro ao registrar oração:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PATCH /api/prayers/:id/answered - Marcar como respondida
router.patch('/:id/answered', authenticate, async (req, res) => {
  try {
    const prayer = await Prayer.markAnswered(req.params.id, req.body.testimony);
    res.json({ prayer });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/prayers/:id - Deletar pedido (só o autor)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const prayer = await db.prepare('SELECT * FROM prayers WHERE id = ?').get(req.params.id);
    if (!prayer) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (prayer.author_id !== req.user.id && req.user.role !== 'pastor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await db.prepare('DELETE FROM prayers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar pedido:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
