/**
 * LLM Fallback Service
 * Tries Gemini first, then Claude (Anthropic) as fallback.
 * Set GEMINI_API_KEY and/or ANTHROPIC_API_KEY on Render.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';


async function callOllama(systemPrompt, userMessage) {
  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-r1:8b',
      prompt: systemPrompt + '\n\nUser: ' + userMessage + '\nAssistant:',
      stream: false,
    }),
  });
  if (!response.ok) throw new Error('Ollama failed: ' + response.status);
  const data = await response.json();
  return data.response;
}

async function callGemini(systemPrompt, userMessage) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser message: ${userMessage}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Gemini returned empty response');
  return reply;
}

async function callAnthropic(systemPrompt, userMessage) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const reply = data?.content?.[0]?.text;
  if (!reply) throw new Error('Anthropic returned empty response');
  return reply;
}

/**
 * Generate a reply using available LLMs.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<string>} reply text
 */
async function generateReply(systemPrompt, userMessage) {
  const errors = [];

  // 1. Try Anthropic Claude first
  if (ANTHROPIC_API_KEY) {
    try {
      const reply = await callAnthropic(systemPrompt, userMessage);
      console.log('[LLM] Used: Anthropic Claude');
      return reply;
    } catch (err) {
      console.warn('[LLM] Anthropic failed:', err.message);
      errors.push(`Anthropic: ${err.message}`);
    }
  }

  // 2. Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      const reply = await callGemini(systemPrompt, userMessage);
      console.log('[LLM] Used: Gemini (fallback)');
      return reply;
    } catch (err) {
      console.warn('[LLM] Gemini failed:', err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  throw new Error(`All LLMs failed: ${errors.join(' | ')}`);
}

module.exports = { generateReply };
