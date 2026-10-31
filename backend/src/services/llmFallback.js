/**
 * LLM Fallback Service
 * Tries Gemini first (cheaper), then Claude (Anthropic) as fallback.
 * Each provider tries a short list of models, so a retired model does not break the feature.
 * Set GEMINI_API_KEY and/or ANTHROPIC_API_KEY on Render.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const { geminiModels } = require('./geminiModels');
const ANTHROPIC_MODELS = ['claude-haiku-4-5', 'claude-haiku-5-5', 'claude-3-5-haiku-latest'];
const geminiUrl = (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY}`;
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

async function callGemini(systemPrompt, userMessage, model) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const response = await fetch(geminiUrl(model), {
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

async function callAnthropic(systemPrompt, userMessage, model = ANTHROPIC_MODELS[0]) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
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
  const tries = [
    ...(GEMINI_API_KEY ? (await geminiModels()).map(m => ['Gemini', m, callGemini]) : []),
    ...(ANTHROPIC_API_KEY ? ANTHROPIC_MODELS.map(m => ['Anthropic', m, callAnthropic]) : []),
  ];
  for (const [name, model, fn] of tries) {
    try {
      const reply = await fn(systemPrompt, userMessage, model);
      console.log(`[LLM] Used: ${name} ${model}`);
      return reply;
    } catch (err) {
      console.warn(`[LLM] ${name} ${model} failed:`, String(err.message).replace(/\s+/g, ' ').slice(0, 300));
      errors.push(`${name} ${model}: ${String(err.message).replace(/\s+/g, ' ').slice(0, 160)}`);
    }
  }
  throw new Error(`All LLMs failed: ${errors.join(' | ')}`);
}

module.exports = { generateReply };
