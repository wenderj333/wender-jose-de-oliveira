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

// GET /api/photos/:userId - listar fotos de um utilizador
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.headers.authorization ? (await db.query("SELECT id FROM users WHERE id = $1", [userId])).rows[0]?.id : null;
    const result = await db.query(
      "SELECT * FROM photos WHERE user_id = $1 AND (visibility = $2 OR user_id = $3) ORDER BY created_at DESC",
      [userId, "public", viewerId || "00000000-0000-0000-0000-000000000000"]
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
    const { url, caption, visibility } = req.body;
    const userId = req.user.id;
    const result = await db.query(
      "INSERT INTO photos (user_id, url, caption, visibility) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, url, caption || "", visibility || "public"]
    );
    res.json({ photo: result.rows[0] });
  } catch (err) {
    console.error(err);
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
