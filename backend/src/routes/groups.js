// Grupos (estilo Facebook Groups).
// Compatível com a API antiga (mesmas rotas e campos), com muitas rotas novas.
// Todas as permissões são verificadas aqui no servidor.
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const multer = require('multer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { ensureGroupsSchema } = require('../db/groupsSchema');
const { groupText } = require('../services/groupNotifyText');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 7 }, fileFilter: (_req, file, callback) => callback(null, /^(image|video)\//.test(file.mimetype)) });
const uploadToCloud = (buffer, folder) => new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => error ? reject(error) : resolve(result)); stream.end(buffer); });

// Pontos de extensão (os testes trocam-nos por versões falsas)
const storage = require('../services/storage');
let uploader = async (buffer, folder, mimetype = 'image/jpeg') => (storage.isConfigured()
  ? storage.putBuffer(buffer, String(folder).replace(/^sigo-com-fe\//, ''), mimetype)
  : (await uploadToCloud(buffer, folder)).secure_url);
let notify = (...args) => require('./notifications').createNotification(...args);
router.setUploader = (fn) => { uploader = fn; };
router.setNotifier = (fn) => { notify = fn; };
const pendingJobs = new Set();
router.flushNotifications = async () => { while (pendingJobs.size) await Promise.allSettled([...pendingJobs]); };
function background(fn) {
  const p = Promise.resolve().then(fn).catch((e) => console.error('Group notify error:', e.message)).finally(() => pendingJobs.delete(p));
  pendingJobs.add(p);
}

// ---------- utilidades ----------
const CATEGORIES = ['prayer', 'bible_study', 'youth', 'women', 'men', 'couples', 'worship', 'local_church', 'support', 'other'];
const VISIBILITIES = ['public', 'private', 'hidden'];
const REACTIONS = ['amen', 'love', 'praise', 'sad'];
const RSVP = ['going', 'maybe', 'declined'];
const REPORT_REASONS = ['inappropriate', 'disrespectful', 'spam', 'harassment', 'false_info', 'other'];
const NOTIFY_LEVELS = ['all', 'highlights', 'off'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Texto simples: sem etiquetas HTML nem caracteres de controlo
function clean(value, max) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, max);
}
function list(value, maxItems, maxLen) {
  let arr = value;
  if (typeof value === 'string') {
    try { arr = JSON.parse(value); } catch { arr = value.split('\n'); }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((v) => clean(typeof v === 'object' && v ? v.text ?? v.question ?? '' : v, maxLen)).filter(Boolean).slice(0, maxItems);
}
const bool = (v) => v === true || v === 'true' || v === '1' || v === 1 || v === 'on';
const newInviteCode = () => crypto.randomBytes(9).toString('base64url');
const visOf = (g) => (VISIBILITIES.includes(g.visibility) ? g.visibility : (g.privacy === 'private' ? 'private' : 'public'));
const isVideo = (url) => /\/video\/upload\/|\.(mp4|mov|webm|m4v|3gp)(\?|$)/i.test(String(url || ''));
const fail = (res, status, error, extra = {}) => res.status(status).json({ error, ...extra });
const mutedNow = (m) => Boolean(m?.muted_until && new Date(m.muted_until) > new Date());

// Limite simples de publicações/comentários por pessoa (em memória)
const buckets = new Map();
function rateOk(key, max, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { buckets.set(key, arr); return false; }
  arr.push(now); buckets.set(key, arr);
  if (buckets.size > 50000) buckets.clear();
  return true;
}
const postLimit = () => Number(process.env.GROUPS_POST_LIMIT || 10);       // por 10 minutos
const commentLimit = () => Number(process.env.GROUPS_COMMENT_LIMIT || 40); // por 5 minutos

// Migração (uma vez por processo, partilhada com a auto-migração do server.js)
function ensureFeatures() { return ensureGroupsSchema((sql) => db.query(sql)); }
router.use(async (_req, _res, next) => { try { await ensureFeatures(); } catch (error) { console.error('Groups schema error:', error.message); } next(); });

// IDs inválidos → 404 (evita erros 500 do PostgreSQL)
['id', 'postId', 'userId', 'commentId', 'eventId', 'reportId'].forEach((name) => {
  router.param(name, (req, res, next, value) => (UUID_RE.test(String(value)) ? next() : fail(res, 404, 'Não encontrado.')));
});

async function member(groupId, userId) {
  return (await db.query('SELECT role, notify_level, muted_until, joined_at FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId])).rows[0] || null;
}
async function isBanned(groupId, userId) {
  return Boolean((await db.query('SELECT 1 FROM group_bans WHERE group_id=$1 AND user_id=$2', [groupId, userId])).rows[0]);
}

// Carrega o grupo e verifica a permissão pedida.
// opts.content → precisa de ver o conteúdo (membro, ou grupo público)
// opts.member → precisa de ser membro; opts.manager → admin/moderador; opts.admin → admin
async function ctx(req, res, opts = {}) {
  const g = (await db.query('SELECT g.*, u.full_name creator_name FROM groups g LEFT JOIN users u ON u.id=g.creator_id WHERE g.id=$1', [req.params.id])).rows[0];
  if (!g) { fail(res, 404, 'Grupo não encontrado.'); return null; }
  const m = await member(g.id, req.user.id);
  const v = visOf(g);
  const isAdmin = m?.role === 'admin';
  const isManager = isAdmin || m?.role === 'moderator';
  const invited = Boolean(g.invite_code) && String(req.query?.invite || req.body?.invite || '') === g.invite_code;
  if (v === 'hidden' && !m && !invited) { fail(res, 404, 'Grupo não encontrado.'); return null; }
  if (opts.content && !m && v !== 'public') { fail(res, 403, 'Este grupo é privado. Peça para entrar.', { code: 'private' }); return null; }
  if (opts.member && !m) { fail(res, 403, 'Entre no grupo para participar.', { code: 'not_member' }); return null; }
  if (opts.manager && !isManager) { fail(res, 403, 'Apenas administradores ou moderadores podem fazer isto.', { code: 'forbidden' }); return null; }
  if (opts.admin && !isAdmin) { fail(res, 403, 'Apenas administradores podem fazer isto.', { code: 'forbidden' }); return null; }
  return { g, m, v, isAdmin, isManager, invited, isCreator: String(g.creator_id) === String(req.user.id) };
}

function rulesOf(g) {
  if (Array.isArray(g.rules_list) && g.rules_list.length) return g.rules_list;
  return String(g.rules || '').split('\n').map((s) => s.trim()).filter(Boolean);
}
function publicGroup(g, extra = {}) {
  return {
    id: g.id, name: g.name, description: g.description, cover_url: g.cover_url, avatar_url: g.avatar_url || null,
    privacy: g.privacy, visibility: visOf(g), category: g.category, created_at: g.created_at, creator_id: g.creator_id,
    creator_name: g.creator_name, require_approval: g.require_approval, post_approval: g.post_approval,
    rules: g.rules, rules_list: rulesOf(g), membership_questions: Array.isArray(g.membership_questions) ? g.membership_questions : [],
    last_activity_at: g.last_activity_at, ...extra,
  };
}
async function memberPreview(groupId, limit = 6) {
  return (await db.query(`SELECT u.id, u.full_name, u.avatar_url FROM group_members gm JOIN users u ON u.id=gm.user_id
    WHERE gm.group_id=$1 ORDER BY (u.avatar_url IS NULL), gm.joined_at LIMIT $2`, [groupId, limit])).rows;
}
async function memberCount(groupId) {
  return (await db.query('SELECT COUNT(*)::int c FROM group_members WHERE group_id=$1', [groupId])).rows[0].c;
}
const touch = (groupId) => db.query('UPDATE groups SET last_activity_at=NOW() WHERE id=$1', [groupId]).catch(() => {});

// ---------- notificações ----------
async function userLang(id) {
  return (await db.query('SELECT language, full_name FROM users WHERE id=$1', [id])).rows[0] || {};
}
async function sendTo(recipients, kind, vars, data, actorId) {
  const seen = new Set();
  for (const r of recipients) {
    const id = String(r.user_id || r.id || r);
    if (!id || id === String(actorId) || seen.has(id)) continue; // nunca notificar quem fez a ação
    seen.add(id);
    const lang = r.language !== undefined ? r.language : (await userLang(id)).language;
    const [title, body] = groupText(kind, lang, vars);
    await notify(id, 'group', title, body, { ...data, kind: 'group_' + kind, ...(actorId ? { from: String(actorId) } : {}) });
  }
}
async function managersOf(groupId) {
  return (await db.query(`SELECT gm.user_id, u.language FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 AND gm.role IN ('admin','moderator')`, [groupId])).rows;
}
// Nova publicação: respeita a escolha de cada membro (Todas / Destaques / Desligado)
function fanOutPost(g, post, actor) {
  background(async () => {
    const highlight = Boolean(post.is_announcement || post.is_pinned);
    const rows = (await db.query(`SELECT gm.user_id, u.language FROM group_members gm JOIN users u ON u.id=gm.user_id
      WHERE gm.group_id=$1 AND gm.user_id<>$2 AND (gm.notify_level='all' OR (gm.notify_level='highlights' AND $3::boolean))
      ORDER BY gm.joined_at LIMIT 2000`, [g.id, post.author_id, highlight])).rows;
    const kind = highlight ? 'announcement' : post.post_type === 'prayer' ? 'prayer_post' : 'post';
    await sendTo(rows, kind, { who: actor.full_name, group: g.name, text: post.content }, { url: `/grupos/${g.id}?post=${post.id}`, groupId: String(g.id), postId: String(post.id) }, post.author_id);
  });
}

// ---------- publicações ----------
const POST_SELECT = `SELECT gp.id, gp.group_id, gp.author_id, gp.content, gp.media_url, gp.media_urls, gp.post_type, gp.is_pinned, gp.pinned_at,
  gp.is_announcement, gp.comments_off, gp.status, gp.edited_at, gp.answered_at, gp.testimony, gp.created_at,
  u.full_name author_name, u.avatar_url author_avatar,
  (SELECT role FROM group_members m WHERE m.group_id=gp.group_id AND m.user_id=gp.author_id) author_role,
  (SELECT COALESCE(jsonb_object_agg(x.reaction, x.c), '{}'::jsonb) FROM (SELECT reaction, COUNT(*)::int c FROM group_post_reactions r WHERE r.post_id=gp.id GROUP BY reaction) x) reactions,
  (SELECT reaction FROM group_post_reactions r WHERE r.post_id=gp.id AND r.user_id=$1) my_reaction,
  (SELECT COUNT(*)::int FROM group_post_comments c WHERE c.post_id=gp.id) comment_count,
  (SELECT COUNT(*)::int FROM group_prayer_prayed p WHERE p.post_id=gp.id) prayed_count,
  EXISTS(SELECT 1 FROM group_prayer_prayed p WHERE p.post_id=gp.id AND p.user_id=$1) prayed_by_me,
  (SELECT option_id FROM group_poll_votes v WHERE v.post_id=gp.id AND v.user_id=$1) my_vote,
  (SELECT COALESCE(json_agg(json_build_object('id', o.id, 'text', o.text, 'votes', (SELECT COUNT(*)::int FROM group_poll_votes v WHERE v.option_id=o.id)) ORDER BY o.position), '[]'::json)
     FROM group_poll_options o WHERE o.post_id=gp.id) poll_options
  FROM group_posts gp JOIN users u ON u.id=gp.author_id`;

function shapePost(p) {
  const media = Array.isArray(p.media_urls) && p.media_urls.length ? p.media_urls : (p.media_url ? [p.media_url] : []);
  const reactions = p.reactions || {};
  const total = Object.values(reactions).reduce((a, b) => a + Number(b || 0), 0);
  const poll = p.post_type === 'poll' ? { options: p.poll_options || [], total: (p.poll_options || []).reduce((a, o) => a + o.votes, 0), my_vote: p.my_vote } : null;
  const { poll_options, my_vote, ...rest } = p;
  return { ...rest, media_urls: media, reactions, reaction_count: total, poll, like_count: total, liked_by_me: Boolean(p.my_reaction) };
}
async function getPost(groupId, postId, userId) {
  const row = (await db.query(`${POST_SELECT} WHERE gp.id=$2 AND gp.group_id=$3`, [userId, postId, groupId])).rows[0];
  return row ? shapePost(row) : null;
}
async function postRow(groupId, postId) {
  return (await db.query('SELECT * FROM group_posts WHERE id=$1 AND group_id=$2', [postId, groupId])).rows[0] || null;
}

// ======================= LISTA / DESCOBRIR =======================
router.get('/', authenticate, async (req, res) => {
  try {
    const q = clean(req.query.q, 80);
    const category = CATEGORIES.includes(req.query.category) ? req.query.category : null;
    const params = [req.user.id];
    let filter = '';
    if (q) { params.push(`%${q.replace(/[%_\\]/g, (c) => '\\' + c)}%`); filter += ` AND (g.name ILIKE $${params.length} OR g.description ILIKE $${params.length})`; }
    if (category) { params.push(category); filter += ` AND g.category=$${params.length}`; }
    const result = await db.query(`SELECT g.id,g.name,g.description,g.cover_url,g.avatar_url,g.creator_id,g.privacy,g.visibility,g.category,g.require_approval,g.created_at,g.last_activity_at,u.full_name creator_name,
      (SELECT COUNT(*)::int FROM group_members gm WHERE gm.group_id=g.id) member_count,
      (SELECT COUNT(*)::int FROM group_posts p WHERE p.group_id=g.id AND p.status='published' AND p.created_at > NOW() - INTERVAL '7 days') posts_7d,
      (SELECT COALESCE(json_agg(json_build_object('id', x.id, 'full_name', x.full_name, 'avatar_url', x.avatar_url)), '[]'::json) FROM (
         SELECT u2.id, u2.full_name, u2.avatar_url FROM group_members gm2 JOIN users u2 ON u2.id=gm2.user_id WHERE gm2.group_id=g.id ORDER BY (u2.avatar_url IS NULL), gm2.joined_at LIMIT 3) x) member_preview,
      EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1) is_member,
      (SELECT role FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1) member_role,
      EXISTS(SELECT 1 FROM group_join_requests r WHERE r.group_id=g.id AND r.user_id=$1 AND r.status='pending') request_pending
      FROM groups g JOIN users u ON u.id=g.creator_id
      WHERE ((COALESCE(g.visibility, g.privacy, 'public') <> 'hidden') OR g.creator_id=$1 OR EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1))
      ${filter}
      ORDER BY COALESCE(g.last_activity_at, g.created_at) DESC LIMIT 300`, params);
    const groups = result.rows.map((g) => ({ ...g, visibility: visOf(g) }));
    const suggested = groups.filter((g) => !g.is_member && g.visibility !== 'hidden')
      .sort((a, b) => (b.posts_7d * 3 + b.member_count) - (a.posts_7d * 3 + a.member_count)).slice(0, 8);
    res.json({ groups, suggested });
  } catch (error) { console.error('Groups list error:', error.message); res.status(500).json({ error: 'Não foi possível carregar os grupos.' }); }
});

// ======================= CRIAR =======================
function readSettings(body, current = {}) {
  const out = {};
  if (body.name !== undefined) out.name = clean(body.name, 80);
  if (body.description !== undefined) out.description = clean(body.description, 2000) || null;
  if (body.category !== undefined) out.category = clean(body.category, 80) || null;
  let visibility = body.visibility;
  if (visibility === undefined && body.privacy !== undefined) visibility = body.privacy;
  if (visibility !== undefined) out.visibility = visibility;
  if (body.rules !== undefined) {
    // Aceita lista (nova) ou texto (antigo)
    const rules = list(body.rules, 12, 300);
    out.rules_list = rules; out.rules = rules.join('\n') || null;
  }
  if (body.questions !== undefined || body.membership_questions !== undefined) out.membership_questions = list(body.questions ?? body.membership_questions, 3, 200);
  if (body.require_approval !== undefined) out.require_approval = bool(body.require_approval);
  if (body.post_approval !== undefined) out.post_approval = bool(body.post_approval);
  return { ...current, ...out };
}

router.post('/', authenticate, upload.single('cover'), async (req, res) => {
  try {
    const s = readSettings(req.body || {});
    if (!s.name || s.name.length < 3) return fail(res, 400, 'O nome do grupo deve ter pelo menos 3 letras.');
    const visibility = s.visibility === undefined ? 'public' : s.visibility;
    if (!VISIBILITIES.includes(visibility)) return fail(res, 400, 'Privacidade inválida.');
    const coverUrl = req.file && /^image\//.test(req.file.mimetype) ? await uploader(req.file.buffer, 'sigo-com-fe/groups', req.file.mimetype) : null;
    const group = (await db.query(`INSERT INTO groups (name,description,cover_url,creator_id,privacy,visibility,require_approval,rules,rules_list,category,membership_questions,post_approval,invite_code,last_activity_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11::jsonb,$12,$13,NOW()) RETURNING *`,
    [s.name, s.description || null, coverUrl, req.user.id, visibility === 'public' ? 'public' : 'private', visibility, Boolean(s.require_approval),
      s.rules || null, JSON.stringify(s.rules_list || []), s.category || null, JSON.stringify(s.membership_questions || []), Boolean(s.post_approval), newInviteCode()])).rows[0];
    await db.query("INSERT INTO group_members (group_id,user_id,role) VALUES ($1,$2,'admin')", [group.id, req.user.id]);
    res.status(201).json({ group: { ...publicGroup(group), invite_code: group.invite_code, is_member: true, member_role: 'admin', member_count: 1 } });
  } catch (error) { console.error('Group create error:', error.message); res.status(500).json({ error: 'Não foi possível criar o grupo.' }); }
});

// ======================= DETALHE =======================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res); if (!c) return;
    const { g, m, v } = c;
    const count = await memberCount(g.id);
    const preview = await memberPreview(g.id, 8);
    const pending = (await db.query("SELECT 1 FROM group_join_requests WHERE group_id=$1 AND user_id=$2 AND status='pending'", [g.id, req.user.id])).rows[0];
    const banned = await isBanned(g.id, req.user.id);
    const base = publicGroup(g, { member_count: count, request_pending: Boolean(pending), is_banned: banned, member_preview: preview });
    if (!m && v !== 'public') {
      // Não-membro de grupo privado (ou oculto com convite): só o "Sobre"
      return res.status(403).json({ error: 'Este grupo é privado. Peça para entrar.', code: 'private', group: base, my_role: null, invite_valid: c.invited });
    }
    const members = await db.query(`SELECT gm.role,u.id,u.full_name,u.avatar_url FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1
      ORDER BY CASE gm.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END, gm.joined_at LIMIT 60`, [g.id]);
    const posts = await db.query(`${POST_SELECT} WHERE gp.group_id=$2 AND gp.status='published' ORDER BY gp.created_at DESC LIMIT 20`, [req.user.id, g.id]);
    let counts = {};
    let pendingRequests = [];
    if (c.isManager) {
      pendingRequests = (await db.query("SELECT r.user_id,r.message,r.answers,r.created_at,u.full_name,u.avatar_url FROM group_join_requests r JOIN users u ON u.id=r.user_id WHERE r.group_id=$1 AND r.status='pending' ORDER BY r.created_at", [g.id])).rows;
      const k = (await db.query(`SELECT
        (SELECT COUNT(*)::int FROM group_posts WHERE group_id=$1 AND status='pending') pending_posts,
        (SELECT COUNT(*)::int FROM group_reports WHERE group_id=$1 AND status='open') open_reports`, [g.id])).rows[0];
      counts = { ...k, pending_requests: pendingRequests.length };
    }
    res.json({
      group: { ...base, invite_code: m ? g.invite_code : undefined, my_notify_level: m?.notify_level || null, my_muted_until: mutedNow(m) ? m.muted_until : null, is_member: Boolean(m), member_role: m?.role || null },
      members: members.rows, posts: posts.rows.map(shapePost), my_role: m?.role || null, pending_requests: pendingRequests, counts, is_creator: c.isCreator,
    });
  } catch (error) { console.error('Group detail error:', error.message); res.status(500).json({ error: 'Não foi possível abrir este grupo.' }); }
});

// ======================= ENTRAR / SAIR =======================
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res); if (!c) return;
    const { g, m, v } = c;
    if (m) return res.json({ success: true, joined: true });
    if (await isBanned(g.id, req.user.id)) return fail(res, 403, 'Não é possível entrar neste grupo.', { code: 'blocked' });
    const needsApproval = v === 'private' || Boolean(g.require_approval);
    if (needsApproval) {
      const questions = Array.isArray(g.membership_questions) ? g.membership_questions : [];
      const raw = Array.isArray(req.body?.answers) ? req.body.answers : [];
      const answers = questions.map((q, i) => ({ question: q, answer: clean(raw[i], 500) }));
      await db.query(`INSERT INTO group_join_requests (group_id,user_id,message,answers,status) VALUES ($1,$2,$3,$4::jsonb,'pending')
        ON CONFLICT (group_id,user_id) DO UPDATE SET message=EXCLUDED.message, answers=EXCLUDED.answers, status='pending', created_at=NOW()`,
      [g.id, req.user.id, clean(req.body?.message, 500), JSON.stringify(answers)]);
      background(async () => sendTo(await managersOf(g.id), 'join_request', { who: req.user.full_name, group: g.name },
        { url: `/grupos/${g.id}?aba=admin`, groupId: String(g.id) }, req.user.id));
      return res.status(202).json({ success: true, requested: true });
    }
    await db.query('INSERT INTO group_members (group_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [g.id, req.user.id]);
    touch(g.id);
    res.json({ success: true, joined: true });
  } catch (error) { console.error('Group join error:', error.message); res.status(500).json({ error: 'Não foi possível entrar no grupo.' }); }
});

// Cancelar o pedido para entrar
router.delete('/:id/join', authenticate, async (req, res) => {
  try {
    await db.query("DELETE FROM group_join_requests WHERE group_id=$1 AND user_id=$2 AND status='pending'", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível cancelar o pedido.' }); }
});

router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const group = (await db.query('SELECT creator_id FROM groups WHERE id=$1', [req.params.id])).rows[0];
    if (group && String(group.creator_id) === String(req.user.id)) return res.status(400).json({ error: 'O criador não pode sair do grupo.' });
    await db.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2', [req.params.id, req.user.id]); res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível sair do grupo.' }); }
});

router.patch('/:id/notifications', authenticate, async (req, res) => {
  try {
    const level = req.body?.level;
    if (!NOTIFY_LEVELS.includes(level)) return fail(res, 400, 'Opção inválida.');
    const r = await db.query('UPDATE group_members SET notify_level=$1 WHERE group_id=$2 AND user_id=$3 RETURNING notify_level', [level, req.params.id, req.user.id]);
    if (!r.rows[0]) return fail(res, 403, 'Entre no grupo primeiro.');
    res.json({ success: true, level });
  } catch { res.status(500).json({ error: 'Não foi possível guardar.' }); }
});

// ======================= PEDIDOS PARA ENTRAR =======================
router.get('/:id/requests', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const rows = (await db.query("SELECT r.user_id,r.message,r.answers,r.created_at,u.full_name,u.avatar_url FROM group_join_requests r JOIN users u ON u.id=r.user_id WHERE r.group_id=$1 AND r.status='pending' ORDER BY r.created_at", [c.g.id])).rows;
    res.json({ requests: rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar os pedidos.' }); }
});

router.post('/:id/requests/:userId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const approve = req.body?.action === 'approve';
    if (approve && await isBanned(c.g.id, req.params.userId)) return fail(res, 400, 'Esta pessoa está bloqueada neste grupo.');
    const upd = await db.query("UPDATE group_join_requests SET status=$1 WHERE group_id=$2 AND user_id=$3 AND status='pending' RETURNING user_id", [approve ? 'approved' : 'declined', c.g.id, req.params.userId]);
    if (!upd.rows.length) return res.status(404).json({ error: 'Este pedido já não está pendente.' });
    if (approve) {
      await db.query('INSERT INTO group_members (group_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [c.g.id, req.params.userId]);
      touch(c.g.id);
      background(() => sendTo([req.params.userId], 'approved', { group: c.g.name }, { url: `/grupos/${c.g.id}`, groupId: String(c.g.id) }, req.user.id));
    }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível atualizar o pedido.' }); }
});

// ======================= MEMBROS =======================
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const q = clean(req.query.q, 80);
    const params = [c.g.id];
    let filter = '';
    if (q) { params.push(`%${q.replace(/[%_\\]/g, (x) => '\\' + x)}%`); filter = ` AND u.full_name ILIKE $2`; }
    const rows = (await db.query(`SELECT u.id, u.full_name, u.avatar_url, gm.role, gm.joined_at, gm.muted_until,
        (u.id = (SELECT creator_id FROM groups WHERE id=$1)) is_creator
      FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 ${filter}
      ORDER BY CASE gm.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END, (u.id = (SELECT creator_id FROM groups WHERE id=$1)) DESC, gm.joined_at LIMIT 500`, params)).rows
      .map((r) => ({ ...r, muted_until: c.isManager && mutedNow(r) ? r.muted_until : null }));
    res.json({
      admins: rows.filter((r) => r.role === 'admin'),
      moderators: rows.filter((r) => r.role === 'moderator'),
      members: rows.filter((r) => r.role !== 'admin' && r.role !== 'moderator'),
      total: await memberCount(c.g.id),
    });
  } catch (error) { console.error('Group members error:', error.message); res.status(500).json({ error: 'Não foi possível carregar os membros.' }); }
});

// Pode quem age gerir o alvo? Ninguém mexe no criador; moderadores só em membros;
// só o criador mexe noutros administradores.
function canManageTarget(c, target, actorId) {
  if (!target) return false;
  if (String(target.user_id) === String(c.g.creator_id)) return false;
  if (String(target.user_id) === String(actorId)) return false;
  if (c.isAdmin) return target.role !== 'admin' || c.isCreator;
  if (c.isManager) return target.role === 'member' || !target.role;
  return false;
}
async function targetMember(groupId, userId) {
  return (await db.query('SELECT user_id, role FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId])).rows[0] || null;
}

router.patch('/:id/members/:userId/role', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res); if (!c) return;
    if (!c.isAdmin) return res.status(403).json({ error: 'Só administradores podem mudar funções.' });
    if (String(req.params.userId) === String(c.g.creator_id)) return res.status(400).json({ error: 'O criador permanece administrador.' });
    const role = req.body?.role;
    if (!['member', 'moderator', 'admin'].includes(role)) return res.status(400).json({ error: 'Função inválida.' });
    const target = await targetMember(c.g.id, req.params.userId);
    if (!target) return res.status(404).json({ error: 'Membro não encontrado.' });
    if (target.role === 'admin' && !c.isCreator && String(target.user_id) !== String(req.user.id)) return fail(res, 403, 'Só o criador pode alterar outro administrador.');
    const result = await db.query('UPDATE group_members SET role=$1 WHERE group_id=$2 AND user_id=$3 RETURNING role', [role, c.g.id, req.params.userId]);
    res.json({ success: true, role: result.rows[0].role });
  } catch { res.status(500).json({ error: 'Não foi possível atualizar o moderador.' }); }
});

// Remover (e opcionalmente bloquear)
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const target = await targetMember(c.g.id, req.params.userId);
    const block = bool(req.query.block) || bool(req.body?.block);
    if (target && !canManageTarget(c, target, req.user.id)) return fail(res, 403, 'Não pode remover esta pessoa.');
    if (!target && !block) return fail(res, 404, 'Membro não encontrado.');
    if (!target && String(req.params.userId) === String(c.g.creator_id)) return fail(res, 403, 'Não pode bloquear esta pessoa.');
    await db.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2', [c.g.id, req.params.userId]);
    if (block) {
      await db.query('INSERT INTO group_bans (group_id,user_id,banned_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [c.g.id, req.params.userId, req.user.id]);
      await db.query('DELETE FROM group_join_requests WHERE group_id=$1 AND user_id=$2', [c.g.id, req.params.userId]);
    }
    res.json({ success: true, blocked: block });
  } catch { res.status(500).json({ error: 'Não foi possível remover o membro.' }); }
});

// Silenciar por N dias (0 = tirar o silêncio)
router.post('/:id/members/:userId/mute', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const target = await targetMember(c.g.id, req.params.userId);
    if (!target) return fail(res, 404, 'Membro não encontrado.');
    if (!canManageTarget(c, target, req.user.id)) return fail(res, 403, 'Não pode silenciar esta pessoa.');
    const days = Math.round(Number(req.body?.days));
    if (!Number.isFinite(days) || days < 0 || days > 30) return fail(res, 400, 'Escolha entre 1 e 30 dias.');
    const r = await db.query(`UPDATE group_members SET muted_until = CASE WHEN $1::int = 0 THEN NULL ELSE NOW() + ($1::int * INTERVAL '1 day') END
      WHERE group_id=$2 AND user_id=$3 RETURNING muted_until`, [days, c.g.id, req.params.userId]);
    res.json({ success: true, muted_until: r.rows[0].muted_until });
  } catch { res.status(500).json({ error: 'Não foi possível silenciar.' }); }
});

router.get('/:id/bans', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const rows = (await db.query('SELECT b.user_id, b.created_at, u.full_name, u.avatar_url FROM group_bans b JOIN users u ON u.id=b.user_id WHERE b.group_id=$1 ORDER BY b.created_at DESC', [c.g.id])).rows;
    res.json({ bans: rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar os bloqueados.' }); }
});
router.delete('/:id/bans/:userId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    await db.query('DELETE FROM group_bans WHERE group_id=$1 AND user_id=$2', [c.g.id, req.params.userId]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível desbloquear.' }); }
});

// Convidar amigos (só amigos aceites; não membros e não bloqueados)
router.post('/:id/invite', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const ids = (Array.isArray(req.body?.user_ids) ? req.body.user_ids : []).filter((x) => UUID_RE.test(String(x))).slice(0, 50);
    if (!ids.length) return fail(res, 400, 'Escolha pelo menos uma pessoa.');
    const rows = (await db.query(`SELECT u.id user_id, u.language FROM users u WHERE u.id = ANY($1::uuid[])
      AND EXISTS (SELECT 1 FROM friendships f WHERE f.status='accepted' AND ((f.requester_id=$2 AND f.addressee_id=u.id) OR (f.addressee_id=$2 AND f.requester_id=u.id)))
      AND NOT EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id=$3 AND gm.user_id=u.id)
      AND NOT EXISTS (SELECT 1 FROM group_bans b WHERE b.group_id=$3 AND b.user_id=u.id)`, [ids, req.user.id, c.g.id])).rows;
    const url = `/grupos/${c.g.id}?convite=${encodeURIComponent(c.g.invite_code || '')}`;
    background(() => sendTo(rows, 'invite', { who: req.user.full_name, group: c.g.name }, { url, groupId: String(c.g.id) }, req.user.id));
    res.json({ success: true, invited: rows.length });
  } catch (error) { console.error('Group invite error:', error.message); res.status(500).json({ error: 'Não foi possível enviar os convites.' }); }
});

// ======================= DEFINIÇÕES =======================
router.patch('/:id/settings', authenticate, upload.single('cover'), async (req, res) => {
  try {
    const c = await ctx(req, res, { admin: true }); if (!c) return;
    const s = readSettings(req.body || {});
    if (s.name !== undefined && s.name.length < 3) return fail(res, 400, 'O nome do grupo deve ter pelo menos 3 letras.');
    if (s.visibility !== undefined && !VISIBILITIES.includes(s.visibility)) return res.status(400).json({ error: 'Privacidade inválida.' });
    let coverUrl = null;
    if (req.file && /^image\//.test(req.file.mimetype)) coverUrl = await uploader(req.file.buffer, 'sigo-com-fe/groups', req.file.mimetype);
    const removeCover = bool(req.body?.remove_cover);
    const group = (await db.query(`UPDATE groups SET
        name=COALESCE($1,name), description=CASE WHEN $2::boolean THEN $3 ELSE description END,
        visibility=COALESCE($4,visibility), privacy=CASE WHEN $4 IS NULL THEN privacy WHEN $4='public' THEN 'public' ELSE 'private' END,
        require_approval=COALESCE($5,require_approval), post_approval=COALESCE($6,post_approval),
        rules=CASE WHEN $7::boolean THEN $8 ELSE rules END, rules_list=CASE WHEN $7::boolean THEN $9::jsonb ELSE rules_list END,
        category=CASE WHEN $10::boolean THEN $11 ELSE category END,
        membership_questions=COALESCE($12::jsonb, membership_questions),
        cover_url=CASE WHEN $13::text IS NOT NULL THEN $13 WHEN $14::boolean THEN NULL ELSE cover_url END,
        updated_at=NOW() WHERE id=$15 RETURNING *`,
    [s.name ?? null, s.description !== undefined, s.description ?? null, s.visibility ?? null,
      s.require_approval ?? null, s.post_approval ?? null, s.rules_list !== undefined, s.rules ?? null, JSON.stringify(s.rules_list || []),
      s.category !== undefined, s.category ?? null, s.membership_questions ? JSON.stringify(s.membership_questions) : null,
      coverUrl, removeCover, c.g.id])).rows[0];
    res.json({ group: publicGroup(group, { invite_code: group.invite_code }) });
  } catch (error) { console.error('Group settings error:', error.message); res.status(500).json({ error: 'Não foi possível guardar as configurações.' }); }
});

router.post('/:id/invite-code', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { admin: true }); if (!c) return;
    const code = newInviteCode();
    await db.query('UPDATE groups SET invite_code=$1 WHERE id=$2', [code, c.g.id]);
    res.json({ invite_code: code });
  } catch { res.status(500).json({ error: 'Não foi possível gerar um novo link.' }); }
});

// ======================= PUBLICAÇÕES =======================
router.get('/:id/posts', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);
    const type = ['prayer', 'poll', 'text'].includes(req.query.type) ? req.query.type : null;
    const params = [req.user.id, c.g.id];
    let where = `gp.group_id=$2 AND gp.status='published'`;
    if (type) { params.push(type); where += ` AND gp.post_type=$${params.length}`; }
    if (req.query.answered === 'true') where += ' AND gp.answered_at IS NOT NULL';
    if (req.query.answered === 'false') where += ' AND gp.answered_at IS NULL';
    const cursor = String(req.query.cursor || '');
    const first = !cursor;
    if (!type) where += ' AND gp.is_pinned=false'; // os destacados vêm à parte, no topo
    if (cursor) {
      const [iso, cid] = cursor.split('|');
      if (!iso || Number.isNaN(Date.parse(iso)) || !UUID_RE.test(cid || '')) return fail(res, 400, 'Cursor inválido.');
      params.push(iso, cid); where += ` AND (gp.created_at, gp.id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`;
    }
    params.push(limit);
    const rows = (await db.query(`${POST_SELECT} WHERE ${where} ORDER BY gp.created_at DESC, gp.id DESC LIMIT $${params.length}`, params)).rows.map(shapePost);
    let pinned = [];
    let myPending = 0;
    if (first && !type) {
      pinned = (await db.query(`${POST_SELECT} WHERE gp.group_id=$2 AND gp.status='published' AND gp.is_pinned=true ORDER BY gp.pinned_at DESC NULLS LAST LIMIT 10`, [req.user.id, c.g.id])).rows.map(shapePost);
      myPending = (await db.query("SELECT COUNT(*)::int c FROM group_posts WHERE group_id=$1 AND author_id=$2 AND status='pending'", [c.g.id, req.user.id])).rows[0].c;
    }
    const last = rows[rows.length - 1];
    res.json({ posts: rows, pinned, my_pending: myPending, next_cursor: rows.length === limit && last ? `${new Date(last.created_at).toISOString()}|${last.id}` : null });
  } catch (error) { console.error('Group posts error:', error.message); res.status(500).json({ error: 'Não foi possível carregar as publicações.' }); }
});

router.get('/:id/posts/:postId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const post = await getPost(c.g.id, req.params.postId, req.user.id);
    if (!post || (post.status !== 'published' && !c.isManager && String(post.author_id) !== String(req.user.id))) return fail(res, 404, 'Publicação não encontrada.');
    res.json({ post });
  } catch { res.status(500).json({ error: 'Não foi possível abrir a publicação.' }); }
});

async function createPost(req, res, c, input) {
  const { g, m } = c;
  if (mutedNow(m)) return fail(res, 403, 'Está silenciado(a) neste grupo e não pode publicar por agora.', { code: 'muted', muted_until: m.muted_until });
  if (!rateOk(`post:${req.user.id}`, postLimit(), 10 * 60 * 1000)) return fail(res, 429, 'Está a publicar muito depressa. Espere alguns minutos.', { code: 'rate_limited' });
  const type = ['text', 'poll', 'prayer'].includes(input.post_type) ? input.post_type : 'text';
  const content = clean(input.content, 5000);
  const media = input.media || [];
  if (type === 'text' && !content && !media.length) return fail(res, 400, 'Escreva uma publicação ou escolha uma foto ou vídeo.');
  if (type === 'prayer' && content.length < 3) return fail(res, 400, 'Escreva o seu pedido de oração.');
  let options = [];
  if (type === 'poll') {
    if (content.length < 3) return fail(res, 400, 'Escreva a pergunta da enquete.');
    options = list(input.poll_options, 7, 120);
    const unique = new Set(options.map((o) => o.toLowerCase()));
    if (options.length < 2 || options.length > 6 || unique.size !== options.length) return fail(res, 400, 'A enquete precisa de 2 a 6 opções diferentes.');
  }
  const status = g.post_approval && !c.isManager ? 'pending' : 'published';
  const isAnnouncement = c.isManager && bool(input.is_announcement);
  const post = (await db.query(`INSERT INTO group_posts (group_id,author_id,content,media_url,media_urls,post_type,status,is_announcement)
    VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8) RETURNING *`,
  [g.id, req.user.id, content, media[0] || null, JSON.stringify(media), type, status, isAnnouncement])).rows[0];
  for (let i = 0; i < options.length; i += 1) await db.query('INSERT INTO group_poll_options (post_id,text,position) VALUES ($1,$2,$3)', [post.id, options[i], i]);
  if (status === 'published') { touch(g.id); fanOutPost(g, post, req.user); }
  const full = await getPost(g.id, post.id, req.user.id);
  res.status(201).json({ post: full, pending: status === 'pending' });
}

router.post('/:id/posts', authenticate, upload.fields([{ name: 'media', maxCount: 1 }, { name: 'photos', maxCount: 6 }]), async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const files = [...(req.files?.media || []), ...(req.files?.photos || [])].slice(0, 6);
    if (mutedNow(c.m)) return fail(res, 403, 'Está silenciado(a) neste grupo e não pode publicar por agora.', { code: 'muted', muted_until: c.m.muted_until });
    const media = [];
    for (const f of files) media.push(await uploader(f.buffer, 'sigo-com-fe/group-posts', f.mimetype));
    await createPost(req, res, c, { ...req.body, media });
  } catch (error) { console.error('Group post error:', error.message); res.status(500).json({ error: 'Não foi possível publicar.' }); }
});

router.patch('/:id/posts/:postId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await postRow(c.g.id, req.params.postId);
    if (!post) return fail(res, 404, 'Publicação não encontrada.');
    if (String(post.author_id) !== String(req.user.id)) return fail(res, 403, 'Só pode editar as suas publicações.');
    const content = clean(req.body?.content, 5000);
    if (!content && !(post.media_urls || []).length && !post.media_url) return fail(res, 400, 'A publicação não pode ficar vazia.');
    await db.query('UPDATE group_posts SET content=$1, edited_at=NOW() WHERE id=$2', [content, post.id]);
    res.json({ post: await getPost(c.g.id, post.id, req.user.id) });
  } catch { res.status(500).json({ error: 'Não foi possível editar.' }); }
});

router.delete('/:id/posts/:postId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await postRow(c.g.id, req.params.postId);
    if (!post) return fail(res, 404, 'Publicação não encontrada.');
    if (String(post.author_id) !== String(req.user.id) && !c.isManager) return fail(res, 403, 'Não pode apagar esta publicação.');
    await db.query('DELETE FROM group_posts WHERE id=$1', [post.id]);
    if (post.legacy_prayer_id) await db.query('DELETE FROM group_prayers WHERE id=$1', [post.legacy_prayer_id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível apagar.' }); }
});

// Fixar (Destaques) e desligar comentários
router.patch('/:id/posts/:postId/moderation', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await postRow(c.g.id, req.params.postId);
    if (!post) return fail(res, 404, 'Publicação não encontrada.');
    const isAuthor = String(post.author_id) === String(req.user.id);
    const body = req.body || {};
    if (body.is_pinned !== undefined && !c.isManager) return fail(res, 403, 'Só administradores e moderadores podem destacar.');
    if (body.comments_off !== undefined && !c.isManager && !isAuthor) return fail(res, 403, 'Não pode alterar os comentários desta publicação.');
    if (body.is_pinned !== undefined) {
      const pin = bool(body.is_pinned);
      await db.query('UPDATE group_posts SET is_pinned=$1, pinned_at=CASE WHEN $1 THEN NOW() ELSE NULL END WHERE id=$2', [pin, post.id]);
      if (pin && !post.is_pinned && post.status === 'published') {
        // Quem escolheu "Destaques" recebe aviso quando algo é destacado
        background(async () => {
          const rows = (await db.query(`SELECT gm.user_id, u.language FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 AND gm.notify_level='highlights'`, [c.g.id])).rows;
          const author = await userLang(post.author_id);
          await sendTo(rows, 'announcement', { who: author.full_name, group: c.g.name, text: post.content }, { url: `/grupos/${c.g.id}?post=${post.id}`, groupId: String(c.g.id), postId: String(post.id) }, req.user.id);
        });
      }
    }
    if (body.comments_off !== undefined) await db.query('UPDATE group_posts SET comments_off=$1 WHERE id=$2', [bool(body.comments_off), post.id]);
    res.json({ post: await getPost(c.g.id, post.id, req.user.id) });
  } catch { res.status(500).json({ error: 'Não foi possível atualizar a publicação.' }); }
});

async function publishedPost(c, postId) {
  const post = await postRow(c.g.id, postId);
  return post && post.status === 'published' ? post : null;
}

// Reações: uma por pessoa, pode trocar; reaction=null tira
router.post('/:id/posts/:postId/react', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await publishedPost(c, req.params.postId);
    if (!post) return fail(res, 404, 'Publicação não encontrada.');
    const reaction = req.body?.reaction ?? null;
    if (reaction !== null && !REACTIONS.includes(reaction)) return fail(res, 400, 'Reação inválida.');
    if (reaction === null) {
      await db.query('DELETE FROM group_post_reactions WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id]);
      await db.query('DELETE FROM group_post_likes WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id]);
    } else {
      await db.query(`INSERT INTO group_post_reactions (post_id,user_id,reaction) VALUES ($1,$2,$3)
        ON CONFLICT (post_id,user_id) DO UPDATE SET reaction=EXCLUDED.reaction, created_at=NOW()`, [post.id, req.user.id, reaction]);
    }
    const p = await getPost(c.g.id, post.id, req.user.id);
    res.json({ reactions: p.reactions, my_reaction: p.my_reaction, reaction_count: p.reaction_count });
  } catch { res.status(500).json({ error: 'Não foi possível registar a reação.' }); }
});

router.get('/:id/posts/:postId/reactions', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const rows = (await db.query(`SELECT r.reaction, u.id, u.full_name, u.avatar_url FROM group_post_reactions r JOIN users u ON u.id=r.user_id
      JOIN group_posts p ON p.id=r.post_id WHERE r.post_id=$1 AND p.group_id=$2 ORDER BY r.created_at DESC LIMIT 300`, [req.params.postId, c.g.id])).rows;
    res.json({ reactions: rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar as reações.' }); }
});

// Antigo "gosto" (alterna a reação Amém)
router.post('/:id/posts/:postId/like', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await publishedPost(c, req.params.postId);
    if (!post) return res.status(404).json({ error: 'Publicação não encontrada.' });
    const existing = (await db.query('SELECT 1 FROM group_post_reactions WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id])).rows[0];
    if (existing) {
      await db.query('DELETE FROM group_post_reactions WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id]);
      await db.query('DELETE FROM group_post_likes WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id]);
    } else await db.query("INSERT INTO group_post_reactions (post_id,user_id,reaction) VALUES ($1,$2,'amen') ON CONFLICT DO NOTHING", [post.id, req.user.id]);
    const count = (await db.query('SELECT COUNT(*)::int AS count FROM group_post_reactions WHERE post_id=$1', [post.id])).rows[0].count;
    res.json({ liked: !existing, like_count: count });
  } catch { res.status(500).json({ error: 'Não foi possível registar a reação.' }); }
});

// Enquete: um voto por pessoa, pode mudar
router.post('/:id/posts/:postId/vote', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await publishedPost(c, req.params.postId);
    if (!post || post.post_type !== 'poll') return fail(res, 404, 'Enquete não encontrada.');
    const optionId = req.body?.option_id ?? null;
    if (optionId === null) await db.query('DELETE FROM group_poll_votes WHERE post_id=$1 AND user_id=$2', [post.id, req.user.id]);
    else {
      if (!UUID_RE.test(String(optionId))) return fail(res, 400, 'Opção inválida.');
      const opt = (await db.query('SELECT id FROM group_poll_options WHERE id=$1 AND post_id=$2', [optionId, post.id])).rows[0];
      if (!opt) return fail(res, 400, 'Opção inválida.');
      await db.query(`INSERT INTO group_poll_votes (post_id,user_id,option_id) VALUES ($1,$2,$3)
        ON CONFLICT (post_id,user_id) DO UPDATE SET option_id=EXCLUDED.option_id, created_at=NOW()`, [post.id, req.user.id, opt.id]);
    }
    res.json({ poll: (await getPost(c.g.id, post.id, req.user.id)).poll });
  } catch { res.status(500).json({ error: 'Não foi possível votar.' }); }
});

// "Orei" (uma vez por pessoa)
router.post('/:id/posts/:postId/pray', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await publishedPost(c, req.params.postId);
    if (!post || post.post_type !== 'prayer') return fail(res, 404, 'Pedido de oração não encontrado.');
    const r = await db.query('INSERT INTO group_prayer_prayed (post_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING 1', [post.id, req.user.id]);
    const count = (await db.query('SELECT COUNT(*)::int c FROM group_prayer_prayed WHERE post_id=$1', [post.id])).rows[0].c;
    res.json({ prayed_by_me: true, prayed_count: count, already: !r.rows.length });
  } catch { res.status(500).json({ error: 'Não foi possível registar a sua oração.' }); }
});

// Oração respondida (autor ou admin/moderador), com testemunho opcional
router.post('/:id/posts/:postId/answered', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const post = await publishedPost(c, req.params.postId);
    if (!post || post.post_type !== 'prayer') return fail(res, 404, 'Pedido de oração não encontrado.');
    if (String(post.author_id) !== String(req.user.id) && !c.isManager) return fail(res, 403, 'Só quem pediu (ou um administrador) pode marcar como respondida.');
    const answered = req.body?.answered === undefined ? true : bool(req.body.answered);
    const testimony = clean(req.body?.testimony, 2000) || null;
    await db.query('UPDATE group_posts SET answered_at=CASE WHEN $1 THEN COALESCE(answered_at, NOW()) ELSE NULL END, testimony=CASE WHEN $1 THEN $2 ELSE NULL END WHERE id=$3', [answered, testimony, post.id]);
    if (post.legacy_prayer_id) await db.query('UPDATE group_prayers SET is_answered=$1 WHERE id=$2', [answered, post.legacy_prayer_id]);
    res.json({ post: await getPost(c.g.id, post.id, req.user.id) });
  } catch { res.status(500).json({ error: 'Não foi possível atualizar o pedido.' }); }
});

// ======================= COMENTÁRIOS =======================
router.get('/:id/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const comments = await db.query(`SELECT c.id, c.post_id, c.author_id, c.content, c.parent_id, c.edited_at, c.created_at, u.full_name author_name, u.avatar_url author_avatar,
      (SELECT role FROM group_members m WHERE m.group_id=p.group_id AND m.user_id=c.author_id) author_role
      FROM group_post_comments c JOIN group_posts p ON p.id=c.post_id JOIN users u ON u.id=c.author_id
      WHERE c.post_id=$1 AND p.group_id=$2 AND p.status='published' ORDER BY c.created_at ASC LIMIT 500`, [req.params.postId, c.g.id]);
    res.json({ comments: comments.rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar os comentários.' }); }
});

router.post('/:id/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    if (mutedNow(c.m)) return fail(res, 403, 'Está silenciado(a) neste grupo e não pode comentar por agora.', { code: 'muted', muted_until: c.m.muted_until });
    const content = clean(req.body?.content, 2000);
    if (!content) return res.status(400).json({ error: 'Escreva um comentário.' });
    const post = await publishedPost(c, req.params.postId);
    if (!post) return res.status(404).json({ error: 'Publicação não encontrada.' });
    if (post.comments_off && !c.isManager) return fail(res, 403, 'Os comentários desta publicação estão desligados.', { code: 'comments_off' });
    if (!rateOk(`comment:${req.user.id}`, commentLimit(), 5 * 60 * 1000)) return fail(res, 429, 'Está a comentar muito depressa. Espere um pouco.', { code: 'rate_limited' });
    let parent = null;
    let replyTo = null;
    if (req.body?.parent_id) {
      if (!UUID_RE.test(String(req.body.parent_id))) return fail(res, 400, 'Comentário inválido.');
      const direct = (await db.query('SELECT id, parent_id, author_id FROM group_post_comments WHERE id=$1 AND post_id=$2', [req.body.parent_id, post.id])).rows[0];
      if (!direct) return fail(res, 404, 'Comentário não encontrado.');
      replyTo = direct.author_id;
      // Só um nível de respostas: responder a uma resposta fica no mesmo fio
      parent = direct.parent_id ? ((await db.query('SELECT id, parent_id, author_id FROM group_post_comments WHERE id=$1', [direct.parent_id])).rows[0] || direct) : direct;
    }
    const comment = (await db.query('INSERT INTO group_post_comments (post_id,author_id,content,parent_id) VALUES ($1,$2,$3,$4) RETURNING *', [post.id, req.user.id, content, parent?.id || null])).rows[0];
    touch(c.g.id);
    background(async () => {
      const data = { url: `/grupos/${c.g.id}?post=${post.id}`, groupId: String(c.g.id), postId: String(post.id), commentId: String(comment.id) };
      const replyTarget = replyTo ? String(replyTo) : null;
      if (replyTarget) await sendTo([replyTarget], 'reply', { who: req.user.full_name, text: content }, data, req.user.id);
      if (String(post.author_id) !== replyTarget) await sendTo([post.author_id], 'comment', { who: req.user.full_name, text: content }, data, req.user.id);
    });
    res.status(201).json({ comment: { ...comment, author_name: req.user.full_name, author_avatar: req.user.avatar_url, author_role: c.m.role } });
  } catch (error) { console.error('Group comment error:', error.message); res.status(500).json({ error: 'Não foi possível publicar o comentário.' }); }
});

async function commentRow(groupId, commentId) {
  return (await db.query('SELECT c.* FROM group_post_comments c JOIN group_posts p ON p.id=c.post_id WHERE c.id=$1 AND p.group_id=$2', [commentId, groupId])).rows[0] || null;
}
router.patch('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const row = await commentRow(c.g.id, req.params.commentId);
    if (!row) return fail(res, 404, 'Comentário não encontrado.');
    if (String(row.author_id) !== String(req.user.id)) return fail(res, 403, 'Só pode editar os seus comentários.');
    const content = clean(req.body?.content, 2000);
    if (!content) return fail(res, 400, 'Escreva um comentário.');
    const r = await db.query('UPDATE group_post_comments SET content=$1, edited_at=NOW() WHERE id=$2 RETURNING *', [content, row.id]);
    res.json({ comment: r.rows[0] });
  } catch { res.status(500).json({ error: 'Não foi possível editar.' }); }
});
router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const row = await commentRow(c.g.id, req.params.commentId);
    if (!row) return fail(res, 404, 'Comentário não encontrado.');
    if (String(row.author_id) !== String(req.user.id) && !c.isManager) return fail(res, 403, 'Não pode apagar este comentário.');
    await db.query('DELETE FROM group_post_comments WHERE id=$1', [row.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível apagar.' }); }
});

// ======================= DENÚNCIAS =======================
router.post('/:id/reports', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const reason = REPORT_REASONS.includes(req.body?.reason) ? req.body.reason : null;
    if (!reason) return fail(res, 400, 'Escolha um motivo.');
    const postId = UUID_RE.test(String(req.body?.post_id || '')) ? req.body.post_id : null;
    const commentId = UUID_RE.test(String(req.body?.comment_id || '')) ? req.body.comment_id : null;
    if (!postId && !commentId) return fail(res, 400, 'Indique o que quer denunciar.');
    if (commentId && !await commentRow(c.g.id, commentId)) return fail(res, 404, 'Comentário não encontrado.');
    if (postId && !commentId && !await postRow(c.g.id, postId)) return fail(res, 404, 'Publicação não encontrada.');
    const dup = (await db.query(`SELECT 1 FROM group_reports WHERE group_id=$1 AND reporter_id=$2 AND status='open' AND post_id IS NOT DISTINCT FROM $3 AND comment_id IS NOT DISTINCT FROM $4`,
      [c.g.id, req.user.id, commentId ? null : postId, commentId])).rows[0];
    if (!dup) {
      await db.query('INSERT INTO group_reports (group_id,post_id,comment_id,reporter_id,reason,details) VALUES ($1,$2,$3,$4,$5,$6)',
        [c.g.id, commentId ? null : postId, commentId, req.user.id, reason, clean(req.body?.details, 1000) || null]);
    }
    res.status(201).json({ success: true });
  } catch (error) { console.error('Group report error:', error.message); res.status(500).json({ error: 'Não foi possível enviar a denúncia.' }); }
});
router.get('/:id/reports', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const rows = (await db.query(`SELECT r.id, r.reason, r.details, r.status, r.created_at, r.post_id, r.comment_id,
        rep.full_name reporter_name, COALESCE(cm.content, p.content) content, COALESCE(cu.full_name, pu.full_name) author_name,
        COALESCE(cm.author_id, p.author_id) author_id, cm.post_id comment_post_id
      FROM group_reports r LEFT JOIN users rep ON rep.id=r.reporter_id
      LEFT JOIN group_posts p ON p.id=r.post_id LEFT JOIN users pu ON pu.id=p.author_id
      LEFT JOIN group_post_comments cm ON cm.id=r.comment_id LEFT JOIN users cu ON cu.id=cm.author_id
      WHERE r.group_id=$1 AND r.status='open' ORDER BY r.created_at DESC LIMIT 100`, [c.g.id])).rows;
    res.json({ reports: rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar as denúncias.' }); }
});
router.patch('/:id/reports/:reportId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const status = ['resolved', 'dismissed'].includes(req.body?.status) ? req.body.status : null;
    if (!status) return fail(res, 400, 'Estado inválido.');
    const r = await db.query('UPDATE group_reports SET status=$1 WHERE id=$2 AND group_id=$3 RETURNING id', [status, req.params.reportId, c.g.id]);
    if (!r.rows[0]) return fail(res, 404, 'Denúncia não encontrada.');
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível atualizar a denúncia.' }); }
});

// ======================= APROVAÇÃO DE PUBLICAÇÕES =======================
router.get('/:id/pending-posts', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const rows = (await db.query(`${POST_SELECT} WHERE gp.group_id=$2 AND gp.status='pending' ORDER BY gp.created_at ASC LIMIT 100`, [req.user.id, c.g.id])).rows.map(shapePost);
    res.json({ posts: rows });
  } catch { res.status(500).json({ error: 'Não foi possível carregar as publicações pendentes.' }); }
});
router.post('/:id/pending-posts/:postId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const post = await postRow(c.g.id, req.params.postId);
    if (!post || post.status !== 'pending') return fail(res, 404, 'Esta publicação já não está pendente.');
    if (req.body?.action === 'approve') {
      const upd = (await db.query("UPDATE group_posts SET status='published', created_at=NOW() WHERE id=$1 RETURNING *", [post.id])).rows[0];
      touch(c.g.id);
      const author = await userLang(post.author_id);
      fanOutPost(c.g, upd, { id: post.author_id, full_name: author.full_name });
      background(() => sendTo([post.author_id], 'post_approved', { group: c.g.name }, { url: `/grupos/${c.g.id}?post=${post.id}`, groupId: String(c.g.id), postId: String(post.id) }, req.user.id));
      return res.json({ success: true, status: 'published' });
    }
    if (req.body?.action === 'decline') {
      await db.query('DELETE FROM group_posts WHERE id=$1', [post.id]);
      return res.json({ success: true, status: 'declined' });
    }
    fail(res, 400, 'Ação inválida.');
  } catch { res.status(500).json({ error: 'Não foi possível atualizar a publicação.' }); }
});

// ======================= FOTOS =======================
router.get('/:id/photos', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 120);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const rows = (await db.query(`SELECT x.post_id, x.url, x.created_at, x.author_name FROM (
        SELECT gp.id post_id, gp.created_at, u.full_name author_name,
          jsonb_array_elements_text(CASE WHEN jsonb_array_length(gp.media_urls) > 0 THEN gp.media_urls WHEN gp.media_url IS NOT NULL THEN jsonb_build_array(gp.media_url) ELSE '[]'::jsonb END) url
        FROM group_posts gp JOIN users u ON u.id=gp.author_id WHERE gp.group_id=$1 AND gp.status='published') x
      ORDER BY x.created_at DESC LIMIT 1000`, [c.g.id])).rows.filter((r) => !isVideo(r.url));
    res.json({ photos: rows.slice(offset, offset + limit), total: rows.length });
  } catch (error) { console.error('Group photos error:', error.message); res.status(500).json({ error: 'Não foi possível carregar as fotos.' }); }
});

// ======================= EVENTOS =======================
const EVENT_SELECT = `SELECT e.*, u.full_name creator_name,
  (SELECT COUNT(*)::int FROM group_event_rsvps r WHERE r.event_id=e.id AND r.status='going') going_count,
  (SELECT COUNT(*)::int FROM group_event_rsvps r WHERE r.event_id=e.id AND r.status='maybe') maybe_count,
  (SELECT COUNT(*)::int FROM group_event_rsvps r WHERE r.event_id=e.id AND r.status='declined') declined_count,
  (SELECT status FROM group_event_rsvps r WHERE r.event_id=e.id AND r.user_id=$2) my_rsvp,
  (SELECT COALESCE(json_agg(json_build_object('id', x.id, 'full_name', x.full_name, 'avatar_url', x.avatar_url)), '[]'::json) FROM (
     SELECT u2.id, u2.full_name, u2.avatar_url FROM group_event_rsvps r2 JOIN users u2 ON u2.id=r2.user_id WHERE r2.event_id=e.id AND r2.status='going' ORDER BY r2.updated_at LIMIT 5) x) going_preview
  FROM group_events e LEFT JOIN users u ON u.id=e.creator_id`;

router.get('/:id/events', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { content: true }); if (!c) return;
    const upcoming = (await db.query(`${EVENT_SELECT} WHERE e.group_id=$1 AND e.starts_at >= NOW() - INTERVAL '3 hours' ORDER BY e.starts_at ASC LIMIT 50`, [c.g.id, req.user.id])).rows;
    const past = (await db.query(`${EVENT_SELECT} WHERE e.group_id=$1 AND e.starts_at < NOW() - INTERVAL '3 hours' ORDER BY e.starts_at DESC LIMIT 30`, [c.g.id, req.user.id])).rows;
    res.json({ upcoming, past });
  } catch (error) { console.error('Group events error:', error.message); res.status(500).json({ error: 'Não foi possível carregar os eventos.' }); }
});

router.post('/:id/events', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    if (mutedNow(c.m)) return fail(res, 403, 'Está silenciado(a) neste grupo.', { code: 'muted' });
    const title = clean(req.body?.title, 180);
    const startsAt = req.body?.starts_at;
    if (title.length < 3 || !startsAt || Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ error: 'Informe o título e a data do evento.' });
    if (Date.parse(startsAt) < Date.now() - 60 * 60 * 1000) return fail(res, 400, 'A data do evento já passou.');
    const onlineUrl = clean(req.body?.online_url, 500);
    if (onlineUrl && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(onlineUrl)) return fail(res, 400, 'O link online deve começar por https://');
    const event = (await db.query('INSERT INTO group_events (group_id,creator_id,title,description,starts_at,location,online_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [c.g.id, req.user.id, title, clean(req.body?.description, 2000) || null, new Date(startsAt).toISOString(), clean(req.body?.location, 200) || null, onlineUrl || null])).rows[0];
    // Quem cria vai automaticamente
    await db.query("INSERT INTO group_event_rsvps (event_id,user_id,status) VALUES ($1,$2,'going') ON CONFLICT DO NOTHING", [event.id, req.user.id]);
    touch(c.g.id);
    background(async () => {
      const rows = (await db.query(`SELECT gm.user_id, u.language FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 AND gm.notify_level='all' LIMIT 2000`, [c.g.id])).rows;
      await sendTo(rows, 'event_new', { group: c.g.name, event: title }, { url: `/grupos/${c.g.id}?aba=eventos`, groupId: String(c.g.id), eventId: String(event.id) }, req.user.id);
    });
    res.status(201).json({ event });
  } catch (error) { console.error('Group event error:', error.message); res.status(500).json({ error: 'Não foi possível criar o evento.' }); }
});

router.delete('/:id/events/:eventId', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const ev = (await db.query('SELECT creator_id FROM group_events WHERE id=$1 AND group_id=$2', [req.params.eventId, c.g.id])).rows[0];
    if (!ev) return fail(res, 404, 'Evento não encontrado.');
    if (String(ev.creator_id) !== String(req.user.id) && !c.isManager) return fail(res, 403, 'Não pode apagar este evento.');
    await db.query('DELETE FROM group_events WHERE id=$1', [req.params.eventId]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível apagar o evento.' }); }
});

router.post('/:id/events/:eventId/rsvp', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const ev = (await db.query('SELECT id FROM group_events WHERE id=$1 AND group_id=$2', [req.params.eventId, c.g.id])).rows[0];
    if (!ev) return fail(res, 404, 'Evento não encontrado.');
    const status = req.body?.status ?? null;
    if (status !== null && !RSVP.includes(status)) return fail(res, 400, 'Resposta inválida.');
    if (status === null) await db.query('DELETE FROM group_event_rsvps WHERE event_id=$1 AND user_id=$2', [ev.id, req.user.id]);
    else await db.query(`INSERT INTO group_event_rsvps (event_id,user_id,status) VALUES ($1,$2,$3)
      ON CONFLICT (event_id,user_id) DO UPDATE SET status=EXCLUDED.status, updated_at=NOW()`, [ev.id, req.user.id, status]);
    const event = (await db.query(`${EVENT_SELECT} WHERE e.id=$1`, [ev.id, req.user.id])).rows[0];
    res.json({ event });
  } catch { res.status(500).json({ error: 'Não foi possível guardar a resposta.' }); }
});

// Lembrete ~1 hora antes para quem respondeu "Vou" ou "Talvez".
// Idempotente: cada evento é "reservado" com reminder_sent_at antes de enviar.
async function runEventReminders() {
  await ensureFeatures();
  const due = (await db.query(`UPDATE group_events SET reminder_sent_at=NOW()
     WHERE reminder_sent_at IS NULL AND starts_at > NOW() AND starts_at <= NOW() + INTERVAL '65 minutes'
     RETURNING id, group_id, title`)).rows;
  for (const ev of due) {
    const g = (await db.query('SELECT name FROM groups WHERE id=$1', [ev.group_id])).rows[0];
    const rows = (await db.query(`SELECT r.user_id, u.language FROM group_event_rsvps r JOIN users u ON u.id=r.user_id
      WHERE r.event_id=$1 AND r.status IN ('going','maybe')`, [ev.id])).rows;
    await sendTo(rows, 'event_reminder', { group: g?.name, event: ev.title }, { url: `/grupos/${ev.group_id}?aba=eventos`, groupId: String(ev.group_id), eventId: String(ev.id) }, null);
  }
  return due.length;
}
router.runEventReminders = runEventReminders;
if (!process.env.GROUPS_DISABLE_JOBS) {
  const timer = setInterval(() => { runEventReminders().catch((e) => console.error('Group reminders:', e.message)); }, 5 * 60 * 1000);
  if (timer.unref) timer.unref();
}

// ======================= ESTATÍSTICAS =======================
router.get('/:id/insights', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { manager: true }); if (!c) return;
    const k = (await db.query(`SELECT
      (SELECT COUNT(*)::int FROM group_members WHERE group_id=$1) members_total,
      (SELECT COUNT(*)::int FROM group_members WHERE group_id=$1 AND joined_at > NOW() - INTERVAL '7 days') new_members_7d,
      (SELECT COUNT(*)::int FROM group_members WHERE group_id=$1 AND joined_at > NOW() - INTERVAL '30 days') new_members_30d,
      (SELECT COUNT(*)::int FROM group_posts WHERE group_id=$1 AND status='published' AND created_at > NOW() - INTERVAL '7 days') posts_7d,
      (SELECT COUNT(*)::int FROM group_posts WHERE group_id=$1 AND status='published' AND created_at > NOW() - INTERVAL '30 days') posts_30d,
      (SELECT COUNT(*)::int FROM group_post_comments c JOIN group_posts p ON p.id=c.post_id WHERE p.group_id=$1 AND c.created_at > NOW() - INTERVAL '30 days') comments_30d,
      (SELECT COUNT(*)::int FROM group_join_requests WHERE group_id=$1 AND status='pending') pending_requests,
      (SELECT COUNT(*)::int FROM group_posts WHERE group_id=$1 AND status='pending') pending_posts,
      (SELECT COUNT(*)::int FROM group_reports WHERE group_id=$1 AND status='open') open_reports`, [c.g.id])).rows[0];
    const top = (await db.query(`SELECT u.id, u.full_name, u.avatar_url,
        (SELECT COUNT(*)::int FROM group_posts p WHERE p.group_id=$1 AND p.author_id=u.id AND p.status='published' AND p.created_at > NOW() - INTERVAL '30 days') posts,
        (SELECT COUNT(*)::int FROM group_post_comments cm JOIN group_posts p ON p.id=cm.post_id WHERE p.group_id=$1 AND cm.author_id=u.id AND cm.created_at > NOW() - INTERVAL '30 days') comments
      FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1`, [c.g.id])).rows
      .filter((r) => r.posts + r.comments > 0).sort((a, b) => (b.posts * 2 + b.comments) - (a.posts * 2 + a.comments)).slice(0, 5);
    res.json({ insights: { ...k, top_members: top } });
  } catch (error) { console.error('Group insights error:', error.message); res.status(500).json({ error: 'Não foi possível carregar as estatísticas.' }); }
});

// ======================= ROTAS ANTIGAS (compatibilidade) =======================
router.get('/:id/tools', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const prayers = await db.query(`SELECT p.id, p.group_id, p.author_id, p.content, (p.answered_at IS NOT NULL) is_answered, p.created_at, u.full_name author_name
      FROM group_posts p JOIN users u ON u.id=p.author_id WHERE p.group_id=$1 AND p.post_type='prayer' AND p.status='published' ORDER BY p.created_at DESC LIMIT 30`, [c.g.id]);
    const events = await db.query(`SELECT * FROM group_events WHERE group_id=$1 AND starts_at >= NOW() - INTERVAL '1 day' ORDER BY starts_at ASC LIMIT 30`, [c.g.id]);
    res.json({ prayers: prayers.rows, events: events.rows });
  } catch (error) { console.error('Group tools error:', error.message); res.status(500).json({ error: 'Não foi possível carregar as ferramentas do grupo.' }); }
});

router.post('/:id/prayers', authenticate, async (req, res) => {
  try {
    const c = await ctx(req, res, { member: true }); if (!c) return;
    const json = res.json.bind(res);
    // Responde no formato antigo { prayer }
    res.json = (body) => json(body?.post ? { prayer: { ...body.post, is_answered: false } } : body);
    await createPost(req, res, c, { content: req.body?.content, post_type: 'prayer' });
  } catch { res.status(500).json({ error: 'Não foi possível enviar o pedido.' }); }
});

// ======================= APAGAR GRUPO =======================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const group = (await db.query('SELECT id, name, creator_id FROM groups WHERE id=$1', [req.params.id])).rows[0];
    if (!group) return fail(res, 404, 'Grupo não encontrado.');
    const m = await member(group.id, req.user.id);
    const allowed = String(group.creator_id) === String(req.user.id) || m?.role === 'admin';
    if (!allowed) return res.status(403).json({ error: 'Apenas administradores podem apagar o grupo.' });
    const confirm = req.body?.confirm_name ?? req.query.confirm_name;
    if (confirm !== undefined && String(confirm).trim().toLowerCase() !== String(group.name).trim().toLowerCase()) return fail(res, 400, 'O nome escrito não corresponde ao nome do grupo.', { code: 'confirm_mismatch' });
    await db.query('DELETE FROM groups WHERE id=$1', [group.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Não foi possível apagar o grupo.' }); }
});

module.exports = router;
