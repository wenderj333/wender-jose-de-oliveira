const router = require('express').Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, ministry FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch user stats (posts, friends, prayers)
    user.stats = { posts: 0, friends: 0, prayers: 0 };

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url } = req.body;
    await db.query(
      UPDATE users SET full_name=, bio=, city=, country=, profession=, marital_status=, church_name=, church_denomination=, faith_years=, favorite_verse=, testimony=, avatar_url=, cover_url=, updated_at=NOW() WHERE id=,
      [full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url, userId]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
    }

    const setClause = updateKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const updateValues = [...Object.values(updates), userId];

    await db.query(`UPDATE users SET ${setClause} WHERE id = $${updateKeys.length + 1}`, updateValues);

    const result = await db.query('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, ministry FROM users WHERE id = $1', [userId]);
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
    res.json({ success: true, user: { photoURL: updatedUser.rows[0].avatar_url, avatar_url: updatedUser.rows[0].avatar_url } });
  } catch (err) {
    console.error('Error updating profile photo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.patch('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url } = req.body;
    await db.query(
      UPDATE users SET full_name=, bio=, city=, country=, profession=, marital_status=, church_name=, church_denomination=, faith_years=, favorite_verse=, testimony=, avatar_url=, cover_url=, updated_at=NOW() WHERE id=,
      [full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url, userId]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;