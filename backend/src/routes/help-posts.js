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
        pix_key TEXT,
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
        pix_key TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query('ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false');
    await db.query('ALTER TABLE help_post_comments ADD COLUMN IF NOT EXISTS is_pastoral BOOLEAN DEFAULT false');
    await db.query('ALTER TABLE help_post_comments ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE SET NULL');
    await db.query("ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS help_status VARCHAR(20) NOT NULL DEFAULT 'open'");
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_supporters (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_churches (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, church_id)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_church_acknowledgements (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
      pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, church_id)
    )`);
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
          (SELECT hpc.content FROM help_post_comments hpc WHERE hpc.post_id = hp.id AND hpc.is_pastoral = true ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply,
          (SELECT c.name FROM help_post_comments hpc LEFT JOIN churches c ON c.id = hpc.church_id WHERE hpc.post_id = hp.id AND hpc.is_pastoral = true ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply_church,
          EXISTS(
            SELECT 1 FROM help_post_prayers hpp
            WHERE hpp.post_id = hp.id AND hpp.user_id = $1
          ) AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        WHERE NOT EXISTS (SELECT 1 FROM help_post_churches hpt WHERE hpt.post_id = hp.id) OR hp.user_id = $1
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
          NULL::TEXT AS pastoral_reply,
          NULL::TEXT AS pastoral_reply_church,
          false AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        WHERE NOT EXISTS (SELECT 1 FROM help_post_churches hpt WHERE hpt.post_id = hp.id)
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
    const { content, category = 'general', post_type, is_anonymous = false, is_urgent = false, media_url, pix_key, type, target_church_ids = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    const result = await db.query(
      `INSERT INTO help_posts (user_id, category, post_type, content, is_anonymous, is_urgent, media_url, pix_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, category, post_type || type || 'request', content.trim(), is_anonymous, is_urgent, media_url || null, pix_key || null]
    );

    const churchIds = [...new Set((Array.isArray(target_church_ids) ? target_church_ids : []).filter(Boolean))];
    if (churchIds.length) {
      const churches = await db.query('SELECT id, name, pastor_id FROM churches WHERE id = ANY($1::uuid[])', [churchIds]);
      for (const church of churches.rows) {
        await db.query('INSERT INTO help_post_churches (post_id, church_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [result.rows[0].id, church.id]);
        if (church.pastor_id) {
          await createNotification(church.pastor_id, 'prayer_request', 'Novo pedido de oração para a tua igreja 🙏', `Uma pessoa pediu oração à ${church.name}.`, { postId: result.rows[0].id, churchId: church.id, path: '/sala-pastor?secao=oracoes' });
        }
      }
    }
    res.status(201).json({ post: result.rows[0], churches_notified: churchIds.length });
  } catch (err) {
    console.error('Erro ao criar help-post:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/help-posts/pastor/requests — pedidos dirigidos à igreja do pastor
router.get('/pastor/requests', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hp.*, c.id AS church_id, c.name AS church_name,
        CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
        (SELECT COUNT(*) FROM help_post_church_acknowledgements a WHERE a.post_id = hp.id) AS church_ack_count,
        (SELECT hpc.content FROM help_post_comments hpc WHERE hpc.post_id=hp.id AND hpc.is_pastoral=true AND hpc.church_id=c.id ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply,
        EXISTS(SELECT 1 FROM help_post_church_acknowledgements a WHERE a.post_id=hp.id AND a.church_id=c.id) AS acknowledged
      FROM help_post_churches target
      JOIN help_posts hp ON hp.id=target.post_id
      JOIN churches c ON c.id=target.church_id
      LEFT JOIN users u ON u.id=hp.user_id
      WHERE c.pastor_id=$1 OR $2='admin'
      ORDER BY hp.is_urgent DESC, hp.created_at DESC
      LIMIT 60`, [req.user.id, req.user.role]);
    res.json({ posts: result.rows });
  } catch (err) { console.error('Erro ao buscar pedidos da igreja:', err); res.status(500).json({ error: 'Não foi possível carregar os pedidos.' }); }
});

// POST /api/help-posts/:id/church-praying — pastor confirma oração da igreja
router.post('/:id/church-praying', authenticate, async (req, res) => {
  try {
    const target = await db.query(`SELECT c.id, c.name FROM help_post_churches hpt JOIN churches c ON c.id=hpt.church_id WHERE hpt.post_id=$1 AND (c.pastor_id=$2 OR $3='admin') LIMIT 1`, [req.params.id, req.user.id, req.user.role]);
    if (!target.rows.length) return res.status(403).json({ error: 'Este pedido não foi enviado à tua igreja.' });
    const church = target.rows[0];
    const inserted = await db.query('INSERT INTO help_post_church_acknowledgements (post_id, church_id, pastor_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING post_id', [req.params.id, church.id, req.user.id]);
    if (inserted.rows.length) {
      const post = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
      if (post.rows[0]?.user_id) await createNotification(post.rows[0].user_id, 'prayer', `${church.name} está a orar por ti 🙏`, 'O teu pedido foi recebido por uma igreja. Não estás sozinho.', { postId: req.params.id, churchId: church.id });
    }
    res.json({ acknowledged: true, church_name: church.name });
  } catch (err) { console.error('Erro ao confirmar oração:', err); res.status(500).json({ error: 'Não foi possível confirmar a oração.' }); }
});

// POST /api/help-posts/:id/pastoral-reply — resposta privada do pastor ao pedido da sua igreja
router.post('/:id/pastoral-reply', authenticate, async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Escreva uma resposta antes de enviar.' });
    const target = await db.query(`SELECT c.id, c.name FROM help_post_churches hpt JOIN churches c ON c.id=hpt.church_id WHERE hpt.post_id=$1 AND (c.pastor_id=$2 OR $3='admin') LIMIT 1`, [req.params.id, req.user.id, req.user.role]);
    if (!target.rows.length) return res.status(403).json({ error: 'Este pedido não pertence à tua igreja.' });
    const church = target.rows[0];
    const result = await db.query(`INSERT INTO help_post_comments (post_id, user_id, content, is_anonymous, is_pastoral, church_id)
      VALUES ($1,$2,$3,false,true,$4) RETURNING id, content, created_at`, [req.params.id, req.user.id, content, church.id]);
    const post = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
    if (post.rows[0]?.user_id) await createNotification(post.rows[0].user_id, 'pastoral_reply', `${church.name} respondeu ao teu pedido 🙏`, content.slice(0, 120), { postId: req.params.id, churchId: church.id, path: '/ajuda-uma-vida' });
    res.status(201).json({ reply: { ...result.rows[0], church_name: church.name } });
  } catch (err) { console.error('Erro ao responder pedido pastoral:', err); res.status(500).json({ error: 'Não foi possível enviar a resposta.' }); }
});

// POST /api/help-posts/:id/offer-help — demonstra interesse em ajudar, sem expor contacto privado
router.post('/:id/offer-help', authenticate, async (req, res) => {
  try {
    const post = await db.query('SELECT id, user_id, post_type, help_status, content FROM help_posts WHERE id=$1', [req.params.id]);
    if (!post.rows.length || post.rows[0].post_type !== 'social_help') return res.status(404).json({ error: 'Pedido de ajuda não encontrado.' });
    if (post.rows[0].help_status === 'completed') return res.status(400).json({ error: 'Este pedido já foi concluído.' });
    if (post.rows[0].user_id === req.user.id) return res.status(400).json({ error: 'Não podes oferecer ajuda ao teu próprio pedido.' });
    const message = String(req.body.message || '').trim().slice(0, 500);
    const result = await db.query(`INSERT INTO help_post_supporters (post_id,user_id,message) VALUES ($1,$2,$3)
      ON CONFLICT (post_id,user_id) DO NOTHING RETURNING post_id`, [req.params.id, req.user.id, message || null]);
    if (result.rows.length && post.rows[0].user_id) await createNotification(post.rows[0].user_id, 'help_offer', 'Uma pessoa quer ajudar-te 🤝', 'Entra em Ajuda uma Vida para ver e aceitar o apoio.', { postId: req.params.id, path: '/ajuda-uma-vida' });
    res.json({ offered: true, already_offered: !result.rows.length });
  } catch (err) { console.error('Erro ao oferecer ajuda:', err); res.status(500).json({ error: 'Não foi possível registar o apoio.' }); }
});

// GET /api/help-posts/:id/supporters — apenas quem publicou o pedido pode ver voluntários
router.get('/:id/supporters', authenticate, async (req, res) => {
  try {
    const owner = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
    if (!owner.rows.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (owner.rows[0].user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas a pessoa que pediu ajuda pode ver os voluntários.' });
    const result = await db.query(`SELECT s.created_at, s.message, u.id, u.full_name, u.avatar_url FROM help_post_supporters s JOIN users u ON u.id=s.user_id WHERE s.post_id=$1 ORDER BY s.created_at ASC`, [req.params.id]);
    res.json({ supporters: result.rows });
  } catch (err) { console.error('Erro ao listar voluntários:', err); res.status(500).json({ error: 'Não foi possível carregar os voluntários.' }); }
});

// POST /api/help-posts/:id/help-status — pessoa que pediu ajuda atualiza o acompanhamento
router.post('/:id/help-status', authenticate, async (req, res) => {
  try {
    const status = String(req.body.status || 'open');
    if (!['open', 'in_progress', 'completed'].includes(status)) return res.status(400).json({ error: 'Estado inválido.' });
    const result = await db.query('UPDATE help_posts SET help_status=$1 WHERE id=$2 AND user_id=$3 RETURNING help_status', [status, req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(403).json({ error: 'Apenas quem publicou pode atualizar este pedido.' });
    res.json({ help_status: result.rows[0].help_status });
  } catch (err) { console.error('Erro ao atualizar ajuda:', err); res.status(500).json({ error: 'Não foi possível atualizar o pedido.' }); }
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
