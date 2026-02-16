const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43',
  api_key: process.env.CLOUDINARY_API_KEY || '914835643241235',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7Eu52T0NYAAy2hmXHl0i4C0TgUo',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

// GET /api/profile/:userId — public profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await db.prepare(
      `SELECT u.id, u.full_name, u.display_name, u.avatar_url, u.bio, u.role, u.is_private, u.created_at,
              cr.role_name AS church_role, c.name AS church_name, c.id AS church_id
       FROM users u
       LEFT JOIN church_roles cr ON cr.user_id = u.id
       LEFT JOIN churches c ON c.id = cr.church_id
       WHERE u.id = ?
       LIMIT 1`
    ).get(req.params.userId);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ user });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/profile/:userId/stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    const prayers = await db.prepare('SELECT COUNT(*) AS count FROM prayers WHERE author_id = ?').get(userId);
    const posts = await db.prepare('SELECT COUNT(*) AS count FROM feed_posts WHERE author_id = ?').get(userId);
    let friends = { count: 0 };
    try {
      friends = await db.prepare(
        `SELECT COUNT(*) AS count FROM friendships WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'`
      ).get(userId, userId);
    } catch (e) { /* friendships table may not exist */ }

    res.json({
      prayers: parseInt(prayers?.count || 0),
      posts: parseInt(posts?.count || 0),
      friends: parseInt(friends?.count || 0),
    });
  } catch (err) {
    console.error('Erro ao buscar stats:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/profile/avatar — upload avatar (auth required)
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sigo-com-fe/avatars', resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const avatarUrl = result.secure_url;
    await db.prepare('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?')
      .run(avatarUrl, req.user.id);

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Erro ao fazer upload do avatar:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/profile — update own profile (auth required)
router.put('/', authenticate, async (req, res) => {
  try {
    const { display_name, bio, avatar_url, phone, is_private } = req.body;
    await db.prepare(
      `UPDATE users SET display_name = ?, bio = ?, avatar_url = ?, phone = ?, is_private = ?, updated_at = NOW() WHERE id = ?`
    ).run(display_name || null, bio || null, avatar_url || null, phone || null, is_private === true || is_private === 'true' ? true : false, req.user.id);

    const updated = await db.prepare(
      'SELECT id, full_name, display_name, avatar_url, bio, phone, role, is_private, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user: updated });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
