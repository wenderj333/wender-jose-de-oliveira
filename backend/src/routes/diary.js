const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');

(async () => {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await db.query(`CREATE TABLE IF NOT EXISTS diary_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT NOT NULL,
      feeling TEXT,
      prayer TEXT,
      verse TEXT,
      is_private BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await db.query('CREATE INDEX IF NOT EXISTS idx_diary_entries_user_created ON diary_entries(user_id, created_at DESC)');
    await db.query('ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS feed_post_id UUID');
  } catch (error) {
    console.error('Diary migration:', error.message);
  }
})();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, content, feeling, prayer, verse, is_private, feed_post_id, created_at FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 300',
      [req.user.id]
    );
    // Sequência real: dias seguidos com pelo menos uma entrada (conta a partir de hoje, ou de ontem se hoje ainda não escreveu)
    const tz = /^[A-Za-z_]+\/[A-Za-z_\/-]+$/.test(String(req.query.tz || '')) ? String(req.query.tz) : 'UTC';
    let days = [];
    let today = new Date().toISOString().slice(0, 10);
    try {
      const d = await db.query(`SELECT DISTINCT to_char(created_at AT TIME ZONE $2, 'YYYY-MM-DD') AS d FROM diary_entries WHERE user_id = $1 ORDER BY 1 DESC LIMIT 400`, [req.user.id, tz]);
      days = d.rows.map(r => r.d);
      today = (await db.query(`SELECT to_char(NOW() AT TIME ZONE $1, 'YYYY-MM-DD') AS d`, [tz])).rows[0].d;
    } catch (_) {}
    const set = new Set(days);
    const cur = new Date(today + 'T12:00:00Z');
    if (!set.has(today)) cur.setUTCDate(cur.getUTCDate() - 1);
    let streak = 0;
    while (set.has(cur.toISOString().slice(0, 10))) { streak += 1; cur.setUTCDate(cur.getUTCDate() - 1); }
    const week = [];
    const w = new Date(today + 'T12:00:00Z'); w.setUTCDate(w.getUTCDate() - 6);
    for (let i = 0; i < 7; i++) { const k = w.toISOString().slice(0, 10); week.push({ date: k, done: set.has(k) }); w.setUTCDate(w.getUTCDate() + 1); }
    res.json({ entries: result.rows, streak, week, today });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível carregar o diário.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const b = req.body || {};
  const title = String(b.title || '').trim().slice(0, 200);
  const content = String(b.content || '').trim().slice(0, 8000);
  const feeling = String(b.feeling || '').trim().slice(0, 40);
  const prayer = String(b.prayer || '').trim().slice(0, 2000);
  const verse = String(b.verse || '').trim().slice(0, 300);
  const isPrivate = b.isPrivate !== false;
  if (!content) return res.status(400).json({ error: 'O texto do diário é obrigatório.', code: 'empty' });
  try {
    // "Público no Mural": publica de verdade (antes só guardava a opção e não fazia nada).
    // Passa pelo guardião, como os outros textos públicos.
    let feedPostId = null; let published = false; let reason = null;
    if (!isPrivate) {
      const text = [title, content, verse ? `📖 ${verse}` : ''].filter(Boolean).join('\n\n').slice(0, 5000);
      try { reason = await require('../services/requestGuard').checkRequest(text, 'request'); } catch (_) { reason = null; }
      if (!reason) {
        try {
          const fp = await db.query(`INSERT INTO feed_posts (author_id, content, category, visibility) VALUES ($1, $2, 'testemunho', 'public') RETURNING id`, [req.user.id, text]);
          feedPostId = fp.rows[0]?.id || null; published = Boolean(feedPostId);
        } catch (e) { console.warn('diary → mural:', e.message); }
      }
    }
    const result = await db.query(
      `INSERT INTO diary_entries (user_id, title, content, feeling, prayer, verse, is_private, feed_post_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, content, feeling, prayer, verse, is_private, feed_post_id, created_at`,
      [req.user.id, title || null, content, feeling || null, prayer || null, verse || null, !published, feedPostId]
    );
    res.status(201).json({ entry: result.rows[0], published, moderated: Boolean(reason), reason });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível guardar o diário.' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'Entrada não encontrada.' });
    const result = await db.query('DELETE FROM diary_entries WHERE id = $1 AND user_id = $2 RETURNING feed_post_id', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Entrada não encontrada.' });
    // Se tinha sido publicada no Mural e a pessoa pediu para remover também
    if (result.rows[0].feed_post_id && req.query.alsoMural === '1') {
      await db.query('DELETE FROM feed_posts WHERE id = $1 AND author_id = $2', [result.rows[0].feed_post_id, req.user.id]).catch(() => {});
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível apagar a entrada.' });
  }
});

module.exports = router;
