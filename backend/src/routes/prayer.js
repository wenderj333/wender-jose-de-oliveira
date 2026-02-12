const express = require('express');
const router = express.Router();
const Prayer = require('../models/Prayer');
const { authenticate } = require('../middleware/auth');

// GET /api/prayers - Feed de pedidos de oração
router.get('/', async (req, res) => {
  try {
    const { church_id, limit, offset } = req.query;
    const prayers = await Prayer.getFeed({
      church_id,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });
    res.json({ prayers });
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

module.exports = router;
