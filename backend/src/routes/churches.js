const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// ─── Migrações (cada uma isolada; repete no próximo pedido se alguma falhar) ───
const MIGRATIONS = [
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS latitude FLOAT',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS longitude FLOAT',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS address TEXT',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS cover_url TEXT',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS denomination VARCHAR(100)',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS phone VARCHAR(30)',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(30)',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
  'ALTER TABLE churches ADD COLUMN IF NOT EXISTS website VARCHAR(255)',
  "ALTER TABLE churches ADD COLUMN IF NOT EXISTS service_times JSONB DEFAULT '[]'",
  "ALTER TABLE churches ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free'",
  'ALTER TABLE church_events ADD COLUMN IF NOT EXISTS end_date DATE',
  'ALTER TABLE church_events ADD COLUMN IF NOT EXISTS image_url TEXT',
  `CREATE TABLE IF NOT EXISTS church_gallery_photos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), church_id UUID REFERENCES churches(id) ON DELETE CASCADE, photo_url TEXT NOT NULL, is_cover BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS church_followers (church_id UUID REFERENCES churches(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY (church_id, user_id))`,
  `CREATE TABLE IF NOT EXISTS church_announcements (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), church_id UUID REFERENCES churches(id) ON DELETE CASCADE, author_id UUID REFERENCES users(id) ON DELETE SET NULL, title VARCHAR(200) NOT NULL, content TEXT NOT NULL, priority VARCHAR(20) DEFAULT 'normal', image_url TEXT, recipients INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`,
  `CREATE TABLE IF NOT EXISTS church_prayer_requests (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), church_id UUID REFERENCES churches(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE CASCADE, content TEXT NOT NULL, is_anonymous BOOLEAN DEFAULT false, status VARCHAR(20) DEFAULT 'new', reply TEXT, replied_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW())`,
];
let migrated = null;
function ensureTables() {
  if (migrated) return migrated;
  migrated = (async () => {
    let ok = true;
    for (const sql of MIGRATIONS) {
      try { await db.query(sql); } catch (e) { ok = false; console.error('Churches migration:', e.message); }
    }
    if (!ok) migrated = null;
  })();
  return migrated;
}
setTimeout(() => ensureTables().then(() => console.log('Churches tables ready')), 3000);
router.use(async (req, res, next) => { try { await ensureTables(); } catch (_) {} next(); });

// ─── Helpers ────────────────────────────────────────────────────────────────
function viewerId(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(h.split(' ')[1], require('../middleware/auth').JWT_SECRET).id;
  } catch (_) { return null; }
}

// Devolve a igreja se o utilizador for o pastor dono (ou admin); senão responde com erro.
async function ownChurch(req, res) {
  const r = await db.query('SELECT * FROM churches WHERE id = $1', [req.params.id]);
  if (!r.rows.length) { res.status(404).json({ error: 'Igreja não encontrada' }); return null; }
  if (r.rows[0].pastor_id !== req.user.id && req.user.role !== 'admin') { res.status(403).json({ error: 'Sem permissão' }); return null; }
  return r.rows[0];
}

// Seguidores + membros ativos (sem repetir), exceto quem envia.
async function notifyChurchAudience(churchId, exceptUserId, type, title, body, data) {
  const r = await db.query(
    `SELECT user_id FROM church_followers WHERE church_id = $1
     UNION SELECT user_id FROM church_members WHERE church_id = $1 AND status = 'active'`, [churchId]);
  const ids = r.rows.map(x => x.user_id).filter(id => id && id !== exceptUserId);
  for (let i = 0; i < ids.length; i += 25) {
    await Promise.all(ids.slice(i, i + 25).map(id => createNotification(id, type, title, body, data)));
  }
  return ids.length;
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : v);
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function cleanServiceTimes(list) {
  if (!Array.isArray(list)) return null;
  return list.slice(0, 40).map(s => ({
    day: Math.min(6, Math.max(0, parseInt(s.day, 10) || 0)),
    time: TIME_RE.test(String(s.time || '')) ? s.time : '19:00',
    end: TIME_RE.test(String(s.end || '')) ? s.end : '',
    title: clean(String(s.title || ''), 80),
  })).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || a.time.localeCompare(b.time));
}

// ─── GET /api/churches — listar igrejas (busca por ?name=&city=) ───────────
router.get('/', async (req, res) => {
  try {
    const { name, city } = req.query;
    let sql = `
      SELECT c.id, c.name, c.pastor_name, c.city, c.country, c.logo_url, c.cover_url, c.denomination,
             COALESCE(c.status, 'active') AS status,
             (SELECT COUNT(*) FROM church_members cm WHERE cm.church_id = c.id AND cm.status = 'active')::int AS member_count,
             (SELECT COUNT(*) FROM church_followers f WHERE f.church_id = c.id)::int AS follower_count
      FROM churches c
      WHERE 1=1
    `;
    const params = [];
    if (name) { params.push(`%${name}%`); sql += ` AND c.name ILIKE $${params.length}`; }
    if (city) { params.push(`%${city}%`); sql += ` AND c.city ILIKE $${params.length}`; }
    sql += ` ORDER BY c.created_at DESC LIMIT 40`;
    const result = await db.query(sql, params);
    res.json({ churches: result.rows });
  } catch (err) {
    console.error('Erro ao listar igrejas:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/my/church — igreja do pastor autenticado ─────────────
router.get('/my/church', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'active')::int AS member_count,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'pending')::int AS pending_count,
              (SELECT COUNT(*) FROM church_followers WHERE church_id = c.id)::int AS follower_count,
              (SELECT COUNT(*) FROM church_prayer_requests WHERE church_id = c.id AND status = 'new')::int AS new_prayer_count
       FROM churches c
       WHERE c.pastor_id = $1
       LIMIT 1`,
      [req.user.id]
    );
    res.json({ church: result.rows[0] || null });
  } catch (err) {
    console.error('Erro ao buscar minha igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/my/prayer-requests — pedidos dos membros (pastor) ────
router.get('/my/prayer-requests', authenticate, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT pr.id, pr.content, pr.is_anonymous, pr.status, pr.reply, pr.replied_at, pr.created_at,
              CASE WHEN pr.is_anonymous THEN NULL ELSE u.full_name END AS author_name,
              CASE WHEN pr.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar,
              CASE WHEN pr.is_anonymous THEN NULL ELSE u.id END AS author_id
       FROM church_prayer_requests pr
       JOIN churches c ON c.id = pr.church_id
       LEFT JOIN users u ON u.id = pr.user_id
       WHERE c.pastor_id = $1
       ORDER BY (pr.status = 'new') DESC, pr.created_at DESC
       LIMIT 100`, [req.user.id]);
    res.json({ requests: r.rows });
  } catch (err) {
    console.error('Erro pedidos da igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── POST /api/churches — criar igreja ──────────────────────────────────────
router.post('/', authenticate, requireRole('pastor', 'admin'), async (req, res) => {
  try {
    const b = req.body || {};
    const name = clean(b.name, 255);
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const existing = await db.query('SELECT id FROM churches WHERE pastor_id = $1', [req.user.id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Já tens uma igreja registada', church_id: existing.rows[0].id });
    const lat = b.latitude === '' || b.latitude == null ? null : Number(b.latitude);
    const lng = b.longitude === '' || b.longitude == null ? null : Number(b.longitude);
    const result = await db.query(
      `INSERT INTO churches (pastor_id, name, pastor_name, description, city, country, address, denomination, phone, whatsapp, website, latitude, longitude, service_times, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'active') RETURNING *`,
      [req.user.id, name, clean(b.pastor_name, 255) || req.user.full_name, clean(b.description, 4000) || null,
       clean(b.city, 100) || null, clean(b.country, 100) || null, clean(b.address || b.location, 400) || null,
       clean(b.denomination, 100) || null, clean(b.phone, 30) || null, clean(b.whatsapp, 30) || null, clean(b.website, 255) || null,
       Number.isFinite(lat) ? lat : null, Number.isFinite(lng) ? lng : null,
       JSON.stringify(cleanServiceTimes(b.service_times) || [])]
    );
    // O pastor também é membro ativo (líder) da sua igreja
    try {
      await db.query(`INSERT INTO church_members (church_id, user_id, status, member_tag, joined_at) VALUES ($1,$2,'active','pastor',NOW()) ON CONFLICT DO NOTHING`, [result.rows[0].id, req.user.id]);
    } catch (_) {}
    res.status(201).json({ church: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/:id — página pública completa ────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const churchRes = await db.query(
      `SELECT c.*, u.full_name AS _pastor_full_name, u.avatar_url AS pastor_avatar,
              (SELECT COUNT(*) FROM church_members WHERE church_id = c.id AND status = 'active')::int AS member_count,
              (SELECT COUNT(*) FROM church_followers WHERE church_id = c.id)::int AS follower_count
       FROM churches c
       LEFT JOIN users u ON c.pastor_id = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    const church = churchRes.rows[0];
    if (!church.pastor_name) church.pastor_name = church._pastor_full_name;

    const [events, photos, anns] = await Promise.all([
      db.query(`SELECT * FROM church_events WHERE church_id = $1 AND COALESCE(end_date, event_date) >= CURRENT_DATE
                ORDER BY event_date ASC, event_time ASC LIMIT 30`, [req.params.id]).catch(() => ({ rows: [] })),
      db.query('SELECT id, photo_url, is_cover, created_at FROM church_gallery_photos WHERE church_id = $1 ORDER BY created_at DESC LIMIT 30', [req.params.id]).catch(() => ({ rows: [] })),
      db.query('SELECT id, title, content, priority, image_url, created_at FROM church_announcements WHERE church_id = $1 ORDER BY created_at DESC LIMIT 10', [req.params.id]).catch(() => ({ rows: [] })),
    ]);
    church.events = events.rows;
    church.photos = photos.rows;
    church.announcements = anns.rows;

    const uid = viewerId(req);
    church.is_pastor = false;
    church.is_following = false;
    church.user_membership_status = null;
    if (uid) {
      const [m, f, mine] = await Promise.all([
        db.query('SELECT status, member_tag FROM church_members WHERE church_id = $1 AND user_id = $2', [req.params.id, uid]),
        db.query('SELECT 1 FROM church_followers WHERE church_id = $1 AND user_id = $2', [req.params.id, uid]).catch(() => ({ rows: [] })),
        db.query('SELECT id, content, status, reply, replied_at, created_at FROM church_prayer_requests WHERE church_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 5', [req.params.id, uid]).catch(() => ({ rows: [] })),
      ]);
      church.user_membership_status = m.rows[0] || null;
      church.is_following = f.rows.length > 0;
      church.is_pastor = church.pastor_id === uid;
      church.my_prayer_requests = mine.rows;
    }
    delete church._pastor_full_name;
    res.json({ church });
  } catch (err) {
    console.error('Erro ao buscar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── PATCH /api/churches/:id — editar (só pastor dono) ──────────────────────
const EDITABLE = { name: 255, pastor_name: 255, description: 4000, city: 100, country: 100, address: 400, denomination: 100, phone: 30, whatsapp: 30, email: 255, website: 255, logo_url: 1000, cover_url: 1000 };
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const b = { ...(req.body || {}) };
    if (b.location !== undefined && b.address === undefined) b.address = b.location;
    const sets = []; const vals = [];
    for (const [k, max] of Object.entries(EDITABLE)) {
      if (b[k] === undefined) continue;
      const v = clean(String(b[k] ?? ''), max);
      if (k === 'name' && !v) continue;
      vals.push(v || null); sets.push(`${k} = $${vals.length}`);
    }
    for (const k of ['latitude', 'longitude']) {
      if (b[k] === undefined) continue;
      const n = b[k] === '' || b[k] === null ? null : Number(b[k]);
      if (n !== null && (!Number.isFinite(n) || Math.abs(n) > (k === 'latitude' ? 90 : 180))) return res.status(400).json({ error: 'Localização inválida' });
      vals.push(n); sets.push(`${k} = $${vals.length}`);
    }
    if (b.service_times !== undefined) {
      const st = cleanServiceTimes(b.service_times);
      if (!st) return res.status(400).json({ error: 'Horários inválidos' });
      vals.push(JSON.stringify(st)); sets.push(`service_times = $${vals.length}::jsonb`);
    }
    if (!sets.length) return res.json({ church });
    vals.push(req.params.id);
    const result = await db.query(`UPDATE churches SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`, vals);
    res.json({ church: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── DELETE /api/churches/:id — apagar (só pastor dono) ─────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    await db.query('DELETE FROM churches WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao apagar igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── Seguir / deixar de seguir ──────────────────────────────────────────────
router.post('/:id/follow', authenticate, async (req, res) => {
  try {
    const c = await db.query('SELECT id FROM churches WHERE id = $1', [req.params.id]);
    if (!c.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    await db.query('INSERT INTO church_followers (church_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.user.id]);
    const n = await db.query('SELECT COUNT(*)::int AS n FROM church_followers WHERE church_id = $1', [req.params.id]);
    res.json({ following: true, follower_count: n.rows[0].n });
  } catch (err) { console.error('follow:', err); res.status(500).json({ error: 'Erro interno' }); }
});
router.delete('/:id/follow', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM church_followers WHERE church_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const n = await db.query('SELECT COUNT(*)::int AS n FROM church_followers WHERE church_id = $1', [req.params.id]);
    res.json({ following: false, follower_count: n.rows[0].n });
  } catch (err) { console.error('unfollow:', err); res.status(500).json({ error: 'Erro interno' }); }
});

// ─── POST /api/churches/:id/join — pedir para ser membro ────────────────────
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const churchRes = await db.query('SELECT id, name, pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!churchRes.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    const existing = await db.query('SELECT id, status FROM church_members WHERE church_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (existing.rows.length && existing.rows[0].status !== 'rejected') {
      return res.status(400).json({ error: 'Já tens um pedido ou és membro desta igreja', status: existing.rows[0].status });
    }
    if (existing.rows.length) await db.query(`UPDATE church_members SET status = 'pending', created_at = NOW() WHERE id = $1`, [existing.rows[0].id]);
    else await db.query(`INSERT INTO church_members (church_id, user_id, status, member_tag) VALUES ($1, $2, 'pending', 'member')`, [req.params.id, req.user.id]);
    await db.query('INSERT INTO church_followers (church_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.user.id]).catch(() => {});
    const ch = churchRes.rows[0];
    if (ch.pastor_id && ch.pastor_id !== req.user.id) {
      await createNotification(ch.pastor_id, 'church_join', 'Novo pedido de membro ⛪', `${req.user.full_name || 'Uma pessoa'} quer ser membro da ${ch.name}.`, { from: req.user.id, churchId: ch.id, path: '/sala-pastor?secao=membros' });
    }
    res.json({ success: true, status: 'pending' });
  } catch (err) {
    console.error('Erro ao solicitar entrada:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── GET /api/churches/:id/members — listar membros (só pastor) ─────────────
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const { status } = req.query;
    const params = [req.params.id];
    let sql = `SELECT cm.*, u.full_name, u.email, u.avatar_url, u.last_seen_at FROM church_members cm
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
    const church = await ownChurch(req, res); if (!church) return;
    const { action, tag } = req.body;
    if (action === 'approve') {
      await db.query(`UPDATE church_members SET status = 'active', joined_at = NOW() WHERE church_id = $1 AND user_id = $2`, [req.params.id, req.params.userId]);
      await createNotification(req.params.userId, 'church_member', `Bem-vindo à ${church.name} ⛪`, 'O pastor aprovou o teu pedido. Já és membro da igreja.', { from: req.user.id, churchId: church.id, path: `/igrejas/${church.id}` });
    } else if (action === 'reject') {
      await db.query(`UPDATE church_members SET status = 'rejected' WHERE church_id = $1 AND user_id = $2`, [req.params.id, req.params.userId]);
    } else if (action === 'remove') {
      await db.query(`DELETE FROM church_members WHERE church_id = $1 AND user_id = $2`, [req.params.id, req.params.userId]);
    } else if (action === 'set_tag' && tag) {
      await db.query(`UPDATE church_members SET member_tag = $1 WHERE church_id = $2 AND user_id = $3`, [String(tag).slice(0, 30), req.params.id, req.params.userId]);
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
    await db.query(`DELETE FROM church_members WHERE church_id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao sair da igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── Eventos: cultos especiais, campanhas, reuniões ─────────────────────────
router.post('/:id/events', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const { title, description, event_type, event_date, event_time, end_date, image_url, notify } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Título e data são obrigatórios' });
    const end = end_date && end_date >= event_date ? end_date : null;
    const result = await db.query(
      `INSERT INTO church_events (church_id, created_by, title, description, event_type, event_date, event_time, end_date, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.params.id, req.user.id, clean(title, 255), clean(description, 2000) || null, clean(event_type, 30) || 'culto', event_date, event_time || null, end, clean(image_url, 1000) || null]
    );
    let recipients = 0;
    if (notify) {
      const icon = event_type === 'campanha' ? '🔥' : '📅';
      recipients = await notifyChurchAudience(church.id, req.user.id, 'church_event', `${icon} ${church.name}: ${clean(title, 120)}`,
        clean(description, 140) || String(event_date), { churchId: church.id, eventId: result.rows[0].id, path: `/igrejas/${church.id}` });
    }
    res.status(201).json({ event: result.rows[0], recipients });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/:id/events', async (req, res) => {
  try {
    const all = req.query.all === '1';
    const result = await db.query(
      `SELECT * FROM church_events WHERE church_id = $1 ${all ? '' : 'AND COALESCE(end_date, event_date) >= CURRENT_DATE'} ORDER BY event_date ASC, event_time ASC LIMIT 100`,
      [req.params.id]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/:id/events/:eventId', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    await db.query('DELETE FROM church_events WHERE id = $1 AND church_id = $2', [req.params.eventId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao apagar evento:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── Comunicados para seguidores e membros ──────────────────────────────────
router.get('/:id/announcements', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM church_announcements WHERE church_id = $1 ORDER BY created_at DESC LIMIT 50', [req.params.id]);
    res.json({ announcements: r.rows });
  } catch (err) { res.json({ announcements: [] }); }
});

router.post('/:id/announcements', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const title = clean(req.body.title, 200); const content = clean(req.body.content, 4000);
    if (!title || !content) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    const priority = req.body.priority === 'urgent' || req.body.priority === 'urgente' ? 'urgent' : 'normal';
    const ins = await db.query(
      `INSERT INTO church_announcements (church_id, author_id, title, content, priority, image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [church.id, req.user.id, title, content, priority, clean(req.body.image_url, 1000) || null]);
    const recipients = await notifyChurchAudience(church.id, req.user.id, 'church_announcement',
      `${priority === 'urgent' ? '🚨' : '📢'} ${church.name}: ${title}`, content.slice(0, 160),
      { from: req.user.id, churchId: church.id, announcementId: ins.rows[0].id, path: `/igrejas/${church.id}` });
    await db.query('UPDATE church_announcements SET recipients = $1 WHERE id = $2', [recipients, ins.rows[0].id]);
    res.status(201).json({ announcement: { ...ins.rows[0], recipients }, recipients });
  } catch (err) {
    console.error('Erro comunicado:', err);
    res.status(500).json({ error: 'Erro ao enviar comunicado' });
  }
});

router.delete('/:id/announcements/:aid', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    await db.query('DELETE FROM church_announcements WHERE id = $1 AND church_id = $2', [req.params.aid, church.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// ─── Pedidos de oração dos membros/seguidores para a igreja ─────────────────
router.post('/:id/prayer-requests', authenticate, async (req, res) => {
  try {
    const content = clean(req.body.content, 2000);
    if (!content || content.length < 3) return res.status(400).json({ error: 'Escreve o teu pedido.' });
    const c = await db.query('SELECT id, name, pastor_id FROM churches WHERE id = $1', [req.params.id]);
    if (!c.rows.length) return res.status(404).json({ error: 'Igreja não encontrada' });
    const recent = await db.query(`SELECT COUNT(*)::int AS n FROM church_prayer_requests WHERE church_id = $1 AND user_id = $2 AND created_at > NOW() - INTERVAL '1 day'`, [req.params.id, req.user.id]);
    if (recent.rows[0].n >= 5) return res.status(429).json({ error: 'Já enviaste vários pedidos hoje. O pastor vai orar por eles.' });
    const ins = await db.query(
      `INSERT INTO church_prayer_requests (church_id, user_id, content, is_anonymous) VALUES ($1,$2,$3,$4) RETURNING id, content, status, created_at`,
      [req.params.id, req.user.id, content, !!req.body.is_anonymous]);
    await db.query('INSERT INTO church_followers (church_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.user.id]).catch(() => {});
    const ch = c.rows[0];
    if (ch.pastor_id && ch.pastor_id !== req.user.id) {
      await createNotification(ch.pastor_id, 'prayer_request', 'Novo pedido de oração para a tua igreja 🙏',
        req.body.is_anonymous ? 'Um pedido anónimo chegou à Sala do Pastor.' : `${req.user.full_name || 'Um membro'} pediu oração.`,
        { ...(req.body.is_anonymous ? {} : { from: req.user.id }), churchId: ch.id, path: '/sala-pastor?secao=oracoes' });
    }
    res.status(201).json({ request: ins.rows[0] });
  } catch (err) {
    console.error('Erro pedido oração igreja:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.patch('/:id/prayer-requests/:rid', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const pr = await db.query('SELECT * FROM church_prayer_requests WHERE id = $1 AND church_id = $2', [req.params.rid, church.id]);
    if (!pr.rows.length) return res.status(404).json({ error: 'Pedido não encontrado' });
    const status = ['new', 'praying', 'answered'].includes(req.body.status) ? req.body.status : pr.rows[0].status;
    const reply = req.body.reply !== undefined ? clean(req.body.reply, 2000) || null : pr.rows[0].reply;
    const r = await db.query(
      `UPDATE church_prayer_requests SET status = $1, reply = $2, replied_at = CASE WHEN $2::text IS DISTINCT FROM reply THEN NOW() ELSE replied_at END WHERE id = $3 RETURNING *`,
      [req.body.reply && status === 'new' ? 'praying' : status, reply, req.params.rid]);
    const owner = pr.rows[0].user_id;
    if (owner && owner !== req.user.id) {
      if (req.body.reply) {
        await createNotification(owner, 'pastoral_reply', `${church.name} respondeu ao teu pedido 🙏`, String(reply).slice(0, 140), { from: req.user.id, churchId: church.id, path: `/igrejas/${church.id}` });
      } else if (status === 'praying' && pr.rows[0].status === 'new') {
        await createNotification(owner, 'prayer', `${church.name} está a orar por ti 🙏`, 'O teu pedido foi recebido pelo pastor. Não estás sozinho.', { from: req.user.id, churchId: church.id, path: `/igrejas/${church.id}` });
      }
    }
    res.json({ request: r.rows[0] });
  } catch (err) {
    console.error('Erro atualizar pedido:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── Localização ────────────────────────────────────────────────────────────
router.patch('/:id/location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) || Math.abs(Number(latitude)) > 90 || Math.abs(Number(longitude)) > 180) {
      return res.status(400).json({ error: 'Localização inválida' });
    }
    const church = await ownChurch(req, res); if (!church) return;
    await db.query('UPDATE churches SET latitude=$1, longitude=$2 WHERE id=$3', [latitude, longitude, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// ─── Galeria de fotos ───────────────────────────────────────────────────────
router.get('/:id/photos', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM church_gallery_photos WHERE church_id=$1 ORDER BY created_at DESC LIMIT 30', [req.params.id]);
    res.json({ photos: r.rows });
  } catch (err) { res.json({ photos: [] }); }
});

router.post('/:id/photos', authenticate, async (req, res) => {
  try {
    const { photo_url, is_cover } = req.body;
    if (!photo_url || typeof photo_url !== 'string' || !/^https:\/\//.test(photo_url)) return res.status(400).json({ error: 'Foto inválida' });
    const church = await ownChurch(req, res); if (!church) return;
    const n = await db.query('SELECT COUNT(*)::int AS n FROM church_gallery_photos WHERE church_id = $1', [church.id]);
    if (n.rows[0].n >= 30) return res.status(400).json({ error: 'Máximo de 30 fotos. Apague alguma para adicionar outra.' });
    if (is_cover) await db.query('UPDATE churches SET cover_url=$1 WHERE id=$2', [photo_url, church.id]);
    const ins = await db.query('INSERT INTO church_gallery_photos (church_id, photo_url, is_cover) VALUES ($1, $2, $3) RETURNING *', [church.id, photo_url.slice(0, 1000), !!is_cover]);
    res.json({ success: true, photo: ins.rows[0] });
  } catch (err) { console.error('photo:', err); res.status(500).json({ error: 'Erro interno' }); }
});

router.delete('/:id/photos/:photoId', authenticate, async (req, res) => {
  try {
    const church = await ownChurch(req, res); if (!church) return;
    const del = await db.query('DELETE FROM church_gallery_photos WHERE id = $1 AND church_id = $2 RETURNING photo_url', [req.params.photoId, church.id]);
    if (del.rows[0] && del.rows[0].photo_url === church.cover_url) await db.query('UPDATE churches SET cover_url = NULL WHERE id = $1', [church.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

module.exports = router;
