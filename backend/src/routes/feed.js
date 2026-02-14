const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Ensure uploads directory exists
const postsDir = path.join(__dirname, '..', '..', 'uploads', 'posts');
fs.mkdirSync(postsDir, { recursive: true });

// Multer config for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

// GET /api/feed — list all posts (newest first, paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE fp.visibility = 'public'
       ORDER BY fp.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ posts: rows, page, limit });
  } catch (err) {
    console.error('Erro ao buscar feed:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/feed/user/:userId — posts by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE fp.author_id = $1
       ORDER BY fp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.userId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) AS total FROM feed_posts WHERE author_id = $1',
      [req.params.userId]
    );

    res.json({ posts: rows, total: parseInt(countResult.rows[0].total), page, limit });
  } catch (err) {
    console.error('Erro ao buscar posts do usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/feed — create post (auth required)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { content, category, verse_reference, visibility } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    const mediaUrl = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const cat = category || 'testemunho';
    const vis = visibility || 'public';

    const { rows } = await db.query(
      `INSERT INTO feed_posts (author_id, content, category, media_url, verse_reference, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, content, cat, mediaUrl, verse_reference || null, vis]
    );

    res.status(201).json({ post: rows[0] });
  } catch (err) {
    console.error('Erro ao criar publicação:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/feed/:id — delete own post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM feed_posts WHERE id = $1 AND author_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });
    res.json({ message: 'Post deletado', post: rows[0] });
  } catch (err) {
    console.error('Erro ao deletar post:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
