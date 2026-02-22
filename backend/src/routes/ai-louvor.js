const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { Pool } = require('pg');

// Direct pool for table creation (bypass wrapper)
let tablesReady = false;
async function ensureTables() {
  if (tablesReady) return;
  if (!process.env.DATABASE_URL) return;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_songs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        lyrics TEXT NOT NULL,
        theme VARCHAR(100),
        style VARCHAR(50),
        emotion VARCHAR(50),
        bible_book VARCHAR(100),
        verse_reference TEXT,
        language VARCHAR(5) DEFAULT 'pt',
        is_public BOOLEAN DEFAULT false,
        like_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS song_credits (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        credits_remaining INT DEFAULT 4,
        total_generated INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    tablesReady = true;
    console.log('✅ AI Louvor tables ready');
  } catch (err) {
    console.error('AI Louvor table creation error:', err.message);
  } finally {
    await pool.end();
  }
}

// Use 2.5-flash - modelo mais recente e disponível
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const FREE_CREDITS = 4;
const PACK_CREDITS = 250;
const PACK_PRICE_EUR = 5;

// Rate limiting per user
const userRequests = new Map();
function checkRateLimit(userId) {
  const now = Date.now();
  const reqs = (userRequests.get(userId) || []).filter(t => t > now - 3600000);
  if (reqs.length >= 10) return false; // max 10/hour
  reqs.push(now);
  userRequests.set(userId, reqs);
  return true;
}

// GET /api/ai-louvor/credits — check user credits
router.get('/credits', authenticate, async (req, res) => {
  try {
    await ensureTables();
    const row = await db.prepare(
      'SELECT credits_remaining, total_generated FROM song_credits WHERE user_id = ?'
    ).get(req.user.id);
    if (!row) {
      // First time — give free credits
      await db.prepare(
        'INSERT INTO song_credits (user_id, credits_remaining, total_generated) VALUES (?, ?, 0)'
      ).run(req.user.id, FREE_CREDITS);
      return res.json({ credits: FREE_CREDITS, totalGenerated: 0, isFree: true });
    }
    res.json({ credits: row.credits_remaining, totalGenerated: row.total_generated, isFree: row.credits_remaining <= FREE_CREDITS });
  } catch (err) {
    console.error('Credits error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/ai-louvor/generate — generate worship lyrics
router.post('/generate', authenticate, async (req, res) => {
  try {
    await ensureTables();
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API de IA não configurada. Contacte o administrador.' });
    if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Muitas requisições. Aguarde um pouco.' });

    // Check credits
    let creditRow = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);
    if (!creditRow) {
      await db.prepare('INSERT INTO song_credits (user_id, credits_remaining, total_generated) VALUES (?, ?, 0)').run(req.user.id, FREE_CREDITS);
      creditRow = { credits_remaining: FREE_CREDITS };
    }
    if (creditRow.credits_remaining <= 0) {
      return res.status(403).json({ error: 'no_credits', message: 'Seus créditos acabaram! Adquira o pacote de 250 músicas por €5.' });
    }

    const { theme, style, emotion, bibleBook, verse, language } = req.body;
    if (!theme && !verse) return res.status(400).json({ error: 'Escolha um tema ou versículo' });

    const lang = language || 'pt';
    const langNames = { pt: 'Português', es: 'Español', en: 'English', de: 'Deutsch', fr: 'Français' };
    const langName = langNames[lang] || 'Português';

    const prompt = `Você é um compositor cristão profissional especializado em música gospel e louvor.
Crie uma letra de louvor/música cristã completa em ${langName} com as seguintes características:

${theme ? `🎯 Tema: ${theme}` : ''}
${style ? `🎵 Estilo musical: ${style}` : '🎵 Estilo: worship contemporâneo'}
${emotion ? `💫 Emoção/tom: ${emotion}` : '💫 Emoção: inspiradora'}
${bibleBook ? `📖 Baseado no livro: ${bibleBook}` : ''}
${verse ? `📜 Versículo base: ${verse}` : ''}

REGRAS IMPORTANTES:
1. A letra DEVE ter: Intro (opcional), 2-3 Versos, Pré-Coro, Coro (refrão forte e memorável), Ponte, Final
2. Marque cada seção claramente: [Verso 1], [Pré-Coro], [Coro], [Verso 2], [Ponte], etc.
3. Use linguagem poética mas acessível
4. Inclua referências bíblicas naturalmente na letra
5. O coro deve ser repetível e fácil de cantar em congregação
6. Sugira um TÍTULO criativo para a música
7. No final, sugira: Tom recomendado (ex: G, C, D), BPM aproximado, e instrumentos ideais

Formato de resposta:
🎵 TÍTULO: [título da música]
📖 Inspiração: [versículo ou tema base]

[Verso 1]
...

[Pré-Coro]
...

[Coro]
...

[Verso 2]
...

[Ponte]
...

[Coro Final]
...

---
🎸 Tom: [tom]
🥁 BPM: [bpm]
🎹 Instrumentos: [lista]
💡 Dica de interpretação: [dica]`;

    // Try each model with retry and exponential backoff
    let lyrics = null;
    let lastError = '';
    // Retry with exponential backoff on 429
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 2000)); // Exponential backoff
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 1000 },
          }),
        });
        if (response.status !== 429) break;
        console.log(`Gemini 429 rate limit, retry ${attempt + 1}/3...`);
      } catch (e) {
        lastError = e.message;
        console.error('Gemini API error:', e.message);
        break; // Stop retrying on other errors
      }
    }

    if (response && response.ok) {
      const data = await response.json();
      lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (response) {
      lastError = `gemini-2.0-flash: ${response.status}`;
    }

    if (!lyrics) {
      return res.status(500).json({ error: `A IA está ocupada agora (${lastError}). Espere 30 segundos e tente de novo.` });
    }
    if (!lyrics) return res.status(500).json({ error: 'A IA não gerou uma resposta válida. Tente novamente.' });

    // Extract title from lyrics
    const titleMatch = lyrics.match(/TÍTULO:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Louvor - ${theme || verse || 'Novo'}`;

    // Save song to DB
    const song = await db.prepare(
      `INSERT INTO ai_songs (author_id, title, lyrics, theme, style, emotion, bible_book, verse_reference, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(req.user.id, title, lyrics, theme || null, style || null, emotion || null, bibleBook || null, verse || null, lang);

    // Deduct credit ONLY IF song was successfully saved
    if (song) {
      await db.prepare(
        'UPDATE song_credits SET credits_remaining = credits_remaining - 1, total_generated = total_generated + 1 WHERE user_id = ?'
      ).run(req.user.id);
    }
    const updatedCredits = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);

    res.json({
      song,
      lyrics,
      title,
      creditsRemaining: updatedCredits?.credits_remaining || 0,
    });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Erro interno ao gerar música' });
  }
});

// GET /api/ai-louvor/my-songs — list user's generated songs
router.get('/my-songs', authenticate, async (req, res) => {
  try {
    const songs = await db.prepare(
      'SELECT * FROM ai_songs WHERE author_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.id);
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/ai-louvor/song/:id — get single song
router.get('/song/:id', authenticate, async (req, res) => {
  try {
    const song = await db.prepare('SELECT * FROM ai_songs WHERE id = ? AND author_id = ?').get(req.params.id, req.user.id);
    if (!song) return res.status(404).json({ error: 'Música não encontrada' });
    res.json({ song });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/ai-louvor/song/:id — delete own song
router.delete('/song/:id', authenticate, async (req, res) => {
  try {
    await db.prepare('DELETE FROM ai_songs WHERE id = ? AND author_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/ai-louvor/buy-credits — add premium credits (placeholder for Stripe)
router.post('/buy-credits', authenticate, async (req, res) => {
  try {
    // TODO: Integrate with Stripe payment verification
    // For now, this is a placeholder that can be triggered after payment confirmation
    const { paymentConfirmed } = req.body;
    if (!paymentConfirmed) return res.status(400).json({ error: 'Pagamento não confirmado' });

    let creditRow = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);
    if (!creditRow) {
      await db.prepare('INSERT INTO song_credits (user_id, credits_remaining, total_generated) VALUES (?, ?, 0)').run(req.user.id, PACK_CREDITS);
    } else {
      await db.prepare('UPDATE song_credits SET credits_remaining = credits_remaining + ? WHERE user_id = ?').run(PACK_CREDITS, req.user.id);
    }

    const updated = await db.prepare('SELECT credits_remaining, total_generated FROM song_credits WHERE user_id = ?').get(req.user.id);
    res.json({ success: true, credits: updated.credits_remaining, totalGenerated: updated.total_generated });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
