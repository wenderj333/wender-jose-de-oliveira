const router = require('express').Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, location, join_date FROM users WHERE id = ?').get(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // TODO: Fetch user stats (posts, friends, prayers)
    user.stats = { posts: 0, friends: 0, prayers: 0 };

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/', authenticate, async (req, res) => {
  try {
    const { full_name, bio, location, church_name, cover_url, avatar_url } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (church_name !== undefined) updates.church_name = church_name;
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = updateKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const updateValues = [...Object.values(updates), userId];

    await db.query(`UPDATE users SET ${setClause} WHERE id = $${updateKeys.length + 1}`, updateValues);

    const user = db.prepare('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, location, join_date FROM users WHERE id = ?').get(userId);

    res.json({ success: true, user: updatedUser.rows[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/photo', authenticate, async (req, res) => {
  try {
    const { photoURL } = req.body;
    const userId = req.user.id;

    if (!photoURL) {
      return res.status(400).json({ error: 'photoURL is required' });
    }

    await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [photoURL, userId]);

    const updatedUser = await db.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
    res.json({ success: true, user: { photoURL: updatedUser.rows[0].avatar_url } });
  } catch (err) {
    console.error('Error updating profile photo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
