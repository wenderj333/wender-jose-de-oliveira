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
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^(image\/(jpeg|png|gif|webp|heic|heif)|video\/(mp4|webm|quicktime|3gpp|x-m4v|mpeg|ogg|avi)|audio\/(mpeg|mp3|wav|ogg|m4a|aac|mp4))$/.test(file.mimetype)) cb(null, true);
    else cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`));
  },
});

// Upload to Cloudinary helper
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sigo-com-fe/posts', resource_type: resourceType, timeout: 120000 },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET /api/feed/cloudinary-signature — para upload direto do frontend (vídeos grandes)
router.get('/cloudinary-signature', authenticate, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'sigo-com-fe/posts' },
    process.env.CLOUDINARY_API_SECRET || '7Eu52T0NYAAy2hmXHl0i4C0TgUo'
  );
  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43',
    apiKey: process.env.CLOUDINARY_API_KEY || '914835643241235',
    folder: 'sigo-com-fe/posts',
  });
});

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
    const { category, verse_reference, visibility } = req.body;
    console.log('Feed POST body:', JSON.stringify(req.body));
    let content = req.body.content || '';
    
    // Allow posts with just media (no text required)
    const hasMedia = req.body.media_url || req.file || req.body.audio_url;
    if (!content.trim() && !hasMedia) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }
    // Default content if only media
    if (!content.trim()) content = '📸';

    let mediaUrl = req.body.media_url || null;
    let mediaType = req.body.media_type || null;
    let audioUrl = req.body.audio_url || null;

    // Se veio arquivo via multer (upload pequeno pelo backend)
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
    let result;
    try {
      result = await db.prepare(
        `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility, audio_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis, audioUrl);
    } catch (insertErr) {
      // Fallback if audio_url column doesn't exist yet
      if (insertErr.message && insertErr.message.includes('audio_url')) {
        result = await db.prepare(
          `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility)
           VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
        ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis);
      } else {
        throw insertErr;
      }
    }

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

// ===== LIKES =====

// POST /api/feed/:id/like — toggle like
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await db.prepare(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
    ).get(postId, req.user.id);

    if (existing) {
      await db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id);
      await db.prepare('UPDATE feed_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?').run(postId);
      res.json({ liked: false });
    } else {
      await db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id);
      await db.prepare('UPDATE feed_posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Erro ao curtir:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/feed/:id/liked — check if current user liked
router.get('/:id/liked', authenticate, async (req, res) => {
  try {
    const row = await db.prepare(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);
    res.json({ liked: !!row });
  } catch (err) {
    res.json({ liked: false });
  }
});

// ===== COMMENTS =====

// GET /api/feed/:id/comments — list comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await db.prepare(
      `SELECT pc.*, u.full_name AS author_name, u.avatar_url AS author_avatar
       FROM post_comments pc
       JOIN users u ON u.id = pc.author_id
       WHERE pc.post_id = ?
       ORDER BY pc.created_at ASC`
    ).all(req.params.id);
    res.json({ comments });
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/feed/:id/comments — add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comentário vazio' });

    const comment = await db.prepare(
      `INSERT INTO post_comments (post_id, author_id, content) VALUES (?, ?, ?) RETURNING *`
    ).get(req.params.id, req.user.id, content.trim());

    await db.prepare('UPDATE feed_posts SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.id);

    // Get author info
    const author = await db.prepare('SELECT full_name, avatar_url FROM users WHERE id = ?').get(req.user.id);
    comment.author_name = author?.full_name;
    comment.author_avatar = author?.avatar_url;

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Erro ao comentar:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/feed/comments/:commentId — delete own comment
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await db.prepare(
      'DELETE FROM post_comments WHERE id = ? AND author_id = ? RETURNING post_id'
    ).get(req.params.commentId, req.user.id);
    if (comment) {
      await db.prepare('UPDATE feed_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?').run(comment.post_id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
