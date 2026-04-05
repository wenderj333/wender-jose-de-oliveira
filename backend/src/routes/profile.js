const router = require('express').Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, favorite_verse, testimony, life_motto, church_denomination, faith_years, platform_purpose, spiritual_gifts, interest_areas, christian_values, spiritual_state, profile_public, verse_public, testimony_public, church_public FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch user stats (posts, friends, prayers)
    user.stats = { posts: 0, friends: 0, prayers: 0 };

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/', authenticate, async (req, res) => {
  try {
    const { full_name, bio, location, church_name, cover_url, avatar_url, favorite_verse, testimony, life_motto, church_denomination, faith_years, platform_purpose, spiritual_gifts, interest_areas, christian_values, spiritual_state, profile_public, verse_public, testimony_public, church_public } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (church_name !== undefined) updates.church_name = church_name;
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (favorite_verse !== undefined) updates.favorite_verse = favorite_verse;
    if (testimony !== undefined) updates.testimony = testimony;
    if (life_motto !== undefined) updates.life_motto = life_motto;
    if (church_denomination !== undefined) updates.church_denomination = church_denomination;
    if (faith_years !== undefined) updates.faith_years = faith_years;
    if (platform_purpose !== undefined) updates.platform_purpose = platform_purpose;
    if (spiritual_gifts !== undefined) updates.spiritual_gifts = spiritual_gifts;
    if (interest_areas !== undefined) updates.interest_areas = interest_areas;
    if (christian_values !== undefined) updates.christian_values = christian_values;
    if (spiritual_state !== undefined) updates.spiritual_state = spiritual_state;
    if (profile_public !== undefined) updates.profile_public = profile_public;
    if (verse_public !== undefined) updates.verse_public = verse_public;
    if (testimony_public !== undefined) updates.testimony_public = testimony_public;
    if (church_public !== undefined) updates.church_public = church_public;

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = updateKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const updateValues = [...Object.values(updates), userId];

    await db.query(`UPDATE users SET ${setClause} WHERE id = $${updateKeys.length + 1}`, updateValues);

    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, favorite_verse, testimony, life_motto, church_denomination, faith_years, platform_purpose, spiritual_gifts, interest_areas, christian_values, spiritual_state, profile_public, verse_public, testimony_public, church_public FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    res.json({ success: true, user });
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
