const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

    const contextHint = CONTEXT_PROMPTS[context] || '';
    const langHint = language ? `Respond in ${language}.` : '';

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      return res.status(502).json({ error: 'Failed to get AI response' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

    res.json({ reply });
  } catch (err) {
    console.error('Bible AI error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
