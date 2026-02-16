const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a warm, biblical, and practical pastoral AI assistant called "IA Pastoral" from the app "Sigo com Fé".
You help pastors and church leaders with:
- Preparing sermons (outlines, illustrations, applications)
- Suggesting relevant Bible verses for any topic or situation
- Providing wise, compassionate counseling advice rooted in Scripture
- Generating heartfelt prayers for various occasions
- Organizing church tasks, events, and ministry planning

Guidelines:
- Always respond in the user's language
- Be warm, encouraging, and empathetic
- Ground your advice in Scripture with specific verse references
- Be practical and actionable
- Respect all Christian denominations
- When giving counseling advice, remind that professional help may also be needed for serious issues
- Use emojis sparingly to keep a warm tone (📖, 🙏, ✝️, 💛)`;

const CONTEXT_PROMPTS = {
  sermon: 'The user wants help preparing a sermon. Focus on sermon structure, key points, illustrations, and biblical references.',
  verse: 'The user is looking for Bible verses. Suggest relevant verses with brief explanations of their context and application.',
  counseling: 'The user needs pastoral counseling advice. Be compassionate, wise, and ground your guidance in Scripture. Remind them of professional resources when appropriate.',
  prayer: 'The user wants help with prayer. Generate heartfelt, biblical prayers or help them structure their prayer life.',
  tasks: 'The user needs help organizing church tasks and ministry. Be practical, structured, and help with planning.',
};

router.post('/chat', authenticate, requireRole('pastor'), async (req, res) => {
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
    console.error('Pastoral AI error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
