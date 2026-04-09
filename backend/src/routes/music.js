const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// Ensure tables exist
async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS music (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      artist VARCHAR(200),
      genre VARCHAR(50) DEFAULT 'louvor',
      url TEXT NOT NULL,
      cover_url TEXT,
      duration INTEGER,
      play_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT true,
      user_name VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, []);
  await db.query(`
    CREATE TABLE IF NOT EXISTS music_likes (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      music_id UUID REFERENCES music(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, music_id)
    )
  `, []);
  await db.query(`
    CREATE TABLE IF NOT EXISTS music_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      music_id UUID REFERENCES music(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      user_name VARCHAR(200),
      user_avatar TEXT,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, []);
  // Schema migration: add is_public if not exists
  await db.query(`ALTER TABLE music ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true`, []);
}

ensureTables().catch(err => console.error('music tables init error:', err));

// GET /api/music/genres — list distinct genres
router.get('/genres', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT genre FROM music WHERE genre IS NOT NULL ORDER BY genre`,
      []
    );
    res.json({ genres: result.rows.map(r => r.genre) });
  } catch (err) {
    console.error('Error fetching genres:', err);
    res.status(500).json({ error: 'Erro ao buscar géneros' });
  }
});

// GET /api/music?search=&genre=&userId=&sort= — list songs (public + own private)
router.get('/', async (req, res) => {
  try {
    const { search, genre, limit, userId, sort } = req.query;
    // Try to get authenticated user from Authorization header
    let authUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || 'sigocomfe-secret-key-2026-mudar-em-producao');
        authUserId = decoded.id || decoded.userId || decoded.sub;
      } catch (e) { /* not authenticated */ }
    }

    const params = [];
    // Show public songs + own private songs (if authenticated)
    const viewerUserId = authUserId;
    if (viewerUserId) {
      params.push(viewerUserId);
      let sql = `SELECT * FROM music WHERE (is_public = true OR user_id = $${params.length})`;

      if (userId) {
        params.push(userId);
        sql += ` AND user_id = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR artist ILIKE $${params.length})`;
      }
      if (genre && genre !== 'all') {
        params.push(genre);
        sql += ` AND genre = $${params.length}`;
      }
      
      // Sort options: plays, likes, recent (default)
      if (sort === 'plays') {
        sql += ` ORDER BY play_count DESC, created_at DESC`;
      } else if (sort === 'likes') {
        sql += ` ORDER BY like_count DESC, created_at DESC`;
      } else {
        sql += ` ORDER BY created_at DESC`;
      }
      
      if (limit) {
        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;
      }
      const result = await db.query(sql, params);
      return res.json({ songs: result.rows });
    } else {
      let sql = `SELECT * FROM music WHERE is_public = true`;
      if (userId) {
        params.push(userId);
        sql += ` AND user_id = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR artist ILIKE $${params.length})`;
      }
      if (genre && genre !== 'all') {
        params.push(genre);
        sql += ` AND genre = $${params.length}`;
      }
      
      // Sort options
      if (sort === 'plays') {
        sql += ` ORDER BY play_count DESC, created_at DESC`;
      } else if (sort === 'likes') {
        sql += ` ORDER BY like_count DESC, created_at DESC`;
      } else {
        sql += ` ORDER BY created_at DESC`;
      }
      
      if (limit) {
        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;
      }
      const result = await db.query(sql, params);
      return res.json({ songs: result.rows });
    }
  } catch (err) {
    console.error('Error fetching music:', err);
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  }
});

// POST /api/music — save song (auth required)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, artist, genre, url, cover_url, duration, is_public } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Título e URL obrigatórios' });

    const isPublicVal = is_public === false || is_public === 'false' ? false : true;

    const result = await db.query(
      `INSERT INTO music (user_id, title, artist, genre, url, cover_url, duration, is_public, user_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        (artist || '').trim() || null,
        genre || 'louvor',
        url,
        cover_url || null,
        duration ? parseInt(duration, 10) : null,
        isPublicVal,
        req.user.full_name || 'Anónimo',
      ]
    );
    res.json({ song: result.rows[0] });
  } catch (err) {
    console.error('Error adding music:', err);
    res.status(500).json({ error: 'Erro ao adicionar música' });
  }
});

// DELETE /api/music/:id — delete own song
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const songResult = await db.query(
      `SELECT * FROM music WHERE id = $1`,
      [req.params.id]
    );
    const song = songResult.rows[0];
    if (!song) return res.status(404).json({ error: 'Música não encontrada' });
    if (song.user_id !== req.user.id && req.user.role !== 'pastor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await db.query(`DELETE FROM music WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting music:', err);
    res.status(500).json({ error: 'Erro ao deletar música' });
  }
});

// POST /api/music/:id/like — toggle like
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if like exists
    const existing = await db.query(
      `SELECT 1 FROM music_likes WHERE user_id = $1 AND music_id = $2`,
      [userId, id]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await db.query(
        `DELETE FROM music_likes WHERE user_id = $1 AND music_id = $2`,
        [userId, id]
      );
      await db.query(
        `UPDATE music SET like_count = GREATEST(0, like_count - 1) WHERE id = $1`,
        [id]
      );
    } else {
      // Like
      await db.query(
        `INSERT INTO music_likes (user_id, music_id) VALUES ($1, $2)`,
        [userId, id]
      );
      await db.query(
        `UPDATE music SET like_count = like_count + 1 WHERE id = $1`,
        [id]
      );
    }

    const updated = await db.query(
      `SELECT like_count FROM music WHERE id = $1`,
      [id]
    );
    res.json({
      liked: existing.rows.length === 0,
      like_count: updated.rows[0]?.like_count || 0,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Erro ao curtir música' });
  }
});

// POST /api/music/:id/play — increment play count
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE music SET play_count = play_count + 1 WHERE id = $1`,
      [id]
    );
    const updated = await db.query(
      `SELECT play_count FROM music WHERE id = $1`,
      [id]
    );
    res.json({ play_count: updated.rows[0]?.play_count || 0 });
  } catch (err) {
    console.error('Error incrementing play count:', err);
    res.status(500).json({ error: 'Erro ao registrar play' });
  }
});

// GET /api/music/:id/comments — list comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM music_comments WHERE music_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// POST /api/music/:id/comments — add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comentário vazio' });
    }

    const result = await db.query(
      `INSERT INTO music_comments (music_id, user_id, user_name, user_avatar, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user.id, req.user.full_name || 'Anónimo', req.user.avatar_url || null, comment.trim()]
    );
    res.json({ comment: result.rows[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

module.exports = router;
