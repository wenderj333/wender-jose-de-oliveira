const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43', api_key: process.env.CLOUDINARY_API_KEY || '914835643241235', api_secret: process.env.CLOUDINARY_API_SECRET || '7Eu52T0NYAAy2hmXHl0i4C0TgUo' });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, /^(image|video)\//.test(file.mimetype)) });
const uploadToCloud = (buffer, folder) => new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => error ? reject(error) : resolve(result)); stream.end(buffer); });

async function ensureFeatures() {
  // The deploy migration creates these columns before the server starts.
  return Promise.resolve();
}
async function member(groupId, userId) { return (await db.query('SELECT role FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId])).rows[0] || null; }
async function manager(req, res) {
  const current = await member(req.params.id, req.user.id);
  if (!current || !['admin', 'moderator'].includes(current.role)) { res.status(403).json({ error: 'Apenas administradores ou moderadores podem gerir este grupo.' }); return null; }
  return current;
}

router.get('/', authenticate, async (req, res) => {
  try {
    await ensureFeatures();
    const result = await db.query(`SELECT g.id,g.name,g.description,g.cover_url,g.creator_id,g.privacy,g.category,g.require_approval,g.created_at,u.full_name creator_name,
      (SELECT COUNT(*)::int FROM group_members gm WHERE gm.group_id=g.id) member_count,
      EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1) is_member,
      (SELECT role FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1) member_role,
      EXISTS(SELECT 1 FROM group_join_requests r WHERE r.group_id=g.id AND r.user_id=$1 AND r.status='pending') request_pending
      FROM groups g JOIN users u ON u.id=g.creator_id
      WHERE g.privacy='public' OR g.creator_id=$1 OR EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id=g.id AND gm.user_id=$1) ORDER BY g.created_at DESC`, [req.user.id]);
    res.json({ groups: result.rows });
  } catch (error) { console.error('Groups list error:', error.message); res.status(500).json({ error: 'Não foi possível carregar os grupos.' }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    await ensureFeatures();
    const group = (await db.query('SELECT g.*,u.full_name creator_name FROM groups g JOIN users u ON u.id=g.creator_id WHERE g.id=$1', [req.params.id])).rows[0];
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    const current = await member(group.id, req.user.id);
    if (group.privacy === 'private' && !current && group.creator_id !== req.user.id) return res.status(403).json({ error: 'Este grupo é privado. Peça para entrar.', group: { id:group.id,name:group.name,description:group.description,privacy:group.privacy } });
    const members = await db.query(`SELECT gm.role,u.id,u.full_name,u.avatar_url FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 ORDER BY CASE gm.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END,gm.joined_at`, [group.id]);
    const posts = await db.query('SELECT gp.*,u.full_name author_name,u.avatar_url author_avatar FROM group_posts gp JOIN users u ON u.id=gp.author_id WHERE gp.group_id=$1 ORDER BY gp.created_at DESC LIMIT 50', [group.id]);
    const pending = current && ['admin','moderator'].includes(current.role) ? await db.query("SELECT r.user_id,r.message,r.created_at,u.full_name,u.avatar_url FROM group_join_requests r JOIN users u ON u.id=r.user_id WHERE r.group_id=$1 AND r.status='pending' ORDER BY r.created_at", [group.id]) : { rows:[] };
    res.json({ group, members:members.rows, posts:posts.rows, my_role:current?.role || null, pending_requests:pending.rows });
  } catch { res.status(500).json({ error: 'Não foi possível abrir este grupo.' }); }
});

router.post('/', authenticate, upload.single('cover'), async (req, res) => {
  try {
    await ensureFeatures();
    const { name, description, privacy='public', require_approval=false, rules='', category='' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'O nome do grupo é obrigatório.' });
    if (!['public','private'].includes(privacy)) return res.status(400).json({ error: 'Privacidade inválida.' });
    const coverUrl = req.file ? (await uploadToCloud(req.file.buffer, 'sigo-com-fe/groups')).secure_url : null;
    const group = (await db.query('INSERT INTO groups (name,description,cover_url,creator_id,privacy,require_approval,rules,category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [name.trim(),description||null,coverUrl,req.user.id,privacy,Boolean(require_approval),rules||null,category||null])).rows[0];
    await db.query("INSERT INTO group_members (group_id,user_id,role) VALUES ($1,$2,'admin')", [group.id,req.user.id]);
    res.status(201).json({ group:{...group,is_member:true,member_role:'admin',member_count:1} });
  } catch { res.status(500).json({ error: 'Não foi possível criar o grupo.' }); }
});

router.post('/:id/join', authenticate, async (req, res) => {
  try {
    await ensureFeatures();
    const group = (await db.query('SELECT id,privacy,require_approval FROM groups WHERE id=$1',[req.params.id])).rows[0];
    if (!group) return res.status(404).json({ error:'Grupo não encontrado.' });
    if (await member(group.id,req.user.id)) return res.json({ success:true, joined:true });
    if (group.privacy === 'private' || group.require_approval) {
      await db.query("INSERT INTO group_join_requests (group_id,user_id,message,status) VALUES ($1,$2,$3,'pending') ON CONFLICT (group_id,user_id) DO UPDATE SET message=EXCLUDED.message,status='pending',created_at=NOW()", [group.id,req.user.id,String(req.body?.message||'').slice(0,500)]);
      return res.status(202).json({ success:true, requested:true });
    }
    await db.query('INSERT INTO group_members (group_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[group.id,req.user.id]);
    res.json({ success:true, joined:true });
  } catch { res.status(500).json({ error:'Não foi possível entrar no grupo.' }); }
});

router.post('/:id/requests/:userId', authenticate, async (req,res) => {
  try {
    if (!await manager(req,res)) return;
    const approve = req.body?.action === 'approve';
    if (approve) await db.query('INSERT INTO group_members (group_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[req.params.id,req.params.userId]);
    await db.query('UPDATE group_join_requests SET status=$1 WHERE group_id=$2 AND user_id=$3',[approve?'approved':'declined',req.params.id,req.params.userId]);
    res.json({ success:true });
  } catch { res.status(500).json({ error:'Não foi possível atualizar o pedido.' }); }
});

router.patch('/:id/settings', authenticate, async (req,res) => {
  try {
    if (!await manager(req,res)) return;
    const { description,privacy,require_approval,rules,category } = req.body || {};
    if (privacy && !['public','private'].includes(privacy)) return res.status(400).json({ error:'Privacidade inválida.' });
    const group = (await db.query('UPDATE groups SET description=COALESCE($1,description),privacy=COALESCE($2,privacy),require_approval=COALESCE($3,require_approval),rules=COALESCE($4,rules),category=COALESCE($5,category),updated_at=NOW() WHERE id=$6 RETURNING *',[description,privacy,typeof require_approval==='boolean'?require_approval:null,rules,category,req.params.id])).rows[0];
    res.json({ group });
  } catch { res.status(500).json({ error:'Não foi possível guardar as configurações.' }); }
});

router.post('/:id/leave', authenticate, async (req,res) => {
  try {
    const group = (await db.query('SELECT creator_id FROM groups WHERE id=$1',[req.params.id])).rows[0];
    if (group?.creator_id === req.user.id) return res.status(400).json({ error:'O criador não pode sair do grupo.' });
    await db.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2',[req.params.id,req.user.id]); res.json({ success:true });
  } catch { res.status(500).json({ error:'Não foi possível sair do grupo.' }); }
});

router.post('/:id/posts', authenticate, upload.single('media'), async (req,res) => {
  try {
    if (!await member(req.params.id,req.user.id)) return res.status(403).json({ error:'Entre no grupo para publicar.' });
    if (!req.body.content?.trim() && !req.file) return res.status(400).json({ error:'Escreva uma publicação ou escolha uma foto ou vídeo.' });
    const mediaUrl = req.file ? (await uploadToCloud(req.file.buffer,'sigo-com-fe/group-posts')).secure_url : null;
    const post = (await db.query('INSERT INTO group_posts (group_id,author_id,content,media_url) VALUES ($1,$2,$3,$4) RETURNING *',[req.params.id,req.user.id,String(req.body.content || '').trim(),mediaUrl])).rows[0]; res.status(201).json({ post });
  } catch { res.status(500).json({ error:'Não foi possível publicar.' }); }
});

router.get('/:id/tools', authenticate, async (req, res) => {
  try {
    if (!await member(req.params.id, req.user.id)) return res.status(403).json({ error: 'Entre no grupo para usar as ferramentas.' });
    const prayers = await db.query(`SELECT p.*, u.full_name author_name FROM group_prayers p JOIN users u ON u.id=p.author_id WHERE p.group_id=$1 ORDER BY p.created_at DESC LIMIT 30`, [req.params.id]);
    const events = await db.query(`SELECT * FROM group_events WHERE group_id=$1 AND starts_at >= NOW() - INTERVAL '1 day' ORDER BY starts_at ASC LIMIT 30`, [req.params.id]);
    res.json({ prayers: prayers.rows, events: events.rows });
  } catch (error) { console.error('Group tools error:', error.message); res.status(500).json({ error: 'Não foi possível carregar as ferramentas do grupo.' }); }
});

router.post('/:id/prayers', authenticate, async (req, res) => {
  try {
    if (!await member(req.params.id, req.user.id)) return res.status(403).json({ error: 'Entre no grupo para partilhar um pedido.' });
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Escreva o seu pedido de oração.' });
    const prayer = (await db.query('INSERT INTO group_prayers (group_id,author_id,content) VALUES ($1,$2,$3) RETURNING *', [req.params.id, req.user.id, content])).rows[0];
    res.status(201).json({ prayer });
  } catch { res.status(500).json({ error: 'Não foi possível enviar o pedido.' }); }
});

router.post('/:id/events', authenticate, async (req, res) => {
  try {
    if (!await manager(req, res)) return;
    const title = String(req.body?.title || '').trim();
    const startsAt = req.body?.starts_at;
    if (!title || !startsAt || Number.isNaN(Date.parse(startsAt))) return res.status(400).json({ error: 'Informe o título e a data do evento.' });
    const event = (await db.query('INSERT INTO group_events (group_id,creator_id,title,description,starts_at) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.params.id, req.user.id, title, String(req.body?.description || '').trim() || null, startsAt])).rows[0];
    res.status(201).json({ event });
  } catch { res.status(500).json({ error: 'Não foi possível criar o evento.' }); }
});

router.delete('/:id', authenticate, async (req,res) => {
  try { const group=(await db.query('SELECT creator_id FROM groups WHERE id=$1',[req.params.id])).rows[0]; if (!group || group.creator_id!==req.user.id) return res.status(403).json({error:'Apenas o criador pode apagar o grupo.'}); await db.query('DELETE FROM groups WHERE id=$1',[req.params.id]); res.json({success:true}); }
  catch { res.status(500).json({error:'Não foi possível apagar o grupo.'}); }
});

module.exports = router;
