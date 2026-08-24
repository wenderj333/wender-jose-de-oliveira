const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const pool = db;
const DAILY_QUESTIONS = require('../../../frontend/src/data/perguntas.json');

const ensureDailyChallengeTable = () => pool.query(`CREATE TABLE IF NOT EXISTS daily_challenge_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  question_index INTEGER NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
)`);

function challengeDate() {
  return new Date().toISOString().slice(0, 10);
}

function dailyQuestion(date) {
  const epochDay = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const questionIndex = Math.abs(epochDay) % DAILY_QUESTIONS.length;
  return { questionIndex, question: DAILY_QUESTIONS[questionIndex] };
}

function publicQuestion(question, language) {
  const lang = ['pt', 'es', 'en', 'de', 'fr', 'ro', 'ru'].includes(language) ? language : 'pt';
  return {
    livro: question.livro,
    nivel: question.nivel,
    question: lang === 'pt' ? question.q : (question[`${lang}_q`] || question.q),
    options: lang === 'pt' ? question.opts : (question[`${lang}_opts`] || question.opts)
  };
}

async function dailyStreak(userId) {
  const result = await pool.query(`SELECT challenge_date FROM daily_challenge_results
    WHERE user_id = $1 AND correct = true ORDER BY challenge_date DESC`, [userId]);
  const completed = new Set(result.rows.map(row => String(row.challenge_date).slice(0, 10)));
  let date = new Date(`${challengeDate()}T00:00:00Z`);
  let streak = 0;
  while (completed.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return streak;
}

// Criar tabela se nao existir
db.query('CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50), tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())').then(()=>console.log('quiz_resultados OK')).catch(e=>console.log('Erro quiz_resultados:', e.message));

// Rota para criar tabela manualmente
router.get('/setup', async (req, res) => {
  try {
    await db.query('CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50), tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())');
    res.json({ ok: true, msg: 'Tabela criada!' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
const { authenticate: auth } = require('../middleware/auth');

// Desafio Diário de Fé: uma pergunta igual para toda a comunidade em cada dia.
router.get('/daily', auth, async (req, res) => {
  try {
    await ensureDailyChallengeTable();
    const date = challengeDate();
    const { questionIndex, question } = dailyQuestion(date);
    const language = String(req.query.lang || 'pt').slice(0, 2);
    const result = await pool.query('SELECT correct, completed_at FROM daily_challenge_results WHERE user_id = $1 AND challenge_date = $2', [req.user.id, date]);
    const answer = result.rows[0];
    const streak = await dailyStreak(req.user.id);
    res.json({ date, questionIndex, question: publicQuestion(question, language), completed: Boolean(answer), correct: answer?.correct || false, completedAt: answer?.completed_at || null, streak });
  } catch (err) {
    console.error('Daily challenge read error:', err.message);
    res.status(500).json({ error: 'Não foi possível carregar o desafio de hoje.' });
  }
});

router.post('/daily/answer', auth, async (req, res) => {
  try {
    await ensureDailyChallengeTable();
    const selectedOption = Number(req.body?.selectedOption);
    if (!Number.isInteger(selectedOption)) return res.status(400).json({ error: 'Resposta inválida.' });
    const date = challengeDate();
    const { questionIndex, question } = dailyQuestion(date);
    const correct = selectedOption === question.r;
    const inserted = await pool.query(`INSERT INTO daily_challenge_results (user_id, challenge_date, question_index, correct)
      VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, challenge_date) DO NOTHING RETURNING correct`, [req.user.id, date, questionIndex, correct]);
    const storedCorrect = inserted.rows[0]?.correct;
    const alreadyCompleted = !inserted.rowCount;
    const streak = await dailyStreak(req.user.id);
    res.json({ correct: alreadyCompleted ? null : storedCorrect, alreadyCompleted, streak, nextChallengeAt: `${date}T23:59:59.999Z` });
  } catch (err) {
    console.error('Daily challenge answer error:', err.message);
    res.status(500).json({ error: 'Não foi possível guardar a resposta.' });
  }
});

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
