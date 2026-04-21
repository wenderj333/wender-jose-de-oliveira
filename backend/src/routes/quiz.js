const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const auth = require('../middleware/auth');

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
        ROUND((SUM(r.pontos) + SUM(100.0 / NULLIF(r.tempo_medio, 0)))::numeric, 1) as score
      FROM quiz_resultados r
      JOIN users u ON r.user_id = u.id
      ${filtro}
      GROUP BY u.id, u.full_name, u.avatar_url
      HAVING COUNT(r.id) >= 3
      ORDER BY score DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
