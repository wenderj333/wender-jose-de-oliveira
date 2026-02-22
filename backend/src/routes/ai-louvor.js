const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { Pool } = require('pg');

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
      await db.
