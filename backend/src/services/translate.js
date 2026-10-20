// Tradução curta de mensagens (chat da Oração Mundial).
// Tenta vários modelos e lembra o primeiro que funcionar, para não quebrar
// quando um modelo antigo for desativado.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LANG_NAMES = { pt: 'Brazilian Portuguese', es: 'Spanish', en: 'English', de: 'German', fr: 'French', ro: 'Romanian', ru: 'Russian' };

const CANDIDATES = [
  ...(ANTHROPIC_API_KEY ? ['claude-haiku-5-5', 'claude-haiku-4-5', 'claude-3-5-haiku-latest', 'claude-3-haiku-20240307'].map(m => ({ kind: 'anthropic', model: m })) : []),
  ...(GEMINI_API_KEY ? ['gemini-2.5-flash', 'gemini-2.0-flash'].map(m => ({ kind: 'gemini', model: m })) : []),
];
let working = null;

async function call(c, prompt) {
  if (c.kind === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: c.model, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) throw Object.assign(new Error(`anthropic ${r.status}`), { status: r.status });
    const d = await r.json();
    return d?.content?.[0]?.text || '';
  }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${c.model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 4000 } }),
  });
  if (!r.ok) throw Object.assign(new Error(`gemini ${r.status}`), { status: r.status });
  const d = await r.json();
  return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseArray(text, n) {
  const m = String(text).match(/\[[\s\S]*\]/);
  if (!m) throw new Error('no json');
  const arr = JSON.parse(m[0]);
  if (!Array.isArray(arr) || arr.length !== n) throw new Error('bad length');
  return arr.map(x => String(x ?? ''));
}

// Pergunta curta a um modelo (usa o mesmo modelo que já funcionou)
async function ask(prompt) {
  const order = working ? [working, ...CANDIDATES.filter(c => c !== working)] : CANDIDATES;
  let lastErr = new Error('no provider configured');
  for (const c of order) {
    try { const out = await call(c, prompt); if (out) { working = c; return out; } } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// texts: string[] -> string[] traduzidos para `lang`
async function translateBatch(texts, lang) {
  if (!texts.length) return [];
  const target = LANG_NAMES[lang] || 'Brazilian Portuguese';
  const prompt = `You translate short messages from a Christian prayer chat into ${target}.
Rules: translate each message naturally and warmly; if a message is already in ${target}, return it exactly unchanged; keep emojis, people's names and Bible references; do not add anything.
Return ONLY a JSON array of ${texts.length} strings, in the same order.

Messages (JSON):
${JSON.stringify(texts)}`;
  const order = working ? [working, ...CANDIDATES.filter(c => c !== working)] : CANDIDATES;
  let lastErr = new Error('no translation provider configured');
  for (const c of order) {
    try {
      const out = parseArray(await call(c, prompt), texts.length);
      if (working !== c) { working = c; console.log('[translate] using', c.kind, c.model); }
      return out;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

module.exports = { translateBatch, ask, LANG_NAMES };
