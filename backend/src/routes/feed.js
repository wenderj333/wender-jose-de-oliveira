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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

// Quem está a ver (token opcional) — para mostrar publicações "Membros"/"Amigos" e os próprios
function viewerId(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { return require('jsonwebtoken').verify(h.slice(7), require('../middleware/auth').JWT_SECRET).id || null; } catch (_) { return null; }
}
const VISIBILITIES = ['public', 'members', 'friends', 'private'];

(async () => {
  try {
    // Uma migração antiga só permitia 'public'/'church' — "Membros" e "Privado" falhavam
    await db.query('ALTER TABLE feed_posts DROP CONSTRAINT IF EXISTS feed_posts_visibility_check');
    await db.query(`CREATE TABLE IF NOT EXISTS post_comment_amens (
      comment_id UUID NOT NULL, user_id UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (comment_id, user_id))`);
  } catch (e) { console.warn('feed migration:', e.message); }
})();

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
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return res.status(503).json({ error: 'Envio de ficheiros temporariamente indisponível.' });
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'sigo-com-fe/posts' },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: 'sigo-com-fe/posts',
  });
});

// GET /api/feed — list all posts (newest first, paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    // Público para todos; "Membros" para quem tem sessão; "Amigos" para os amigos; e o autor vê sempre os seus
    const vid = viewerId(req);
    const result = await db.query(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE COALESCE(fp.visibility, 'public') = 'public'
          OR ($3::uuid IS NOT NULL AND (
                fp.author_id = $3::uuid
             OR fp.visibility = 'members'
             OR (fp.visibility = 'friends' AND EXISTS (SELECT 1 FROM friendships f WHERE f.status = 'accepted'
                   AND ((f.requester_id = $3::uuid AND f.addressee_id = fp.author_id) OR (f.addressee_id = $3::uuid AND f.requester_id = fp.author_id))))))
       ORDER BY fp.created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset, vid]);
    const posts = result.rows;

    res.json({ posts, page, limit });
  } catch (err) {
    console.error('Erro ao buscar feed:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/feed/post/:id — uma publicação (para abrir a partir de uma notificação)
router.get('/post/:id', async (req, res) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'not_found' });
    const vid = viewerId(req);
    const r = await db.query(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp JOIN users u ON u.id = fp.author_id
       WHERE fp.id = $1 AND (COALESCE(fp.visibility, 'public') = 'public'
          OR ($2::uuid IS NOT NULL AND (fp.author_id = $2::uuid OR fp.visibility = 'members'
             OR (fp.visibility = 'friends' AND EXISTS (SELECT 1 FROM friendships f WHERE f.status = 'accepted'
                   AND ((f.requester_id = $2::uuid AND f.addressee_id = fp.author_id) OR (f.addressee_id = $2::uuid AND f.requester_id = fp.author_id)))))))`,
      [req.params.id, vid]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json({ post: r.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// GET /api/feed/user/:userId — posts by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    // Quem vê: o dono vê tudo; amigos veem público + amigos; os outros só o público
    let vid = null;
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) { try { vid = require('jsonwebtoken').verify(h.slice(7), require('../middleware/auth').JWT_SECRET).id; } catch (_) { vid = null; } }
    const isOwner = !!vid && String(vid) === String(req.params.userId);
    let isFriend = false;
    if (vid && !isOwner) {
      const fr = await db.query(`SELECT 1 FROM friendships WHERE status = 'accepted' AND ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)) LIMIT 1`, [vid, req.params.userId]);
      isFriend = fr.rows.length > 0;
    }
    const visSql = isOwner ? '' : isFriend ? `AND COALESCE(fp.visibility, 'public') IN ('public', 'members', 'friends')` : vid ? `AND COALESCE(fp.visibility, 'public') IN ('public', 'members')` : `AND COALESCE(fp.visibility, 'public') = 'public'`;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT fp.*, u.full_name AS author_name, u.display_name AS author_display_name, u.avatar_url AS author_avatar
       FROM feed_posts fp
       JOIN users u ON u.id = fp.author_id
       WHERE fp.author_id = $1 ${visSql}
       ORDER BY fp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.userId, limit, offset]);

    const posts = result.rows;
    const countResult = await db.query(`SELECT COUNT(*) AS total FROM feed_posts fp WHERE fp.author_id = $1 ${visSql}`, [req.params.userId]);


    res.json({ posts, total: parseInt(countResult.rows[0]?.total || 0), page, limit });
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
    let coverUrl = req.body.cover_url || null;
    let musicTitle = req.body.music_title || null;

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
    const vis = VISIBILITIES.includes(visibility) ? visibility : 'public';

    // Insert and get the created post
    console.log('📝 Creating post:', {
      author_id: req.user.id,
      content,
      category: cat,
      media_url: mediaUrl,
      media_type: mediaType,
      audio_url: audioUrl,
      visibility: vis,
    });

    let result;
    try {
      result = await db.prepare(
        `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility, audio_url, cover_url, music_title)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis, audioUrl || null, coverUrl || null, musicTitle || null);
    } catch (insertErr) {
      // Fallback if audio_url column doesn't exist yet
      console.warn('⚠️ Insert with audio_url failed:', insertErr.message);
      if (insertErr.message && insertErr.message.includes('audio_url')) {
        console.log('↪️ Retrying without audio_url...');
        result = await db.prepare(
          `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility)
           VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
        ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis);
      } else {
        console.error('❌ Database insert error:', insertErr);
        throw insertErr;
      }
    }

    console.log('✅ Post created:', { id: result?.id, media_url: result?.media_url, audio_url: result?.audio_url });
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

// GET /api/feed/liked-posts — get all post IDs liked by current user (batch)
router.get('/liked-posts', authenticate, async (req, res) => {
  try {
    const rows = await db.prepare(
      'SELECT post_id FROM post_likes WHERE user_id = ?'
    ).all(req.user.id);
    const likedIds = rows.map(r => r.post_id);
    res.json({ likedIds });
  } catch (err) {
    console.error('Erro ao buscar likes:', err);
    res.json({ likedIds: [] });
  }
});

// POST /api/feed/:id/like — toggle like
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await db.prepare('SELECT id, author_id, like_count FROM feed_posts WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ error: 'Publicação não encontrada.' });
    const existing = await db.prepare(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
    ).get(postId, req.user.id);

    if (existing) {
      await db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id);
      await db.prepare('UPDATE feed_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?').run(postId);
      const updated = await db.prepare('SELECT like_count FROM feed_posts WHERE id = ?').get(postId);
      res.json({ liked: false, likeCount: Number(updated?.like_count || 0) });
    } else {
      await db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id);
      await db.prepare('UPDATE feed_posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
      try {
        if (post.author_id && post.author_id !== req.user.id) {
          const { createNotification } = require('./notifications');
          const [title, body] = await require('../services/notifyText').textFor('post_amen', post.author_id, req.user.full_name);
          await createNotification(post.author_id, 'like', title, body, { postId, kind: 'post_amen', who: req.user.full_name || null, from: req.user.id });
        }
      } catch(e) { console.error('Notif like error:', e.message); }
      const updated = await db.prepare('SELECT like_count FROM feed_posts WHERE id = ?').get(postId);
      res.json({ liked: true, likeCount: Number(updated?.like_count || 0) });
    }
  } catch (err) {
    console.error('Erro ao curtir:', err);
    // Mantém a resposta segura, mas dá uma indicação útil à interface.
    res.status(500).json({ error: 'Não foi possível atualizar o Amém agora. Tenta novamente.' });
  }
});

// GET /api/feed/:id/likes — list who liked a post
router.get('/:id/likes', async (req, res) => {
  try {
    const likes = await db.prepare(
      `SELECT u.full_name, u.avatar_url
       FROM post_likes pl
       JOIN users u ON u.id = pl.user_id
       WHERE pl.post_id = ?
       ORDER BY pl.created_at DESC`
    ).all(req.params.id);
    res.json({ likes });
  } catch (err) {
    console.error('Erro ao buscar likes:', err);
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
    const vid = viewerId(req);
    const r = await db.query(
      `SELECT pc.*, u.full_name AS author_name, u.avatar_url AS author_avatar,
              (SELECT COUNT(*)::int FROM post_comment_amens a WHERE a.comment_id = pc.id) AS amen_count,
              ($2::uuid IS NOT NULL AND EXISTS (SELECT 1 FROM post_comment_amens a WHERE a.comment_id = pc.id AND a.user_id = $2::uuid)) AS amened
       FROM post_comments pc
       JOIN users u ON u.id = pc.author_id
       WHERE pc.post_id = $1
       ORDER BY pc.created_at ASC`, [req.params.id, vid]);
    const comments = r.rows;
    res.json({ comments });
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/feed/:id/comments — add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const content = String(req.body?.content || '').slice(0, 2000);
    if (!content.trim()) return res.status(400).json({ error: 'Comentário vazio' });

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
    res.status(500).json({ error: 'Não foi possível publicar o comentário agora. Tenta novamente.' });
  }
});

// POST /api/feed/comments/:commentId/amen — Amém num comentário (liga/desliga)
router.post('/comments/:commentId/amen', authenticate, async (req, res) => {
  try {
    const id = req.params.commentId;
    const del = await db.query('DELETE FROM post_comment_amens WHERE comment_id = $1 AND user_id = $2 RETURNING 1', [id, req.user.id]);
    let amened = false;
    if (!del.rows.length) {
      const ex = await db.query('SELECT 1 FROM post_comments WHERE id = $1', [id]);
      if (!ex.rows.length) return res.status(404).json({ error: 'not_found' });
      await db.query('INSERT INTO post_comment_amens (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, req.user.id]);
      amened = true;
    }
    const c = await db.query('SELECT COUNT(*)::int AS n FROM post_comment_amens WHERE comment_id = $1', [id]);
    res.json({ amened, amen_count: c.rows[0].n });
  } catch (err) { res.status(500).json({ error: 'Erro interno' }); }
});

// DELETE /api/feed/comments/:commentId — apaga quem escreveu o comentário, o autor da publicação ou um admin
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = (await db.query(
      `DELETE FROM post_comments pc USING feed_posts fp
        WHERE pc.id = $1 AND fp.id = pc.post_id AND (pc.author_id = $2 OR fp.author_id = $2 OR $3 = 'admin')
        RETURNING pc.post_id`, [req.params.commentId, req.user.id, req.user.role || ''])).rows[0];
    if (!comment) return res.status(404).json({ error: 'not_found' });
    await db.prepare('UPDATE feed_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?').run(comment.post_id);
    await db.query('DELETE FROM post_comment_amens WHERE comment_id = $1', [req.params.commentId]).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
