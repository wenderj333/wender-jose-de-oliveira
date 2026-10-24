const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

(async () => {
  try {
    await db.query("ALTER TABLE offering_records ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR'");
    await db.query('ALTER TABLE offering_records ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false');
  } catch (e) { console.warn('offering_records migration:', e.message); }
})();

const CURRENCIES = ['EUR', 'BRL', 'USD', 'GBP', 'RON', 'CHF', 'RUB'];
const TYPES = ['dizimo', 'oferta'];
const METHODS = ['pix', 'transferencia', 'paypal', 'dinheiro', 'mbway', 'outro'];
const clean = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

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
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/offerings/config — save/update payment config
router.post('/config', authenticate, pastorOnly, async (req, res) => {
  try {
    const b = req.body || {};
    const pix_key = clean(b.pix_key, 255), pix_name = clean(b.pix_name, 255), paypal_email = clean(b.paypal_email, 255);
    const bank_name = clean(b.bank_name, 100), bank_agency = clean(b.bank_agency, 20), bank_account = clean(b.bank_account, 30), bank_holder = clean(b.bank_holder, 255);
    const custom_message = clean(b.custom_message, 1000);
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
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/offerings/my-church — a igreja do membro e como dar diretamente a ela
router.get('/my-church', authenticate, async (req, res) => {
  try {
    let r = await db.query(
      `SELECT c.id, c.name, c.pastor_id, u.full_name AS pastor_name
         FROM church_members m JOIN churches c ON c.id = m.church_id LEFT JOIN users u ON u.id = c.pastor_id
        WHERE m.user_id = $1 AND m.status = 'active' ORDER BY m.joined_at DESC NULLS LAST LIMIT 1`, [req.user.id]);
    if (!r.rows[0]) {
      r = await db.query(`SELECT c.id, c.name, c.pastor_id, u.full_name AS pastor_name FROM churches c LEFT JOIN users u ON u.id = c.pastor_id WHERE c.pastor_id = $1 LIMIT 1`, [req.user.id]);
    }
    const church = r.rows[0] || null;
    let config = null;
    if (church?.pastor_id) {
      const c = await db.query(`SELECT pix_key, pix_name, paypal_email, bank_name, bank_agency, bank_account, bank_holder, custom_message FROM offering_config WHERE pastor_id = $1`, [church.pastor_id]);
      config = c.rows[0] || null;
    }
    res.json({ church, config });
  } catch (err) {
    console.error('offerings/my-church:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/offerings/church/:pastorId — public: get offering info for a church/pastor
router.get('/church/:pastorId', async (req, res) => {
  try {
    const config = await db.prepare(
      `SELECT oc.pix_key, oc.pix_name, oc.paypal_email, oc.bank_name, oc.bank_agency, oc.bank_account, oc.bank_holder, oc.custom_message, u.full_name AS pastor_name FROM offering_config oc
       JOIN users u ON u.id = oc.pastor_id
       WHERE oc.pastor_id = ?`
    ).get(req.params.pastorId);
    if (!config) return res.status(404).json({ error: 'Configuração não encontrada' });
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/offerings/record — member records a contribution
router.post('/record', authenticate, async (req, res) => {
  try {
    // O membro declara o que deu diretamente à igreja. Fica marcado como "declarado" (não verificado).
    const { pastor_id } = req.body || {};
    const amount = Math.round(Number(req.body?.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount < 0.5 || amount > 100000) return res.status(400).json({ error: 'invalid_amount' });
    const type = TYPES.includes(req.body?.type) ? req.body.type : 'oferta';
    const method = METHODS.includes(req.body?.method) ? req.body.method : 'outro';
    const currency = CURRENCIES.includes(String(req.body?.currency || '').toUpperCase()) ? String(req.body.currency).toUpperCase() : 'EUR';
    const p = await db.query(`SELECT id FROM users WHERE id::text = $1 AND role IN ('pastor', 'admin')`, [String(pastor_id || '')]);
    if (!p.rows[0]) return res.status(400).json({ error: 'invalid_pastor' });
    const record = await db.prepare(
      `INSERT INTO offering_records (donor_id, pastor_id, amount, type, method, note, currency, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, false) RETURNING *`
    ).get(req.user.id, pastor_id, amount, type, method, clean(req.body?.note, 500), currency);
    res.status(201).json({ record });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
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
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
