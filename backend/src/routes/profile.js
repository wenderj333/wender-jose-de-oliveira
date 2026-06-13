const router = require('express').Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, ministry FROM users WHERE id = ', [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.stats = { posts: 0, friends: 0, prayers: 0 };
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/photo', authenticate, async (req, res) => {
  try {
    const { photoURL } = req.body;
    const userId = req.user.id;
    if (!photoURL) return res.status(400).json({ error: 'photoURL is required' });
    await db.query('UPDATE users SET avatar_url =  WHERE id = ', [photoURL, userId]);
    const updated = await db.query('SELECT avatar_url FROM users WHERE id = ', [userId]);
    res.json({ success: true, avatar_url: updated.rows[0].avatar_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url } = req.body;
    await db.query(
      'UPDATE users SET full_name=COALESCE(NULLIF(,), full_name), bio=COALESCE(NULLIF(,), bio), city=COALESCE(NULLIF(,), city), country=COALESCE(NULLIF(,), country), profession=COALESCE(NULLIF(,), profession), marital_status=COALESCE(NULLIF(,), marital_status), church_name=COALESCE(NULLIF(,), church_name), church_denomination=COALESCE(NULLIF(,), church_denomination), faith_years=COALESCE(NULLIF(,), faith_years), favorite_verse=COALESCE(NULLIF(,), favorite_verse), testimony=COALESCE(NULLIF(,), testimony), avatar_url=COALESCE(NULLIF(,), avatar_url), cover_url=COALESCE(NULLIF(,), cover_url), updated_at=NOW() WHERE id=',
      [full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url, userId]
    );
    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, marital_status, favorite_verse, testimony, church_denomination, faith_years FROM users WHERE id = ', [userId]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
