const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

function pastorOnly(req, res, next) {
  if (req.user.role !== 'pastor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a pastores' });
  }
  next();
}

// GET /api/offerings/config — get pastor's payment config
router.get('/config', authenticate, pastorOnly, async (req, res) => {
  try {
    const config = await db.prepare(
      'SELECT * FROM offering_config WHERE pastor_id = ?'
    ).get(req.user.id);
    res.json({ config: config || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offerings/config — save/update payment config
router.post('/config', authenticate, pastorOnly, async (req, res) => {
  try {
    const { pix_key, pix_name, paypal_email, bank_name, bank_agency, bank_account, bank_holder, custom_message } = req.body;
    const existing = await db.prepare('SELECT id FROM offering_config WHERE pastor_id = ?').get(req.user.id);
    let config;
    if (existing) {
      config = await db.prepare(
        `UPDATE offering_config SET pix_key=?, pix_name=?, paypal_email=?, bank_name=?, bank_agency=?, bank_account=?, bank_holder=?, custom_message=?, updated_at=NOW()
         WHERE pastor_id=? RETURNING *`
      ).get(pix_key, pix_name, paypal_email, bank_name, bank_agency, bank_account, bank_holder, custom_message, req.user.id);
    } else {
      config = await db.prepare(
        `INSERT INTO offering_config (pastor_id, pix_key, pix_name, paypal_email, bank_name, bank_agency, bank_account, bank_holder, custom_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).get(req.user.id, pix_key, pix_name, paypal_email, bank_name, bank_agency, bank_account, bank_holder, custom_message);
    }
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offerings/church/:pastorId — public: get offering info for a church/pastor
router.get('/church/:pastorId', async (req, res) => {
  try {
    const config = await db.prepare(
      `SELECT oc.*, u.full_name AS pastor_name FROM offering_config oc
       JOIN users u ON u.id = oc.pastor_id
       WHERE oc.pastor_id = ?`
    ).get(req.params.pastorId);
    if (!config) return res.status(404).json({ error: 'Configuração não encontrada' });
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offerings/record — member records a contribution
router.post('/record', authenticate, async (req, res) => {
  try {
    const { pastor_id, amount, type, method, note } = req.body;
    const record = await db.prepare(
      `INSERT INTO offering_records (donor_id, pastor_id, amount, type, method, note)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(req.user.id, pastor_id, amount, type || 'oferta', method || 'pix', note);
    res.status(201).json({ record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offerings/records — pastor sees all contributions
router.get('/records', authenticate, pastorOnly, async (req, res) => {
  try {
    const records = await db.prepare(
      `SELECT r.*, u.full_name AS donor_name FROM offering_records r
       JOIN users u ON u.id = r.donor_id
       WHERE r.pastor_id = ?
       ORDER BY r.created_at DESC LIMIT 100`
    ).all(req.user.id);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
