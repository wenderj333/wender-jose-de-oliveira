const express = require('express');
const router = express.Router();
const Church = require('../models/Church');
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/churches - List all churches
router.get('/', async (req, res) => {
  try {
    const churches = db.prepare(
      `SELECT c.*, u.full_name AS pastor_name
       FROM churches c LEFT JOIN users u ON c.pastor_id = u.id
       ORDER BY c.created_at DESC LIMIT 50`
    ).all();
    res.json({ churches });
  } catch (err) {
    console.error('Erro ao listar igrejas:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/churches/search?city=Madrid
router.get('/search', async (req, res) => {
  try {
    const { city, lat, lng, radius } = req.query;
    let churches;
    if (lat && lng) {
      churches = await Church.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 25);
    } else if (city) {
      churches = await Church.findByCity(city);
    } else {
      return res.status(400).json({ error: 'Forneça cidade ou coordenadas' });
    }
    res.json({ churches });
  } catch (err) {
    console.error('Erro ao buscar igrejas:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/churches/:id
router.get('/:id', async (req, res) => {
  try {
    const church = await Church.getById(req.params.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });
    res.json({ church });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/churches/:id/members
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const members = await Church.getMembers(req.params.id);
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/churches
router.post('/', authenticate, async (req, res) => {
  try {
    const church = await Church.create({ ...req.body, pastor_id: req.user.id });
    res.status(201).json({ church });
  } catch (err) {
    console.error('Erro ao criar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
