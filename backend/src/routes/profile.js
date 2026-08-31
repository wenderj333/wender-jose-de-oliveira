const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const DEFAULT_VISIBILITY = { personal: 'friends', church: 'public', faith: 'public', bio: 'public' };
const ALLOWED_VISIBILITY = new Set(['public', 'friends', 'private']);

db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility JSONB NOT NULL DEFAULT '{"personal":"friends","church":"public","faith":"public","bio":"public"}'::jsonb`)
  .catch(error => console.error('Profile visibility migration:', error.message));

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

module.exports = router;
