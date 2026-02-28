const router = require('express').Router();
const db = require('../db/connection');
const authenticateToken = require('../middleware/auth').authenticate;

// Get user profile (public)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.get('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, location, join_date FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // TODO: Fetch user stats (posts, friends, prayers)
    user.stats = { posts: 0, friends: 0, prayers: 0 };

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile fields (private, requires auth)
router.patch('/', authenticateToken, async (req, res) => {
  try {
    const { full_name, bio, location, church_name, cover_url } = req.body;
    const userId = req.user.id; // From auth middleware

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (church_name !== undefined) updates.church_name = church_name;
    if (cover_url !== undefined) updates.cover_url = cover_url;

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = updateKeys.map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updates);

    await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...updateValues, userId]);

    // Fetch updated user to return
    const updatedUser = await db.get('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, location, join_date FROM users WHERE id = ?', [userId]);

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New route: Update profile photo (avatar_url)
router.patch('/photo', authenticateToken, async (req, res) => {
  try {
    const { photoURL } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!photoURL) {
      return res.status(400).json({ error: 'photoURL is required' });
    }

    await db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [photoURL, userId]);

    // Fetch updated user to return
    const updatedUser = await db.get('SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, location, join_date FROM users WHERE id = ?', [userId]);

    res.json({ success: true, user: { photoURL: updatedUser.avatar_url } }); // Return only photoURL in user object
  } catch (err) {
    console.error('Error updating profile photo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;