const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const pool = db;

// Criar tabela se nao existir
db.query('CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50), tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())').then(()=>console.log('quiz_resultados OK')).catch(e=>console.log('Erro quiz_resultados:', e.message));

// Rota para criar tabela manualmente
router.get('/setup', async (req, res) => {
  try {
    await db.query(CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50) DEFAULT 'Todos', tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW()));
    res.json({ ok: true, msg: 'Tabela criada!' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
const { authenticate: auth } = require('../middleware/auth');

// Guardar resultado do jogo
router.post('/resultado', auth, async (req, res) => {
  try {
    const { pontos, perguntas_corretas, perguntas_total, livro, tempo_medio } = req.body;
    const user_id = req.user.id;
    await pool.query(
      'INSERT INTO quiz_resultados (user_id, pontos, perguntas_corretas, perguntas_total, livro, tempo_medio) VALUES ($1,$2,$3,$4,$5,$6)',
      [user_id, pontos, perguntas_corretas || 5, perguntas_total || 5, livro || 'Todos', tempo_medio || 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ranking top 10
router.get('/ranking', async (req, res) => {
  try {
    const { periodo } = req.query;
    let filtro = '';
    if (periodo === 'hoje') filtro = "WHERE criado_em >= NOW() - INTERVAL '1 day'";
    else if (periodo === 'semana') filtro = "WHERE criado_em >= NOW() - INTERVAL '7 days'";
    else if (periodo === 'mes') filtro = "WHERE criado_em >= NOW() - INTERVAL '30 days'";

    const result = await pool.query(`
      SELECT u.id, u.full_name, u.avatar_url,
        SUM(r.pontos) as total_pontos,
        COUNT(r.id) as partidas,
        ROUND(AVG(r.tempo_medio)::numeric, 1) as tempo_medio,
        SUM(r.pontos) as score
      FROM quiz_resultados r
      JOIN users u ON r.user_id = u.id
      ${filtro}
      GROUP BY u.id, u.full_name, u.avatar_url
      HAVING COUNT(r.id) >= 1
      ORDER BY score DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT COUNT(id) as partidas, SUM(pontos) as total_pontos,
        ROUND(AVG(tempo_medio)::numeric, 1) as tempo_medio,
        ROUND(AVG(perguntas_corretas::float / perguntas_total * 100)::numeric, 1) as precisao,
        MAX(pontos) as melhor_pontuacao
      FROM quiz_resultados WHERE user_id = $1`,
      [userId]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
// force redeploy 04/24/2026 10:24:01
