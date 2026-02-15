const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43',
  api_key: process.env.CLOUDINARY_API_KEY || '914835643241235',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7Eu52T0NYAAy2hmXHl0i4C0TgUo',
});

// Multer: store in memory for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime))$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens e vídeos são permitidos'));
  },
});

// Upload to Cloudinary helper
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sigo-com-fe/posts', resource_type: resourceType },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET /api/feed — list all posts (newest first, paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const posts = await db.prepare(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE fp.visibility = 'public'
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    res.json({ posts, page, limit });
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

    const posts = await db.prepare(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE fp.author_id = ?
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(req.params.userId, limit, offset);

    const countRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM feed_posts WHERE author_id = ?'
    ).get(req.params.userId);

    res.json({ posts, total: parseInt(countRow?.total || 0), page, limit });
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

    let mediaUrl = null;
    let mediaType = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        mediaUrl = result.secure_url;
        mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ error: 'Erro ao enviar mídia' });
      }
    }
    const cat = category || 'testemunho';
    const vis = visibility || 'public';

    // Insert and get the created post
    const result = await db.prepare(
      `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis);

    res.status(201).json({ post: result });
  } catch (err) {
    console.error('Erro ao criar publicação:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/feed/:id/report — report/flag a post
router.post('/:id/report', authenticate, async (req, res) => {
  try {
    await db.prepare('UPDATE feed_posts SET is_flagged = true, flag_reason = ? WHERE id = ?')
      .run(req.body.reason || 'Conteúdo inadequado', req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/feed/flagged — pastor/admin: see flagged posts
router.get('/flagged', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'pastor' && req.user.role !== 'admin') return res.status(403).json({ error: 'Sem permissão' });
    const posts = await db.prepare(
      `SELECT fp.*, u.full_name AS author_name FROM feed_posts fp JOIN users u ON u.id = fp.author_id WHERE fp.is_flagged = true ORDER BY fp.created_at DESC`
    ).all();
    res.json({ posts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/feed/:id/moderate — pastor/admin: remove flagged post
router.delete('/:id/moderate', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'pastor' && req.user.role !== 'admin') return res.status(403).json({ error: 'Sem permissão' });
    await db.prepare('DELETE FROM feed_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/feed/:id — delete own post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.prepare(
      'DELETE FROM feed_posts WHERE id = ? AND author_id = ? RETURNING *'
    ).get(req.params.id, req.user.id);

    if (!result) return res.status(404).json({ error: 'Post não encontrado' });
    res.json({ message: 'Post deletado', post: result });
  } catch (err) {
    console.error('Erro ao deletar post:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
