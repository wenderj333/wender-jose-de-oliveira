const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');

async function ensureSchema() {
  await db.query(`CREATE TABLE IF NOT EXISTS pastor_applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    church_name VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    country VARCHAR(120) NOT NULL,
    address TEXT, phone VARCHAR(80), message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id), reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  ));`);
}

router.post('/', authenticate, async (req, res) => {
  try {
    await ensureSchema();
    const churchName = String(req.body?.church_name || '').trim();
    const city = String(req.body?.city || '').trim();
    const country = String(req.body?.country || '').trim();
    const address = String(req.body?.address || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const message = String(req.body?.message || '').trim();
    if (!churchName || !city || !country) return res.status(400).json({ error: 'Informe o nome da igreja, cidade e país.' });
    const existing = await db.query('SELECT id, status FROM pastor_applications WHERE user_id = $1', [req.user.id]);
    if (existing.rows[0]?.status === 'approved') return res.status(400).json({ error: 'Esta conta já foi aprovada como pastor.' });
    const id = existing.rows[0]?.id || crypto.randomUUID();
    const result = await db.query(
      `INSERT INTO pastor_applications (id, user_id, church_name, city, country, address, phone, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
       ON CONFLICT (user_id) DO UPDATE SET church_name=EXCLUDED.church_name, city=EXCLUDED.city, country=EXCLUDED.country,
       address=EXCLUDED.address, phone=EXCLUDED.phone, message=EXCLUDED.message, status='pending', reviewed_by=NULL, reviewed_at=NULL, updated_at=NOW()
       RETURNING *`, [id, req.user.id, churchName, city, country, address || null, phone || null, message || null]
    );
    res.status(201).json({ application: result.rows[0], message: 'Pedido enviado. A sua conta será analisada antes de abrir a Sala do Pastor.' });
  } catch (error) { console.error('Erro no pedido de pastor:', error.message); res.status(500).json({ error: 'Não foi possível enviar o pedido agora.' }); }
});

router.get('/mine', authenticate, async (req, res) => {
  try { await ensureSchema(); const result = await db.query('SELECT * FROM pastor_applications WHERE user_id = $1', [req.user.id]); res.json({ application: result.rows[0] || null }); }
  catch (_) { res.status(500).json({ error: 'Não foi possível consultar o pedido.' }); }
});

router.get('/', authenticate, requireRole('admin'), async (_req, res) => {
  try { await ensureSchema(); const result = await db.query(`SELECT pa.*, u.full_name, u.email FROM pastor_applications pa JOIN users u ON u.id = pa.user_id ORDER BY CASE pa.status WHEN 'pending' THEN 0 ELSE 1 END, pa.created_at DESC`); res.json({ applications: result.rows }); }
  catch (_) { res.status(500).json({ error: 'Não foi possível listar os pedidos.' }); }
});

router.patch('/:id/review', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await ensureSchema(); const status = req.body?.status;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Decisão inválida.' });
    const result = await db.query(`UPDATE pastor_applications SET status=$1, reviewed_by=$2, reviewed_at=NOW(), updated_at=NOW() WHERE id=$3 RETURNING *`, [status, req.user.id, req.params.id]);
    const application = result.rows[0]; if (!application) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (status === 'approved') {
      await db.query("UPDATE users SET role='pastor', updated_at=NOW() WHERE id=$1", [application.user_id]);
      await createNotification(application.user_id, 'pastor_application', 'Sala do Pastor aprovada', 'O seu registo de pastor foi aprovado. Já pode abrir a Sala do Pastor.', { destination: '/sala-pastor' });
    } else await createNotification(application.user_id, 'pastor_application', 'Pedido de pastor analisado', 'O seu pedido não foi aprovado agora. Pode atualizar os dados e enviar novamente.', { destination: '/registo-pastor' });
    res.json({ application });
  } catch (error) { console.error('Erro ao analisar pedido:', error.message); res.status(500).json({ error: 'Não foi possível analisar o pedido.' }); }
});

module.exports = router;
