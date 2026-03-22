const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { generateReply } = require('../services/llmFallback');

const SYSTEM_PROMPT = `You are a warm, biblical, and practical pastoral AI assistant called "IA Pastoral" from the app "Sigo com Fe".
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
- Use emojis sparingly to keep a warm tone`;

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

    const contextHint = CONTEXT_PROMPTS[context] || '';
    const langHint = language ? `Respond in ${language}.` : '';
    const fullSystem = `${SYSTEM_PROMPT}\n\n${contextHint}\n${langHint}`;

    const reply = await generateReply(fullSystem, message);

    res.json({ reply });
  } catch (err) {
    console.error('Pastoral AI error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

module.exports = router;
