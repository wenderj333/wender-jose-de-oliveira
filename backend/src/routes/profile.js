const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const DEFAULT_VISIBILITY = { personal: 'friends', church: 'public', faith: 'public', bio: 'public' };
const ALLOWED_VISIBILITY = new Set(['public', 'friends', 'private']);

const profileColumnsReady = (async () => {
  const columns = [
    'cover_url TEXT', 'city TEXT', 'country TEXT', 'profession TEXT', 'work TEXT',
    'birthdate TEXT', 'marital_status TEXT', 'favorite_verse TEXT', 'testimony TEXT',
    'church_name TEXT', 'church_denomination TEXT', 'faith_years TEXT', 'ministry TEXT',
    'email_updates_opt_in BOOLEAN NOT NULL DEFAULT false',
"profile_visibility JSONB NOT NULL DEFAULT '{\"personal\":\"friends\",\"church\":\"public\",\"faith\":\"public\",\"bio\":\"public\"}'::jsonb"
  ];
  for (const column of columns) await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ' + column);
})().catch(error => {
  console.error('Profile columns migration:', error.message);
  throw error;
});

function viewerId(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try { return jwt.verify(header.slice(7), JWT_SECRET).id; } catch (_) { return null; }
}

function normalizedVisibility(value = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_VISIBILITY).map(([key, fallback]) => [
    key, ALLOWED_VISIBILITY.has(value[key]) ? value[key] : fallback
  ]));
}

function canSee(audience, isOwner, isFriend) {
  return isOwner || audience === 'public' || (audience === 'friends' && isFriend);
}

router.get('/:userId', async (req, res) => {
  try {
    await profileColumnsReady;
    const { userId } = req.params;
    const currentViewerId = viewerId(req);
    const result = await db.query(`SELECT id, full_name, email, role, avatar_url, cover_url, bio,
      church_name, city, country, profession, work, birthdate, marital_status, favorite_verse,
      testimony, church_denomination, faith_years, ministry, profile_visibility, email_updates_opt_in
      FROM users WHERE id = $1`, [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });

    const isOwner = currentViewerId === userId;
    let isFriend = false;
    if (currentViewerId && !isOwner) {
      const friendship = await db.query(`SELECT 1 FROM friendships
        WHERE status = 'accepted' AND ((requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)) LIMIT 1`, [currentViewerId, userId]);
      isFriend = friendship.rowCount > 0;
    }

    const visibility = normalizedVisibility(user.profile_visibility);
    if (!isOwner) {
      delete user.email;
      delete user.email_updates_opt_in;
    }
    if (!canSee(visibility.personal, isOwner, isFriend)) {
      ['city', 'country', 'profession', 'work', 'birthdate', 'marital_status'].forEach(field => delete user[field]);
    }
    if (!canSee(visibility.church, isOwner, isFriend)) {
      ['church_name', 'church_denomination', 'faith_years', 'ministry'].forEach(field => delete user[field]);
    }
    if (!canSee(visibility.faith, isOwner, isFriend)) {
      ['favorite_verse', 'testimony'].forEach(field => delete user[field]);
    }
    if (!canSee(visibility.bio, isOwner, isFriend)) delete user.bio;
    if (!isOwner) delete user.profile_visibility;

    user.stats = { posts: 0, friends: 0, prayers: 0 };
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/photo', authenticate, async (req, res) => {
  try {
    await profileColumnsReady;
    const { photoURL } = req.body;
    const userId = req.user.id;
    if (!photoURL) return res.status(400).json({ error: 'photoURL is required' });
    await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [photoURL, userId]);
    const updated = await db.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
    res.json({ success: true, avatar_url: updated.rows[0].avatar_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/', authenticate, async (req, res) => {
  try {
    await profileColumnsReady;
    const userId = req.user.id;
    const { full_name, bio, city, country, profession, marital_status, church_name, denomination,
      christian_years, favorite_verse, testimony, avatar_url, cover_url, birth_date, ministry,
      profile_visibility, email_updates_opt_in } = req.body;
    const visibility = normalizedVisibility(profile_visibility);
    const emailUpdatesOptIn = typeof email_updates_opt_in === 'boolean' ? email_updates_opt_in : null;
    await db.query(`UPDATE users SET
      full_name=COALESCE(NULLIF($1,''), full_name), bio=COALESCE($2, bio),
      city=COALESCE($3, city), country=COALESCE($4, country), profession=COALESCE($5, profession),
      marital_status=COALESCE($6, marital_status), church_name=COALESCE($7, church_name),
      church_denomination=COALESCE($8, church_denomination), faith_years=COALESCE($9, faith_years),
      favorite_verse=COALESCE($10, favorite_verse), testimony=COALESCE($11, testimony),
      avatar_url=COALESCE(NULLIF($12,''), avatar_url), cover_url=COALESCE(NULLIF($13,''), cover_url),
      birthdate=COALESCE($14, birthdate), ministry=COALESCE($15, ministry),
      profile_visibility=$16::jsonb, email_updates_opt_in=COALESCE($17, email_updates_opt_in),
      updated_at=NOW() WHERE id=$18`,
      [full_name, bio, city, country, profession, marital_status, church_name, denomination,
        christian_years, favorite_verse, testimony, avatar_url, cover_url, birth_date, ministry,
        JSON.stringify(visibility), emailUpdatesOptIn, userId]);
    const result = await db.query(`SELECT id, full_name, email, role, avatar_url, cover_url, bio,
      church_name, city, country, profession, marital_status, favorite_verse, testimony,
      church_denomination, faith_years, birthdate, ministry, profile_visibility, email_updates_opt_in
      FROM users WHERE id = $1`, [userId]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- Amém na foto de perfil (persistente + notificação) ----
const profileAmensReady = db.query(`CREATE TABLE IF NOT EXISTS profile_amens (
  profile_user_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_user_id, user_id)
)`).catch(error => console.error('Profile amens migration:', error.message));

async function profileAmenState(profileUserId, viewer) {
  const count = await db.query('SELECT COUNT(*)::int AS total FROM profile_amens WHERE profile_user_id = $1', [profileUserId]);
  let amened = false;
  if (viewer) {
    const mine = await db.query('SELECT 1 FROM profile_amens WHERE profile_user_id = $1 AND user_id = $2', [profileUserId, viewer]);
    amened = mine.rows.length > 0;
  }
  return { count: Number(count.rows[0]?.total || 0), amened };
}

// GET /api/profile/:userId/amens
router.get('/:userId/amens', async (req, res) => {
  try {
    await profileAmensReady;
    res.json(await profileAmenState(req.params.userId, viewerId(req)));
  } catch (err) {
    console.error('Profile amens error:', err.message);
    res.json({ count: 0, amened: false });
  }
});

// POST /api/profile/:userId/amen — alterna o Amém
router.post('/:userId/amen', authenticate, async (req, res) => {
  try {
    await profileAmensReady;
    const profileUserId = req.params.userId;
    const target = await db.query('SELECT id FROM users WHERE id = $1', [profileUserId]);
    if (!target.rows[0]) return res.status(404).json({ error: 'Utilizador não encontrado' });
    const removed = await db.query('DELETE FROM profile_amens WHERE profile_user_id = $1 AND user_id = $2 RETURNING 1', [profileUserId, req.user.id]);
    if (removed.rows.length === 0) {
      const inserted = await db.query('INSERT INTO profile_amens (profile_user_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1', [profileUserId, req.user.id]);
      if (inserted.rows.length && profileUserId !== req.user.id) {
        try {
          const { createNotification } = require('./notifications');
          const who = req.user.full_name || 'Alguém';
          await createNotification(profileUserId, 'like', who + ' deu Amém 🙏 na sua foto de perfil', '', { from: req.user.id, url: '/perfil/' + req.user.id, kind: 'profile_amen', who });
        } catch (e) { console.error('Profile amen notification:', e.message); }
      }
    }
    res.json(await profileAmenState(profileUserId, req.user.id));
  } catch (err) {
    console.error('Profile amen toggle error:', err.message);
    res.status(500).json({ error: 'Não foi possível dar Amém agora. Tenta novamente.' });
  }
});

// ---- Resumo do perfil: irmãos, irmãos em comum, igreja, jornada de fé e medalhas ----
const FOUNDER_UNTIL = new Date(process.env.FOUNDER_UNTIL || '2026-11-02T00:00:00Z');
const safeCount = async (sql, params) => { try { const r = await db.query(sql, params); return Number(r.rows[0]?.n || 0); } catch (_) { return 0; } };
router.get('/:userId/overview', async (req, res) => {
  try {
    await profileColumnsReady;
    const { userId } = req.params;
    if (!/^[0-9a-f-]{36}$/i.test(String(userId))) return res.status(404).json({ error: 'not_found' });
    const u = await db.query('SELECT id, full_name, role, created_at FROM users WHERE id = $1', [userId]);
    const target = u.rows[0];
    if (!target) return res.status(404).json({ error: 'not_found' });
    const vid = viewerId(req);
    const isOwner = !!vid && String(vid) === String(userId);
    let isFriend = false;
    if (vid && !isOwner) {
      isFriend = (await safeCount(`SELECT COUNT(*)::int AS n FROM friendships WHERE status = 'accepted'
        AND ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))`, [vid, userId])) > 0;
    }
    const friendsOf = `SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS fid
      FROM friendships WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)`;
    const friends = await safeCount(`SELECT COUNT(*)::int AS n FROM (${friendsOf}) f`, [userId]);
    let mutual = 0; let preview = [];
    try {
      if (vid && !isOwner) {
        mutual = await safeCount(`SELECT COUNT(*)::int AS n FROM (${friendsOf}) a
          WHERE a.fid IN (SELECT CASE WHEN requester_id = $2 THEN addressee_id ELSE requester_id END FROM friendships
                          WHERE status = 'accepted' AND (requester_id = $2 OR addressee_id = $2))`, [userId, vid]);
        const r = await db.query(`SELECT u.id, COALESCE(NULLIF(u.display_name, ''), u.full_name) AS name, u.avatar_url,
            (u.id IN (SELECT CASE WHEN requester_id = $2 THEN addressee_id ELSE requester_id END FROM friendships
                      WHERE status = 'accepted' AND (requester_id = $2 OR addressee_id = $2))) AS mutual
          FROM (${friendsOf}) f JOIN users u ON u.id = f.fid
          WHERE COALESCE(u.is_active, true) = true
          ORDER BY 4 DESC, u.last_seen_at DESC NULLS LAST LIMIT 6`, [userId, vid]);
        preview = r.rows;
      } else {
        const r = await db.query(`SELECT u.id, COALESCE(NULLIF(u.display_name, ''), u.full_name) AS name, u.avatar_url, false AS mutual
          FROM (${friendsOf}) f JOIN users u ON u.id = f.fid WHERE COALESCE(u.is_active, true) = true
          ORDER BY u.last_seen_at DESC NULLS LAST LIMIT 6`, [userId]);
        preview = r.rows;
      }
    } catch (_) { preview = []; }
    const visSql = isOwner ? '' : isFriend ? `AND COALESCE(visibility, 'public') IN ('public', 'friends')` : `AND COALESCE(visibility, 'public') = 'public'`;
    const posts = await safeCount(`SELECT COUNT(*)::int AS n FROM feed_posts WHERE author_id = $1 ${visSql}`, [userId]);
    const prayersMade = await safeCount('SELECT COUNT(*)::int AS n FROM help_post_prayers WHERE user_id = $1', [userId]);
    const requests = await safeCount(`SELECT COUNT(*)::int AS n FROM help_posts WHERE user_id = $1 AND post_type = 'prayer' ${isOwner ? '' : 'AND is_anonymous IS NOT TRUE'}`, [userId]);
    const answered = await safeCount(`SELECT COUNT(*)::int AS n FROM help_posts WHERE user_id = $1 AND post_type = 'prayer' AND help_status = 'answered' ${isOwner ? '' : 'AND is_anonymous IS NOT TRUE'}`, [userId]);
    const encouragements = await safeCount('SELECT COUNT(*)::int AS n FROM help_post_comments WHERE user_id = $1 AND is_pastoral IS NOT TRUE', [userId]);
    const amens = await safeCount('SELECT COUNT(*)::int AS n FROM profile_amens WHERE profile_user_id = $1', [userId]);
    const duelPoints = await safeCount('SELECT COALESCE(MAX(pontos), 0)::int AS n FROM duelo_ranking WHERE LOWER(nome) = LOWER($1)', [target.full_name || '']);
    let church = null;
    try {
      const c = await db.query(`SELECT c.id, c.name, c.logo_url, COALESCE(c.is_verified, false) AS verified FROM churches c
        WHERE c.pastor_id = $1 OR c.id IN (SELECT church_id FROM church_roles WHERE user_id = $1)
        ORDER BY (c.pastor_id = $1) DESC LIMIT 1`, [userId]);
      church = c.rows[0] || null;
    } catch (_) { church = null; }
    const joined = target.created_at ? new Date(target.created_at) : null;
    const badges = [];
    if (joined && joined < FOUNDER_UNTIL) badges.push('founder');
    if (prayersMade >= 10) badges.push('intercessor');
    if (encouragements >= 5) badges.push('encourager');
    if (answered >= 1) badges.push('answered');
    if (duelPoints >= 100) badges.push('champion');
    if (amens >= 20) badges.push('inspiring');
    res.set('Cache-Control', 'no-store');
    res.json({
      role: target.role || 'member', joined_at: joined ? joined.toISOString() : null, is_friend: isFriend,
      stats: { posts, friends, mutual, prayers_made: prayersMade, requests, answered, encouragements, amens, duel_points: duelPoints },
      friends_preview: preview, church, badges,
    });
  } catch (err) { console.error('profile overview', err.message); res.status(500).json({ error: 'server' }); }
});

module.exports = router;
