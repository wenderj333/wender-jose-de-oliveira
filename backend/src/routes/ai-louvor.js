const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { Pool } = require('pg');
const Replicate = require('replicate');

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
        audio_url TEXT,
        is_ai BOOLEAN DEFAULT TRUE,
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
    console.log('AI Louvor tables ready');
  } catch (err) {
    console.error('AI Louvor table creation error:', err.message);
  } finally {
    await pool.end();
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
<<<<<<< HEAD
const SUNO_API_KEY = process.env.SUNO_API_KEY;
// Use 1.5-flash for higher rate limits on free tier
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/google/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

=======
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
const FREE_CREDITS = 4;
const PACK_CREDITS = 250;

const userRequests = new Map();
function checkRateLimit(userId) {
  const now = Date.now();
  const reqs = (userRequests.get(userId) || []).filter(t => t > now - 3600000);
  if (reqs.length >= 10) return false;
  reqs.push(now);
  userRequests.set(userId, reqs);
  return true;
}

router.get('/credits', authenticate, async (req, res) => {
  try {
    await ensureTables();
    const row = await db.prepare('SELECT credits_remaining, total_generated FROM song_credits WHERE user_id = ?').get(req.user.id);
    if (!row) {
      await db.prepare('INSERT INTO song_credits (user_id, credits_remaining, total_generated) VALUES (?, ?, 0)').run(req.user.id, FREE_CREDITS);
      return res.json({ credits: FREE_CREDITS, totalGenerated: 0, isFree: true });
    }
    res.json({ credits: row.credits_remaining, totalGenerated: row.total_generated, isFree: row.credits_remaining <= FREE_CREDITS });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});router.post('/generate', authenticate, async (req, res) => {
  try {
    await ensureTables();
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API de IA nao configurada.' });
    if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Muitas requisicoes. Aguarde.' });
    let creditRow = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);
    if (!creditRow) {
      await db.prepare('INSERT INTO song_credits (user_id, credits_remaining, total_generated) VALUES (?, ?, 0)').run(req.user.id, FREE_CREDITS);
      creditRow = { credits_remaining: FREE_CREDITS };
    }
    if (creditRow.credits_remaining <= 0) {
      return res.status(403).json({ error: 'no_credits' });
    }
    const { theme, style, emotion, bibleBook, verse, language } = req.body;
    if (!theme && !verse) return res.status(400).json({ error: 'Escolha um tema ou versículo' });
    const lang = language || 'pt';
    const langNames = { pt: 'Portugues', es: 'Espanol', en: 'English', de: 'Deutsch', fr: 'Francais' };
    const langName = langNames[lang] || 'Portugues';
    const prompt = `Voce e um compositor cristao profissional. Crie uma letra de louvor completa em ${langName}. Tema: ${theme || ''}. Estilo: ${style || 'worship'}. Emocao: ${emotion || 'inspiradora'}. ${bibleBook ? 'Livro: ' + bibleBook : ''} ${verse ? 'Versiculo: ' + verse : ''}\n\nFormato:\nTITULO: [titulo]\n\n[Verso 1]\n...\n[Coro]\n...\n[Verso 2]\n...\n[Ponte]\n...\n[Coro Final]\n...`;
    let lastError = '';
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 2000));
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 1000 },
          }),
        });
        if (response.status !== 429) break;
      } catch (e) { lastError = e.message; break; }
    }
    let lyrics = null;
    if (response && response.ok) {
      const data = await response.json();
      lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (response) {
      lastError = 'gemini: ' + response.status;
    }
    if (!lyrics) return res.status(500).json({ error: 'A IA esta ocupada. Espere 30 segundos e tente de novo. (' + lastError + ')' });
    const titleMatch = lyrics.match(/TITULO:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Louvor - ' + (theme || verse || 'Novo');
    const song = await db.prepare('INSERT INTO ai_songs (author_id, title, lyrics, theme, style, emotion, bible_book, verse_reference, language, is_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *').get(req.user.id, title, lyrics, theme || null, style || null, emotion || null, bibleBook || null, verse || null, lang, true);
    if (song) {
      await db.prepare('UPDATE song_credits SET credits_remaining = credits_remaining - 1, total_generated = total_generated + 1 WHERE user_id = ?').run(req.user.id);
    }
    const updatedCredits = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);
    res.json({ song, lyrics, title, creditsRemaining: updatedCredits ? updatedCredits.credits_remaining : 0 });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Erro interno ao gerar musica' });
  }
});

router.post('/generate-audio', authenticate, async (req, res) => {
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'API da Replicate nao configurada.' });
    const { lyrics, songId, style } = req.body;
    if (!lyrics) return res.status(400).json({ error: 'A letra e necessaria.' });
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    const prompt = (style || 'worship, uplifting, gospel') + ', christian music, inspirational';
    const output = await replicate.run(
      'meta/musicgen:671ac645ce5e552cc0f9b6dc90d7ce29b2b1cc9e9ae58d3ae7c7e944d6d89d57',
      { input: { prompt: prompt, model_version: 'stereo-large', duration: 30, output_format: 'mp3' } }
    );
    let audioUrl = Array.isArray(output) ? output[0] : output;
    if (!audioUrl) return res.status(500).json({ error: 'A IA nao conseguiu gerar a musica.' });
    if (songId) {
      await db.prepare('UPDATE ai_songs SET audio_url = ? WHERE id = ? AND author_id = ?').run(audioUrl, songId, req.user.id);
    }
    res.json({ audioUrl });
  } catch (err) {
    console.error('Erro ao gerar audio:', err);
    res.status(500).json({ error: 'Erro interno ao gerar a musica.' });
  }
});

router.post('/save-custom', authenticate, async (req, res) => {
  try {
    await ensureTables();
    const { title, lyrics, theme, style, emotion, bibleBook, verse, language } = req.body;
    if (!title || !lyrics) return res.status(400).json({ error: 'Titulo e letra sao obrigatorios.' });
    const lang = language || 'pt';
    const song = await db.prepare('INSERT INTO ai_songs (author_id, title, lyrics, theme, style, emotion, bible_book, verse_reference, language, is_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *').get(req.user.id, title, lyrics, theme || null, style || null, emotion || null, bibleBook || null, verse || null, lang, false);
    res.json({ success: true, song });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao salvar sua letra.' });
  }
});

router.get('/my-songs', authenticate, async (req, res) => {
  try {
    const songs = await db.prepare('SELECT * FROM ai_songs WHERE author_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/song/:id', authenticate, async (req, res) => {
  try {
    const song = await db.prepare('SELECT * FROM ai_songs WHERE id = ? AND author_id = ?').get(req.params.id, req.user.id);
    if (!song) return res.status(404).json({ error: 'Musica nao encontrada' });
    res.json({ song });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/song/:id', authenticate, async (req, res) => {
  try {
    await db.prepare('DELETE FROM ai_songs WHERE id = ? AND author_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/buy-credits', authenticate, async (req, res) => {
  try {
    const { paymentConfirmed } = req.body;
    if (!paymentConfirmed) return res.status(400).json({ error: 'Pagamento nao confirmado' });
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

// POST /api/ai-louvor/generate-audio — generate audio from lyrics using Replicate AI (MusicGen)
router.post('/generate-audio', authenticate, async (req, res) => {
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'API da Replicate não configurada. Contacte o administrador.' });
    }

    const { lyrics, songId, title, style } = req.body;
    if (!lyrics) {
      return res.status(400).json({ error: 'A letra é necessária para gerar a música.' });
    }

    // Inicializar o cliente Replicate
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    // Criar o prompt para o MusicGen
    const prompt = `${title ? title + " - " : ""} ${lyrics}. Music style: ${style || 'worship, uplifting'}.`;

    console.log('Iniciando geração de música com Replicate MusicGen para prompt:', prompt);

    let audioUrl = null;
    try {
        const output = await replicate.run(
            "meta/musicgen:b05b1dff1d8c6dc0e6537bf26f01fa4e6c6f675a8a0c647b0a37637de283ba9a",
            {
              input: {
                prompt: prompt,
                model_version: "large", // ou 'medium', 'small', 'melody' se preferir
                duration: 30, // 30 segundos, conforme solicitado
              }
            }
        );
        // O `output` do Replicate MusicGen é o URL do áudio ou um array de URLs
        if (Array.isArray(output) && output.length > 0) {
            audioUrl = output[0];
        } else if (typeof output === 'string') {
            audioUrl = output;
        }

    } catch (replicateError) {
        console.error('Erro ao chamar Replicate MusicGen:', replicateError);
        return res.status(500).json({ error: `Erro ao gerar música com Replicate AI: ${replicateError.message || 'Erro desconhecido.'}` });
    }

    if (!audioUrl) {
      console.error('Replicate MusicGen não retornou URL de áudio.');
      return res.status(500).json({ error: 'A Replicate AI não conseguiu gerar a música. Tente novamente.' });
    }

    // 3. Salvar o URL do áudio no banco de dados
    if (songId) {
      await db.prepare('UPDATE ai_songs SET audio_url = ? WHERE id = ? AND author_id = ?').run(audioUrl, songId, req.user.id);
    } else {
      console.warn('Geração de áudio sem songId. Inserir nova entrada ou requerer songId.');
    }

    res.json({ audioUrl });

  } catch (err) {
    console.error('Erro geral ao gerar áudio com Replicate AI:', err);
    res.status(500).json({ error: 'Erro interno ao gerar a música com Replicate AI.' });
  }
});

// POST /api/ai-louvor/save-custom — save custom lyrics
router.post('/save-custom', authenticate, async (req, res) => {
  try {
    await ensureTables();
    const { title, lyrics, theme, style, emotion, bibleBook, verse, language } = req.body;

    if (!title || !lyrics) {
      return res.status(400).json({ error: 'Título e letra são obrigatórios.' });
    }

    const lang = language || 'pt';

    // Save custom song to DB with is_ai: false
    const song = await db.prepare(
      `INSERT INTO ai_songs (author_id, title, lyrics, theme, style, emotion, bible_book, verse_reference, language, is_ai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(
      req.user.id,
      title,
      lyrics,
      theme || null,
      style || null,
      emotion || null,
      bibleBook || null,
      verse || null,
      lang,
      false // Explicitly mark as not AI-generated
    );

    res.json({ success: true, song });

  } catch (err) {
    console.error('Erro ao salvar letra personalizada:', err);
    res.status(500).json({ error: 'Erro interno ao salvar sua letra.' });
  }
});

module.exports = router;
