const express = require('express');
const router = express.Router();
const { generateReply } = require('../services/llmFallback');

// ===== CACHE & RATE LIMITING =====
const responseCache = new Map(); // key -> { reply, timestamp }
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const userRequests = new Map(); // ip -> [timestamps]
const USER_LIMIT = 10; // per hour per user
const GLOBAL_LIMIT = 100; // per hour total
let globalRequests = [];

function cleanOldEntries(arr, windowMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  return arr.filter(t => t > cutoff);
}

function getCacheKey(message, language, context) {
  return `${(message || '').trim().toLowerCase().slice(0, 200)}|${language || ''}|${context || ''}`;
}

const SYSTEM_PROMPT = `You are a warm, welcoming, and non-judgmental Bible AI assistant called "IA Biblica" from the app "Sigo com Fe".
You help anyone who wants to learn about the Bible and the Christian faith:
- Answering questions about the Bible, its books, characters, and teachings
- Explaining Scripture passages in clear, accessible language
- Providing spiritual guidance grounded in biblical principles
- Helping people understand Christianity and its core beliefs
- Offering comfort, hope, and encouragement through God's Word

Guidelines:
- Always respond in the user's language
- Be warm, welcoming, patient, and non-judgmental -- everyone is welcome
- Always ground your answers in Scripture with specific verse references (book chapter:verse)
- Explain context and meaning in simple, accessible terms
- Respect all Christian denominations and traditions
- Be encouraging and compassionate
- You are NOT a pastor tool -- do not help with sermon prep, church administration, or ministry tasks
- Use emojis sparingly to keep a warm tone`;

const CONTEXT_PROMPTS = {
  bible: 'The user wants to explore or understand a Bible passage, book, or character. Explain clearly with verse references and historical context.',
  questions: 'The user has a question about Christianity, faith, or theology. Answer accessibly, grounding in Scripture.',
  prayer: 'The user wants help with prayer. Offer heartfelt, biblical prayers or guidance on prayer life.',
  guidance: 'The user is seeking spiritual guidance or comfort. Be compassionate, offer biblical wisdom and encouragement.',
};

router.post('/chat', async (req, res) => {
  try {
    const { message, language, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check cache first
    const cacheKey = getCacheKey(message, language, context);
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('Bible AI: returning cached response');
      return res.json({ reply: cached.reply, cached: true });
    }

    // Rate limiting - per user (by IP)
    const userIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    let userReqs = userRequests.get(userIp) || [];
    userReqs = cleanOldEntries(userReqs);
    if (userReqs.length >= USER_LIMIT) {
      return res.status(429).json({
        error: 'A IA Biblica esta descansando um pouquinho. Tente novamente em alguns minutos!',
        retryAfter: 60
      });
    }

    // Rate limiting - global
    globalRequests = cleanOldEntries(globalRequests);
    if (globalRequests.length >= GLOBAL_LIMIT) {
      return res.status(429).json({
        error: 'A IA Biblica esta descansando um pouquinho. Tente novamente em alguns minutos!',
        retryAfter: 60
      });
    }

    // Record request
    userReqs.push(Date.now());
    userRequests.set(userIp, userReqs);
    globalRequests.push(Date.now());

    const contextHint = CONTEXT_PROMPTS[context] || '';
    const langHint = language ? `Respond in ${language}.` : '';
    const fullSystem = `${SYSTEM_PROMPT}\n\n${contextHint}\n${langHint}`;

    const reply = await generateReply(fullSystem, message);

    // Store in cache
    responseCache.set(cacheKey, { reply, timestamp: Date.now() });

    // Cleanup old cache entries periodically
    if (responseCache.size > 200) {
      const cutoff = Date.now() - CACHE_TTL;
      for (const [k, v] of responseCache) {
        if (v.timestamp < cutoff) responseCache.delete(k);
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error('Bible AI error:', err);
    if (err.message && err.message.includes('All LLMs failed')) {
      return res.status(429).json({
        error: 'A IA Biblica esta descansando um pouquinho. Tente novamente em alguns minutos!',
        retryAfter: 120
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
