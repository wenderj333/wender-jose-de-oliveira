const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Campos de controlo usados pela Oração Mundial. A migração é idempotente.
(async () => {
  try {
    await db.query('ALTER TABLE pastor_prayer_sessions ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true');
    await db.query('ALTER TABLE pastor_prayer_sessions ADD COLUMN IF NOT EXISTS vow_enabled BOOLEAN DEFAULT false');
  } catch (error) { console.error('Prayer controls migration:', error.message); }
})();

async function pastorChurch(userId) {
  return db.prepare('SELECT id, name FROM churches WHERE pastor_id = ?').get(userId);
}

router.get('/mine', authenticate, async (req, res) => {
  try {
    const vows = await db.prepare(`
      SELECT v.*, c.name AS church_name, r.status AS response_status, r.pledge_amount, r.currency
      FROM faith_vows v
      JOIN churches c ON c.id = v.church_id
      JOIN church_members cm ON cm.church_id = v.church_id AND cm.user_id = ? AND cm.status = 'active'
      LEFT JOIN faith_vow_responses r ON r.vow_id = v.id AND r.user_id = ?
      WHERE v.status = 'active' AND (v.closes_at IS NULL OR v.closes_at > NOW())
      ORDER BY v.created_at DESC
    `).all(req.user.id, req.user.id);
    res.json({ vows });
  } catch (_) { res.status(500).json({ error: 'Não foi possível carregar os Votos de Fé.' }); }
});

router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const { status, amount } = req.body;
    if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'Resposta inválida.' });
    const vow = await db.prepare("SELECT * FROM faith_vows WHERE id = ? AND status = 'active'").get(req.params.id);
    if (!vow) return res.status(404).json({ error: 'Este voto já não está disponível.' });
    const member = await db.prepare("SELECT id FROM church_members WHERE church_id = ? AND user_id = ? AND status = 'active'").get(vow.church_id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Este voto é apenas para os membros desta igreja.' });
    const pledge = status === 'accepted' && amount !== '' && amount !== undefined ? Number(amount) : null;
    if (pledge !== null && (!Number.isFinite(pledge) || pledge <= 0)) return res.status(400).json({ error: 'Indica um valor válido ou deixa o valor em branco.' });
    const response = await db.prepare(`
      INSERT INTO faith_vow_responses (vow_id, user_id, status, pledge_amount, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON CONFLICT (vow_id, user_id) DO UPDATE SET status = EXCLUDED.status, pledge_amount = EXCLUDED.pledge_amount, updated_at = NOW()
      RETURNING *
    `).get(vow.id, req.user.id, status, pledge);
    res.json({ response });
  } catch (_) { res.status(500).json({ error: 'Não foi possível guardar a tua resposta.' }); }
});

router.use(authenticate);

router.get('/pastor/list', async (req, res) => {
  if (!['pastor', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Acesso restrito.' });
  try {
    const church = await pastorChurch(req.user.id);
    if (!church) return res.json({ church: null, vows: [] });
    const vows = await db.prepare(`
      SELECT v.*, COUNT(r.id) FILTER (WHERE r.status = 'accepted')::int AS accepted_count,
        COUNT(r.id) FILTER (WHERE r.status = 'declined')::int AS declined_count,
        COALESCE(SUM(r.pledge_amount) FILTER (WHERE r.status = 'accepted'), 0) AS pledged_total
      FROM faith_vows v LEFT JOIN faith_vow_responses r ON r.vow_id = v.id
      WHERE v.church_id = ? GROUP BY v.id ORDER BY v.created_at DESC
    `).all(church.id);
    const members = await db.prepare("SELECT COUNT(*)::int AS count FROM church_members WHERE church_id = ? AND status = 'active'").get(church.id);
    res.json({ church, member_count: members?.count || 0, vows });
  } catch (_) { res.status(500).json({ error: 'Não foi possível carregar os votos.' }); }
});

router.post('/pastor', async (req, res) => {
  if (!['pastor', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Acesso restrito.' });
  try {
    const { title, message, bible_verse, closes_at } = req.body;
    if (!title?.trim() || !message?.trim()) return res.status(400).json({ error: 'Nome e mensagem do voto são obrigatórios.' });
    const church = await pastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Cria a tua igreja antes de enviar um voto.' });
    const vow = await db.prepare(`INSERT INTO faith_vows (church_id, created_by, title, message, bible_verse, closes_at)
      VALUES (?, ?, ?, ?, ?, ?) RETURNING *`).get(church.id, req.user.id, title.trim(), message.trim(), bible_verse?.trim() || null, closes_at || null);
    const members = await db.prepare("SELECT user_id FROM church_members WHERE church_id = ? AND status = 'active'").all(church.id);
    for (const member of members) {
      await db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
        VALUES (uuid_generate_v4(), ?, 'faith_vow', ?, ?, false, NOW())`)
        .run(member.user_id, `✉️ Novo Voto de Fé: ${vow.title}`, 'Abra o envelope e responda livremente, sem obrigação.');
    }
    res.status(201).json({ vow, recipients: members.length });
  } catch (_) { res.status(500).json({ error: 'Não foi possível criar o voto.' }); }
});

router.post('/pastor/:id/close', async (req, res) => {
  if (!['pastor', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Acesso restrito.' });
  try {
    const church = await pastorChurch(req.user.id);
    const vow = await db.prepare("UPDATE faith_vows SET status = 'closed' WHERE id = ? AND church_id = ? RETURNING id").get(req.params.id, church?.id);
    if (!vow) return res.status(404).json({ error: 'Voto não encontrado.' });
    res.json({ success: true });
  } catch (_) { res.status(500).json({ error: 'Não foi possível encerrar o voto.' }); }
});

module.exports = router;
