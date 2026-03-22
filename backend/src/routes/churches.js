const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// ─── GET /api/churches — listar igrejas (busca por ?name=&city=) ───────────────
router.get('/', async (req, res) => {
  try {
    const { name, city } = req.query;
    let sql = `
      SELECT c.id, c.name, c.pastor_name, c.city, c.country, c.logo_url,
             COALESCE(c.status, 'active') AS status,
             COUNT(cm.id) FILTER (WHERE cm.status = 'active') AS member_count
      FROM churches c
      LEFT JOIN church_members cm ON cm.church_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (name) { params.push(`%${name}%`); sql += ` AND c.name ILIKE $${params.length}`; }
    if (city) { params.push(`%${city}%`); sql += ` AND c.city ILIKE $${params.length}`; }
    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT 20`;
    const result = await db.query(sql, params);
    res.json({ churches: result.rows });
  } catch (err) {
    console.error('Erro ao listar igrejas:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/my/church — igreja do pastor autenticado ──────────────
router.get('/my/church', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'active')::int AS member_count,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'pending')::int AS pending_count
       FROM churches c
       WHERE c.pastor_id = $1`,
      [req.user.id]
    );
    res.json({ church: result.rows[0] || null });
  } catch (err) {
    console.error('Erro ao buscar minha igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── POST /api/churches — criar igreja ──────────────────────────────────────
router.post('/', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const { name, description, city, country, location, pastor_name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const existing = await db.query('SELECT id FROM churches WHERE pastor_id = $1', [req.user.id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Já tens uma igreja registada' });
    const result = await db.query(
      `INSERT INTO churches (pastor_id, name, pastor_name, description, city, country, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
      [req.user.id, name, pastor_name || req.user.full_name, description || null, city || null, country || null, location || null]
    );
    res.status(201).json({ church: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/:id — detalhes da igreja ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const churchRes = await db.query(
      `SELECT c.*, u.full_name AS _pastor_full_name,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'active')::int AS member_count
       FROM churches c
       LEFT JOIN users u ON c.pastor_id = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    const church = churchRes.rows[0];

    const eventsRes = await db.query(
      `SELECT * FROM church_events WHERE church_id = $1 AND event_date >= CURRENT_DATE ORDER BY event_date ASC, event_time ASC LIMIT 10`,
      [req.params.id]
    );
    church.events = eventsRes.rows;

    // Verificar membership status se token presente
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'sigo-com-fe-secret-dev';
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        const memberRes = await db.query(
          'SELECT status, member_tag FROM church_members WHERE church_id = $1 AND user_id = $2',
          [req.params.id, decoded.id]
        );
        church.user_membership_status = memberRes.rows[0] || null;
        church.is_pastor = church.pastor_id === decoded.id;
      } catch (_) { /* token inválido, ignorar */ }
    }

    res.json({ church });
  } catch (err) {
    console.error('Erro ao buscar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── PATCH /api/churches/:id — editar (só pastor dono) ──────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, city, country, location, pastor_name, logo_url } = req.body;
    const churchRes = await db.query('SELECT * FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const result = await db.query(
      `UPDATE churches SET
        name = COALESCE($1, name),
        pastor_name = COALESCE($2, pastor_name),
        description = COALESCE($3, description),
        city = COALESCE($4, city),
        country = COALESCE($5, country),
        address = COALESCE($6, address),
        logo_url = COALESCE($7, logo_url),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, pastor_name, description, city, country, location, logo_url, req.params.id]
    );
    res.json({ church: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── DELETE /api/churches/:id — apagar (só pastor dono) ─────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await db.query('DELETE FROM churches WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao apagar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── POST /api/churches/:id/join — solicitar entrada ────────────────────────
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    const existing = await db.query(
      'SELECT id, status FROM church_members WHERE church_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length) {
      return res.status(400).json({ error: 'Já tens um pedido ou és membro desta igreja', status: existing.rows[0].status });
    }
    await db.query(
      `INSERT INTO church_members (church_id, user_id, status, member_tag) VALUES ($1, $2, 'pending', 'member')`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, status: 'pending' });
  } catch (err) {
    console.error('Erro ao solicitar entrada:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/:id/members — listar membros (só pastor) ─────────────
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const { status } = req.query;
    const params = [req.params.id];
    let sql = `SELECT cm.*, u.full_name, u.email, u.avatar_url FROM church_members cm
               JOIN users u ON u.id = cm.user_id WHERE cm.church_id = $1`;
    if (status) { params.push(status); sql += ` AND cm.status = $${params.length}`; }
    sql += ` ORDER BY cm.created_at DESC`;
    const result = await db.query(sql, params);
    res.json({ members: result.rows });
  } catch (err) {
    console.error('Erro ao listar membros:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── PATCH /api/churches/:id/members/:userId — aprovar/recusar/remover ───────
router.patch('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const { action, tag } = req.body;
    if (action === 'approve') {
      await db.query(
        `UPDATE church_members SET status = 'active', joined_at = NOW() WHERE church_id = $1 AND user_id = $2`,
        [req.params.id, req.params.userId]
      );
    } else if (action === 'reject') {
      await db.query(
        `UPDATE church_members SET status = 'rejected' WHERE church_id = $1 AND user_id = $2`,
        [req.params.id, req.params.userId]
      );
    } else if (action === 'remove') {
      await db.query(
        `DELETE FROM church_members WHERE church_id = $1 AND user_id = $2`,
        [req.params.id, req.params.userId]
      );
    } else if (action === 'set_tag' && tag) {
      await db.query(
        `UPDATE church_members SET member_tag = $1 WHERE church_id = $2 AND user_id = $3`,
        [tag, req.params.id, req.params.userId]
      );
    } else {
      return res.status(400).json({ error: 'Ação inválida' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar membro:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── DELETE /api/churches/:id/leave — sair da igreja ────────────────────────
router.delete('/:id/leave', authenticate, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM church_members WHERE church_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao sair da igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── POST /api/churches/:id/events — criar evento ───────────────────────────
router.post('/:id/events', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const { title, description, event_type, event_date, event_time } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Título e data são obrigatórios' });
    const result = await db.query(
      `INSERT INTO church_events (church_id, created_by, title, description, event_type, event_date, event_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, req.user.id, title, description || null, event_type || 'culto', event_date, event_time || null]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/:id/events — listar eventos ──────────────────────────
router.get('/:id/events', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM church_events WHERE church_id = $1 ORDER BY event_date ASC, event_time ASC`,
      [req.params.id]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── DELETE /api/churches/:id/events/:eventId — apagar evento ───────────────
router.delete('/:id/events/:eventId', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    if (churchRes.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await db.query('DELETE FROM church_events WHERE id = $1 AND church_id = $2', [req.params.eventId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao apagar evento:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
