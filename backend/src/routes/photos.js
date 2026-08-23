const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { authenticate } = require("../middleware/auth");

// Criar tabela se nao existir
db.query(`CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(e => console.error("Error creating photos table:", e));
db.query("ALTER TABLE photos ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) NOT NULL DEFAULT 'image'")
  .catch(e => console.error("Error adding photos.media_type:", e));

// GET /api/photos/:userId - listar fotos de um utilizador
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user.id;
    const result = await db.query(
      `SELECT * FROM photos p
       WHERE p.user_id = $1 AND (
         p.visibility = 'public' OR p.user_id = $2 OR
         (p.visibility = 'friends' AND EXISTS (
           SELECT 1 FROM friendships f
           WHERE f.status = 'accepted' AND ((f.requester_id = $1 AND f.addressee_id = $2) OR (f.requester_id = $2 AND f.addressee_id = $1))
         ))
       ) ORDER BY p.created_at DESC`,
      [userId, viewerId]
    );
    res.json({ photos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/photos - adicionar foto
router.post("/", authenticate, async (req, res) => {
  try {
    const { url, caption, visibility, media_type } = req.body;
    const userId = req.user.id;
    if (!url || typeof url !== 'string' || !/^https:\/\//.test(url)) {
      return res.status(400).json({ error: "Endereço do ficheiro inválido" });
    }
    const safeVisibility = ['public', 'friends', 'private'].includes(visibility) ? visibility : 'public';
    const safeMediaType = media_type === 'video' ? 'video' : 'image';
    const result = await db.query(
      "INSERT INTO photos (user_id, url, caption, visibility, media_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, url, caption || "", safeVisibility, safeMediaType]
    );
    res.json({ photo: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/photos/:photoId - editar legenda ou privacidade de um ficheiro próprio
router.patch("/:photoId", authenticate, async (req, res) => {
  try {
    const { caption, visibility } = req.body;
    const safeVisibility = ['public', 'friends', 'private'].includes(visibility) ? visibility : null;
    const result = await db.query(
      `UPDATE photos
       SET caption = COALESCE($1, caption), visibility = COALESCE($2, visibility)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [typeof caption === 'string' ? caption.trim().slice(0, 500) : null, safeVisibility, req.params.photoId, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Ficheiro não encontrado" });
    res.json({ photo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/photos/:photoId - apagar foto
router.delete("/:photoId", authenticate, async (req, res) => {
  try {
    const { photoId } = req.params;
    await db.query("DELETE FROM photos WHERE id = $1 AND user_id = $2", [photoId, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
