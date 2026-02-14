const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43',
  api_key: process.env.CLOUDINARY_API_KEY || '914835643241235',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7Eu52T0NYAAy2hmXHl0i4C0TgUo',
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function uploadToCloud(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, r) => err ? reject(err) : resolve(r));
    stream.end(buffer);
  });
}

// GET /api/groups — list all groups
router.get('/', async (req, res) => {
  try {
    const groups = await db.prepare(`
      SELECT g.*, u.full_name AS creator_name,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
      FROM groups g JOIN users u ON u.id = g.creator_id
      ORDER BY g.created_at DESC
    `).all();
    res.json({ groups });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/groups/:id — group details + posts
router.get('/:id', async (req, res) => {
  try {
    const group = await db.prepare(`
      SELECT g.*, u.full_name AS creator_name FROM groups g JOIN users u ON u.id = g.creator_id WHERE g.id = ?
    `).get(req.params.id);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });

    const members = await db.prepare(`
      SELECT gm.role, u.id, u.full_name, u.avatar_url FROM group_members gm
      JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ? ORDER BY gm.joined_at
    `).all(req.params.id);

    const posts = await db.prepare(`
      SELECT gp.*, u.full_name AS author_name, u.avatar_url AS author_avatar
      FROM group_posts gp JOIN users u ON u.id = gp.author_id
      WHERE gp.group_id = ? ORDER BY gp.created_at DESC LIMIT 50
    `).all(req.params.id);

    res.json({ group, members, posts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups — create group
router.post('/', authenticate, upload.single('cover'), async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });

    let coverUrl = null;
    if (req.file) {
      const r = await uploadToCloud(req.file.buffer, 'sigo-com-fe/groups');
      coverUrl = r.secure_url;
    }

    const group = await db.prepare(`
      INSERT INTO groups (name, description, cover_url, creator_id, privacy)
      VALUES (?, ?, ?, ?, ?) RETURNING *
    `).get(name.trim(), description || null, coverUrl, req.user.id, privacy || 'public');

    // Creator joins as admin
    await db.prepare('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)')
      .run(group.id, req.user.id, 'admin');

    res.status(201).json({ group });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/join — join a group
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    await db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING')
      .run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/leave — leave a group
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    await db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/posts — create post in group
router.post('/:id/posts', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Conteúdo obrigatório' });

    let mediaUrl = null;
    if (req.file) {
      const rType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const r = await uploadToCloud(req.file.buffer, 'sigo-com-fe/group-posts');
      mediaUrl = r.secure_url;
    }

    const post = await db.prepare(`
      INSERT INTO group_posts (group_id, author_id, content, media_url)
      VALUES (?, ?, ?, ?) RETURNING *
    `).get(req.params.id, req.user.id, content.trim(), mediaUrl);

    res.status(201).json({ post });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/groups/:id — delete group (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const member = await db.prepare('SELECT role FROM group_members WHERE group_id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Apenas admin pode excluir' });
    await db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
