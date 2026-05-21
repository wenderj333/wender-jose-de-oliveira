const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME||'degxiuf43', api_key: process.env.CLOUDINARY_API_KEY||'914835643241235', api_secret: process.env.CLOUDINARY_API_SECRET||'7Eu52T0NYAAy2hmXHl0i4C0TgUo' });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10*1024*1024 } });
function uploadToCloud(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, r) => err ? reject(err) : resolve(r));
    stream.end(buffer);
  });
}
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT g.*, u.full_name AS creator_name, (SELECT COUNT(*) FROM group_members WHERE group_id=g.id) AS member_count FROM groups g JOIN users u ON u.id=g.creator_id ORDER BY g.created_at DESC');
    res.json({ groups: r.rows });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const g = await db.query('SELECT g.*, u.full_name AS creator_name FROM groups g JOIN users u ON u.id=g.creator_id WHERE g.id=$1', [req.params.id]);
    if (!g.rows[0]) return res.status(404).json({ error: 'Grupo nao encontrado' });
    const members = await db.query('SELECT gm.role, u.id, u.full_name, u.avatar_url FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=$1 ORDER BY gm.joined_at', [req.params.id]);
    const posts = await db.query('SELECT gp.*, u.full_name AS author_name, u.avatar_url AS author_avatar FROM group_posts gp JOIN users u ON u.id=gp.author_id WHERE gp.group_id=$1 ORDER BY gp.created_at DESC LIMIT 50', [req.params.id]);
    res.json({ group: g.rows[0], members: members.rows, posts: posts.rows });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/', authenticate, upload.single('cover'), async (req, res) => {
  try {
    const { name, description, is_private } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nome obrigatorio' });
    let coverUrl = null;
    if (req.file) { const r = await uploadToCloud(req.file.buffer, 'sigo-com-fe/groups'); coverUrl = r.secure_url; }
    const result = await db.query('INSERT INTO groups (name, description, cover_url, creator_id, privacy) VALUES ($1,$2,$3,$4,$5) RETURNING *', [name.trim(), description||null, coverUrl, req.user.id, is_private?'private':'public']);
    const group = result.rows[0];
    await db.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1,$2,$3)', [group.id, req.user.id, 'admin']);
    res.status(201).json({ group });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    await db.query('INSERT INTO group_members (group_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.post('/:id/posts', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Conteudo obrigatorio' });
    let mediaUrl = null;
    if (req.file) { const r = await uploadToCloud(req.file.buffer, 'sigo-com-fe/group-posts'); mediaUrl = r.secure_url; }
    const result = await db.query('INSERT INTO group_posts (group_id, author_id, content, media_url) VALUES ($1,$2,$3,$4) RETURNING *', [req.params.id, req.user.id, content.trim(), mediaUrl]);
    res.status(201).json({ post: result.rows[0] });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const member = await db.query('SELECT role FROM group_members WHERE group_id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!member.rows[0] || member.rows[0].role !== 'admin') return res.status(403).json({ error: 'Apenas admin pode excluir' });
    await db.query('DELETE FROM groups WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
