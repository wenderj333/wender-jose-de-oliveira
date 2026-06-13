const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigo-com-fe-secret-dev';

// Auto-create tables
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) DEFAULT 'general',
        post_type VARCHAR(30) DEFAULT 'request',
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        media_url TEXT,
        prayer_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_post_prayers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ help_posts tables ready');
  } catch (err) {
    console.error('❌ help_posts migration error:', err.message);
  }
})();

// Optional auth middleware
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      req.user = decoded;
    } catch (e) { /* ignore */ }
  }
  next();
}

// GET /api/help-posts — lista de posts (auth opcional)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    let sql;
    let params;

    if (userId) {
      sql = `
        SELECT
          hp.*,
          CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
          CASE WHEN hp.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar,
          (SELECT COUNT(*) FROM help_post_comments hpc WHERE hpc.post_id = hp.id) AS comment_count,
          EXISTS(
            SELECT 1 FROM help_post_prayers hpp
            WHERE hpp.post_id = hp.id AND hpp.user_id = $1
          ) AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        ORDER BY hp.created_at DESC
        LIMIT 30
      `;
      params = [userId];
    } else {
      sql = `
        SELECT
          hp.*,
          CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
          CASE WHEN hp.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar,
          (SELECT COUNT(*) FROM help_post_comments hpc WHERE hpc.post_id = hp.id) AS comment_count,
          false AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        ORDER BY hp.created_at DESC
        LIMIT 30
      `;
      params = [];
    }

    const result = await db.query(sql, params);
    res.json({ posts: result.rows });
  } catch (err) {
    console.error('Erro ao buscar help-posts:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/help-posts — criar post (requer autenticação)
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, category = 'general', post_type = 'request', is_anonymous = false, media_url } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    const result = await db.query(
      `INSERT INTO help_posts (user_id, category, post_type, content, is_anonymous, media_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, category, post_type, content.trim(), is_anonymous, media_url || null]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar help-post:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/help-posts/:id/pray — toggle oração (requer autenticação)
router.post('/:id/pray', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se já orou
    const existing = await db.query(
      `SELECT id FROM help_post_prayers WHERE post_id = $1 AND user_id = $2`,
      [id, userId]
    );

    let prayed;
    if (existing.rows.length > 0) {
      // Já orou → remover
      await db.query(
        `DELETE FROM help_post_prayers WHERE post_id = $1 AND user_id = $2`,
        [id, userId]
      );
      await db.query(
        `UPDATE help_posts SET prayer_count = GREATEST(0, prayer_count - 1) WHERE id = $1`,
        [id]
      );
      prayed = false;
    } else {
      // Não orou → adicionar
      await db.query(
        `INSERT INTO help_post_prayers (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [id, userId]
      );
      await db.query(
        `UPDATE help_posts SET prayer_count = prayer_count + 1 WHERE id = $1`,
        [id]
      );
      prayed = true;
      // Notificar dono do pedido
      try {
        const postOwner = await db.query(`SELECT user_id, content FROM help_posts WHERE id = $1`, [id]);
        if (postOwner.rows.length > 0 && postOwner.rows[0].user_id !== userId) {
          const preview = postOwner.rows[0].content?.substring(0,50);
          await createNotification(postOwner.rows[0].user_id, 'prayer', 'Alguem orou pelo teu pedido 🙏', `Mais uma pessoa esta contigo nesta oracao: ${preview}...`, { postId: id });
        }
      } catch(ne) {}
    }

    const postResult = await db.query(
      `SELECT prayer_count FROM help_posts WHERE id = $1`,
      [id]
    );

    res.json({
      prayed,
      prayer_count: postResult.rows[0]?.prayer_count || 0,
    });
  } catch (err) {
    console.error('Erro ao toggle oração:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/help-posts/:id/comments — listar comentários
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        hpc.*,
        CASE WHEN hpc.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
        CASE WHEN hpc.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar
       FROM help_post_comments hpc
       LEFT JOIN users u ON u.id = hpc.user_id
       WHERE hpc.post_id = $1
       ORDER BY hpc.created_at ASC`,
      [req.params.id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/help-posts/:id/comments — adicionar comentário (requer autenticação)
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, is_anonymous = false } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio' });
    }

    const result = await db.query(
      `INSERT INTO help_post_comments (post_id, user_id, content, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, content.trim(), is_anonymous]
    );

    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar comentário:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
