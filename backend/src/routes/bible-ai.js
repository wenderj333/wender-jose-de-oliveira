const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ===== CACHE & RATE LIMITING =====
const responseCache = new Map(); // key -> { reply, timestamp }
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const userRequests = new Map(); // ip -> [timestamps]
const USER_LIMIT = 10; // per hour per user
const GLOBAL_LIMIT = 30; // per hour total
let globalRequests = [];

function cleanOldEntries(arr, windowMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  return arr.filter(t => t > cutoff);
}

function getCacheKey(message, language, context) {
  return `${(message || '').trim().toLowerCase().slice(0, 200)}|${language || ''}|${context || ''}`;
}

const SYSTEM_PROMPT = `You are a warm, welcoming, and non-judgmental Bible AI assistant called "IA Bíblica" from the app "Sigo com Fé".
You help anyone who wants to learn about the Bible and the Christian faith:
- Answering questions about the Bible, its books, characters, and teachings
- Explaining Scripture passages in clear, accessible language
- Providing spiritual guidance grounded in biblical principles
- Helping people understand Christianity and its core beliefs
- Offering comfort, hope, and encouragement through God's Word

Guidelines:
- Always respond in the user's language
- Be warm, welcoming, patient, and non-judgmental — everyone is welcome
- Always ground your answers in Scripture with specific verse references (book chapter:verse)
- Explain context and meaning in simple, accessible terms
- Respect all Christian denominations and traditions
- Be encouraging and compassionate
- You are NOT a pastor tool — do not help with sermon prep, church administration, or ministry tasks
- Use emojis sparingly to keep a warm tone (📖, 🙏, ✝️, 💛, ✨)`;

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

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
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
        error: 'A IA Bíblica está descansando um pouquinho. Tente novamente em alguns minutos! 🙏',
        retryAfter: 60
      });
    }

    // Rate limiting - global
    globalRequests = cleanOldEntries(globalRequests);
    if (globalRequests.length >= GLOBAL_LIMIT) {
      return res.status(429).json({
        error: 'A IA Bíblica está descansando um pouquinho. Tente novamente em alguns minutos! 🙏',
        retryAfter: 60
      });
    }

    // Record request
    userReqs.push(Date.now());
    userRequests.set(userIp, userReqs);
    globalRequests.push(Date.now());

    const contextHint = CONTEXT_PROMPTS[context] || '';
    const langHint = language ? `Respond in ${language}.` : '';

    const requestBody = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextHint}\n${langHint}\n\nUser message: ${message}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Retry with exponential backoff on 429
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });
      if (response.status !== 429) break;
      console.log(`Gemini 429 rate limit, retry ${attempt + 1}/3...`);
      await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      if (response.status === 429) {
        return res.status(429).json({
          error: 'A IA Bíblica está descansando um pouquinho. Tente novamente em alguns minutos! 🙏',
          retryAfter: 120
        });
      }
      return res.status(502).json({ error: 'Failed to get AI response' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
