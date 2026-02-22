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
    console.log('✅ AI Louvor tables ready');
  } catch (err) {
    console.error('AI Louvor table creation error:', err.message);
  } finally {
    await pool.end();
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const FREE_CREDITS = 4;
const PACK_CREDITS = 250;
const PACK_PRICE_EUR = 5;

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
    console.error('Credits error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/generate', authenticate, async (req, res) => {
  try {
    await ensureTables();
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API de IA não configurada. Contacte o administrador.' });
    if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Muitas requisições. Aguarde um pouco.' });

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
Crie uma letra de louvor completa em ${langName}.
Tema: ${theme || ''}, Estilo: ${style || 'worship'}, Emoção: ${emotion || 'inspiradora'}.
${bibleBook ? 'Livro: ' + bibleBook : ''}
${verse ? 'Versículo: ' + verse : ''}

Formato:
TÍTULO: [título]

[Verso 1]
...
[Coro]
...
[Verso 2]
...
[Ponte]
...
[Coro Final]
...

Tom: [tom] | BPM: [bpm]`;

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
      } catch (e) {
        lastError = e.message;
        break;
      }
    }

    let lyrics = null;
    if (response && response.ok) {
      const data = await response.json();
      lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (response) {
      lastError = `gemini-2.5-flash: ${response.status}`;
    }

    if (!lyrics) {
      return res.status(500).json({ error: `A IA está ocupada agora (${lastError}). Espere 30 segundos e tente de novo.` });
    }

    const titleMatch = lyrics.match(/TÍTULO:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Louvor - ${theme || verse || 'Novo'}`;

    const song = await db.prepare(
      `INSERT INTO ai_songs (author_id, title, lyrics, theme, style, emotion, bible_book, verse_reference, language, is_ai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).get(req.user.id, title, lyrics, theme || null, style || null, emotion || null, bibleBook || null, verse || null, lang, true);

    if (song) {
      await db.prepare('UPDATE song_credits SET credits_remaining = credits_remaining - 1, total_generated = total_generated + 1 WHERE user_id = ?').run(req.user.id);
    }
    const updatedCredits = await db.prepare('SELECT credits_remaining FROM song_credits WHERE user_id = ?').get(req.user.id);

    res.json({ song, lyrics, title, creditsRemaining: updatedCredits?.credits_remaining || 0 });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Erro interno ao gerar música' });
  }
});

router.post('/generate-audio', authenticate, async (req, res) => {
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'API da Replicate não configurada.' });
    }

    const { lyrics, songId, title, style } = req.body;
    if (!lyrics) {
      return res.status(400).json({ error: 'A letra é necessária para gerar a música.' });
    }

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    const prompt = `${style || 'worship, uplifting, gospel'}, christian music, inspirational`;

    const output = await replicate.run(
      'meta/musicgen:671ac645ce5e552cc0f9b6dc90d7ce29b2b1cc9e9ae58d3ae7c7e944d6d89d57',
      { input: { prompt, model_version: 'stereo-large', duration: 30, output_format: 'mp3' } }
    );

    let audioUrl = Array.isArray(output) ? output[0] : output;
    if (!audioUrl) {
      return res.status(500).json({ error: 'A IA não conseguiu gerar a música. Tente novamente.' });
    }

    if (songId) {
      await db.prepare('
