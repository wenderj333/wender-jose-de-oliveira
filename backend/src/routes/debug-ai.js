const express = require('express');
const router = express.Router();

// Temporary debug endpoint - remove after testing
router.get('/test-llm', async (req, res) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const result = {
    anthropic_key_set: !!ANTHROPIC_API_KEY,
    anthropic_key_prefix: ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 15) + '...' : null,
    gemini_key_set: !!GEMINI_API_KEY,
    anthropic_test: null,
    gemini_test: null,
  };

  // Test Anthropic
  if (ANTHROPIC_API_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 50,
          system: 'You are a test assistant.',
          messages: [{ role: 'user', content: 'Say hello in one word.' }],
        }),
      });
      const data = await r.json();
      result.anthropic_test = { status: r.status, body: data };
    } catch (e) {
      result.anthropic_test = { error: e.message };
    }
  }

  // Test Gemini
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say hello in one word.' }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      });
      const data = await r.json();
      result.gemini_test = { status: r.status, body: data };
    } catch (e) {
      result.gemini_test = { error: e.message };
    }
  }

  res.json(result);
});

module.exports = router;
