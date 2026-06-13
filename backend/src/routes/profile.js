const router = require('express').Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      'SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, ministry FROM users WHERE id = ',
      [userId]
    );
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
    const fields = ['full_name','bio','city','country','profession','marital_status','church_name','denomination','christian_years','favorite_verse','testimony','avatar_url','cover_url'];
    const dbFields = ['full_name','bio','city','country','profession','marital_status','church_name','church_denomination','faith_years','favorite_verse','testimony','avatar_url','cover_url'];
    const updates = [];
    const values = [];
    let i = 1;
    fields.forEach((f, idx) => {
      if (req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== '') {
        updates.push(dbFields[idx] + '=$' + i);
        values.push(req.body[f]);
        i++;
      }
    });
    if (updates.length === 0) return res.json({ success: true });
    values.push(userId);
    await db.query('UPDATE users SET ' + updates.join(',') + ',updated_at=NOW() WHERE id=$' + i, values);
    const result = await db.query(
      'SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, marital_status, favorite_verse, testimony, church_denomination, faith_years FROM users WHERE id = ',
      [userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
