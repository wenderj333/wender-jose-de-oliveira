
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const auth = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token || token !== process.env.OPENCLAW_API_TOKEN) return res.status(403).json({ error: "Token invalido" });
  next();
};

const verses = [
  { text: "O Senhor e meu pastor e nada me faltara.", reference: "Salmos 23:1" },
  { text: "Posso tudo naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "Deus amou o mundo e deu seu Filho unigenito.", reference: "Joao 3:16" },
  { text: "Confie no Senhor de todo o seu coracao.", reference: "Proverbios 3:5" },
  { text: "Sede fortes e corajosos. Nao temais.", reference: "Josue 1:9" }
];

router.get("/bible-verse/random", auth, (req, res) => {
  res.json(verses[Math.floor(Math.random() * verses.length)]);
});

router.get("/users/all-ids", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT id FROM users");
    res.json(r.rows.map(x => x.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/users/:userId/send-message", auth, async (req, res) => {
  try {
    await pool.query("INSERT INTO notifications (user_id, content, created_at) VALUES ($1, $2, NOW())", [req.params.userId, req.body.message]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/users/new", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT id, email, created_at FROM users WHERE created_at >= $1", [req.query.since || new Date(Date.now() - 86400000).toISOString()]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/users/inactive", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT id, email FROM users WHERE last_login_at < NOW() - INTERVAL '3 days' OR last_login_at IS NULL");
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/stats/new-users", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT COUNT(*) AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'");
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/stats/posts", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT COUNT(*) AS count FROM posts WHERE created_at >= NOW() - INTERVAL '7 days'");
    res.json({ count: parseInt(r.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/stats/most-viewed", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT id, content FROM posts ORDER BY created_at DESC LIMIT 5");
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/posts/schedule", auth, async (req, res) => {
  try {
    const { userId, content, scheduledAt } = req.body;
    await pool.query("INSERT INTO posts (user_id, content, scheduled_at, created_at) VALUES ($1, $2, $3, NOW())", [userId, content, scheduledAt]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;