
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.split(" ")[1];
  const expectedToken = process.env.OPENCLAW_API_TOKEN || "sigocomfe2026";
  
  if (!token) {
    console.warn("❌ OpenClaw: Sem token de autenticação");
    return res.status(401).json({ error: "Token de autenticação não fornecido" });
  }
  
  if (token !== expectedToken) {
    console.warn(`❌ OpenClaw: Token inválido. Recebido: ${token.substring(0, 10)}...`);
    return res.status(403).json({ error: "Token inválido" });
  }
  
  console.log("✅ OpenClaw: Autenticação bem-sucedida");
  next();
};

const verses = [
  { text: "O Senhor e meu pastor e nada me faltara.", reference: "Salmos 23:1" },
  { text: "Posso tudo naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "Deus amou o mundo e deu seu Filho unigenito.", reference: "Joao 3:16" },
  { text: "Confie no Senhor de todo o seu coracao.", reference: "Proverbios 3:5" },
  { text: "Sede fortes e corajosos. Nao temais.", reference: "Josue 1:9" }
];

// Health check (public, sem autenticação)
router.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "openclaw", 
    message: "OpenClaw API online",
    version: "1.0.1",
    endpoints: ["GET /health", "GET /users/new", "GET /bible-verse/random", "POST /users/:userId/send-message"]
  });
});

// Bible verse (com autenticação)
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
    await pool.query("INSERT INTO notifications (user_id, content, created_at) VALUES ($1, $2, NOW())", [req.params.userId, "openclaw", "Mensagem", req.body.message]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/users/new", auth, async (req, res) => {
  try {
    const since = req.query.since;
    
    // Validar parâmetro 'since'
    let sinceDate;
    if (since) {
      sinceDate = new Date(parseInt(since) * 1000); // Converter timestamp em segundos para ms
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({ error: "Parâmetro 'since' inválido. Use timestamp em segundos (unix time)." });
      }
    } else {
      sinceDate = new Date(Date.now() - 86400000); // Últimas 24h por padrão
    }

    console.log(`✅ OpenClaw: Fetching new users since ${sinceDate.toISOString()}`);
    const r = await pool.query(
      "SELECT id, email, full_name, avatar_url, created_at, role FROM users WHERE created_at >= $1 ORDER BY created_at DESC",
      [sinceDate]
    );

    console.log(`📊 OpenClaw: Found ${r.rows.length} new users`);
    res.json({
      success: true,
      count: r.rows.length,
      users: r.rows,
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (err) { 
    console.error("❌ Error in /users/new:", err);
    res.status(500).json({ error: err.message }); 
  }
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

