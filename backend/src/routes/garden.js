// Jardim da Oração — cada membro tem uma "Árvore da Oração" que cresce quando ora pelos outros.
// O crescimento é calculado no servidor a partir de dados reais, com limites por dia,
// para crescer devagar e não haver batota.
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const MAX_GROWTH = 120;
// Fases: Semente da Oração, Broto, Arbusto, Árvore jovem, Árvore em flor, Árvore com frutos
const STAGES = [0, 5, 15, 35, 65, 100];
const LIMITS = { prayPerDay: 3, worldPerDay: 6, sharePerDay: 1, requestPerDay: 1 };
const POINTS = { join: 1, pray: 1, world: 0.5, share: 2, request: 3 };

const ready = (async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS garden_trees (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      growth NUMERIC DEFAULT 1,
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW())`);
    await db.query(`CREATE TABLE IF NOT EXISTS garden_marks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      kind VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW())`);
    await db.query('CREATE INDEX IF NOT EXISTS garden_marks_user_idx ON garden_marks(user_id, kind, created_at)');
  } catch (e) { console.error('garden tables:', e.message); }
})();

function viewer(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET).id; } catch { return null; }
}

const stageOf = (g) => { let s = 0; STAGES.forEach((t, i) => { if (g >= t) s = i; }); return s; };

// Crescimento calculado a partir das orações reais, com limite diário em cada tipo.
async function computeGrowth(userId) {
  const r = await db.query(`
    WITH pray AS (
      SELECT LEAST(COUNT(*), $2::int) AS n FROM help_post_prayers hpp
      JOIN help_posts hp ON hp.id = hpp.post_id
      WHERE hpp.user_id = $1 AND hp.user_id IS DISTINCT FROM $1
      GROUP BY date_trunc('day', hpp.created_at)
    ), req AS (
      SELECT LEAST(COUNT(*), $3::int) AS n FROM help_posts
      WHERE user_id = $1 AND post_type IN ('prayer','request')
      GROUP BY date_trunc('day', created_at)
    ), marks AS (
      SELECT kind, LEAST(COUNT(*), CASE WHEN kind = 'world' THEN $4::int ELSE $5::int END) AS n FROM garden_marks
      WHERE user_id = $1 GROUP BY kind, date_trunc('day', created_at)
    )
    SELECT COALESCE((SELECT SUM(n) FROM pray),0) AS pray,
           COALESCE((SELECT SUM(n) FROM req),0) AS req,
           COALESCE((SELECT SUM(n) FROM marks WHERE kind='world'),0) AS world,
           COALESCE((SELECT SUM(n) FROM marks WHERE kind='share'),0) AS share`,
  [userId, LIMITS.prayPerDay, LIMITS.requestPerDay, LIMITS.worldPerDay, LIMITS.sharePerDay]);
  const x = r.rows[0];
  const g = POINTS.join + Number(x.pray) * POINTS.pray + Number(x.req) * POINTS.request
    + Number(x.world) * POINTS.world + Number(x.share) * POINTS.share;
  return { growth: Math.min(MAX_GROWTH, g), parts: { pray: Number(x.pray), requests: Number(x.req), world: Number(x.world), share: Number(x.share) } };
}

// A árvore nunca encolhe: guarda-se o valor mais alto já alcançado.
async function refreshTree(userId) {
  const { growth, parts } = await computeGrowth(userId);
  const r = await db.query(`INSERT INTO garden_trees (user_id, growth) VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET growth = GREATEST(garden_trees.growth, EXCLUDED.growth), last_seen = NOW()
    RETURNING growth`, [userId, growth]);
  return { growth: Number(r.rows[0].growth), parts };
}

async function todayCounts(userId) {
  const r = await db.query(`SELECT
      (SELECT COUNT(*)::int FROM help_post_prayers hpp JOIN help_posts hp ON hp.id = hpp.post_id
        WHERE hpp.user_id = $1 AND hp.user_id IS DISTINCT FROM $1 AND hpp.created_at >= date_trunc('day', NOW())) AS pray,
      (SELECT COUNT(*)::int FROM garden_marks WHERE user_id = $1 AND kind = 'world' AND created_at >= date_trunc('day', NOW())) AS world,
      (SELECT COUNT(*)::int FROM garden_marks WHERE user_id = $1 AND kind = 'share' AND created_at >= date_trunc('day', NOW())) AS share`, [userId]);
  return r.rows[0];
}

// GET /api/garden — árvores, estatísticas da comunidade e a minha árvore
router.get('/', async (req, res) => {
  try {
    await ready;
    const me = viewer(req);
    let mine = null;
    if (me) {
      const t = await refreshTree(me);
      const today = await todayCounts(me);
      mine = { user_id: me, growth: t.growth, stage: stageOf(t.growth), parts: t.parts, today, limits: LIMITS };
    }
    const trees = await db.query(`
      SELECT gt.user_id, gt.growth::float AS growth, gt.created_at,
        split_part(COALESCE(u.display_name, u.full_name, ''), ' ', 1) AS name, u.avatar_url,
        (gt.last_seen > NOW() - INTERVAL '3 minutes') AS present,
        (SELECT MAX(hpp.created_at) FROM help_post_prayers hpp JOIN help_posts hp ON hp.id = hpp.post_id
          WHERE hp.user_id = gt.user_id AND hpp.user_id <> gt.user_id) AS last_prayer_received,
        -- Última vez que a pessoa orou (sem orar, a árvore vai perdendo as folhas ao longo de uma semana)
        GREATEST(gt.created_at,
          (SELECT MAX(x.created_at) FROM help_post_prayers x WHERE x.user_id = gt.user_id),
          (SELECT MAX(m.created_at) FROM garden_marks m WHERE m.user_id = gt.user_id AND m.kind IN ('world','share')),
          (SELECT MAX(h.created_at) FROM help_posts h WHERE h.user_id = gt.user_id AND h.post_type IN ('prayer','request'))) AS last_active
      FROM garden_trees gt JOIN users u ON u.id = gt.user_id
      WHERE LOWER(TRIM(COALESCE(u.full_name,''))) <> 'test user'
      ORDER BY (gt.user_id = $1::uuid) DESC, gt.growth DESC, gt.created_at ASC
      LIMIT 60`, [me]);
    const stats = await db.query(`SELECT
      (SELECT COUNT(*)::int FROM help_post_prayers) + (SELECT COUNT(*)::int FROM garden_marks WHERE kind = 'world') AS prayers,
      (SELECT COUNT(*)::int FROM help_posts WHERE post_type IN ('prayer','request') AND prayer_count > 0) AS intentions,
      (SELECT COUNT(*)::int FROM garden_trees WHERE last_seen > NOW() - INTERVAL '3 minutes') AS present`);
    res.json({
      stages: STAGES, max: MAX_GROWTH, points: POINTS,
      trees: trees.rows.map((t) => ({ ...t, stage: stageOf(t.growth) })),
      stats: stats.rows[0], mine,
    });
  } catch (e) {
    console.error('GET /garden:', e);
    res.status(500).json({ error: 'garden_failed' });
  }
});

// POST /api/garden/join — planta a Semente da Oração (e marca presença)
router.post('/join', authenticate, async (req, res) => {
  try { await ready; const t = await refreshTree(req.user.id); res.json({ growth: t.growth, stage: stageOf(t.growth) }); }
  catch (e) { console.error('garden join:', e); res.status(500).json({ error: 'garden_failed' }); }
});

// POST /api/garden/mark { kind: 'world' | 'share' } — oração mundial (bolha) ou partilha
router.post('/mark', authenticate, async (req, res) => {
  try {
    await ready;
    const kind = req.body?.kind === 'share' ? 'share' : req.body?.kind === 'world' ? 'world' : null;
    if (!kind) return res.status(400).json({ error: 'invalid_kind' });
    const limit = kind === 'world' ? LIMITS.worldPerDay : LIMITS.sharePerDay;
    const today = await db.query(`SELECT COUNT(*)::int AS n FROM garden_marks WHERE user_id = $1 AND kind = $2 AND created_at >= date_trunc('day', NOW())`, [req.user.id, kind]);
    const counted = today.rows[0].n < limit;
    // A oração mundial fica sempre guardada; só não conta para o crescimento depois do limite do dia.
    if (counted || kind === 'world') await db.query('INSERT INTO garden_marks (user_id, kind) VALUES ($1, $2)', [req.user.id, kind]);
    const t = await refreshTree(req.user.id);
    res.json({ counted, growth: t.growth, stage: stageOf(t.growth), today: await todayCounts(req.user.id) });
  } catch (e) { console.error('garden mark:', e); res.status(500).json({ error: 'garden_failed' }); }
});

module.exports = router;
module.exports.refreshTree = refreshTree;
