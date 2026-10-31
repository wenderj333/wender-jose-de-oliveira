// Descobre os modelos Gemini disponíveis para a chave (o Google retira modelos antigos com frequência).
// Escolhe os "flash" estáveis mais recentes (ex.: gemini-3.6-flash, gemini-3.5-flash-lite) e guarda por 6 horas.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FALLBACK = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
let cache = { at: 0, list: null };

function versionOf(name) {
  const m = /^gemini-(\d+(?:\.\d+)?)-/.exec(name);
  return m ? parseFloat(m[1]) : 0;
}

async function geminiModels() {
  if (!GEMINI_API_KEY) return [];
  if (cache.list && Date.now() - cache.at < 6 * 3600 * 1000) return cache.list;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GEMINI_API_KEY}`);
    if (!r.ok) throw new Error('list ' + r.status);
    const d = await r.json();
    const names = (d.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => String(m.name).replace(/^models\//, ''))
      .filter(n => /^gemini-\d+(?:\.\d+)?-flash(?:-lite)?$/.test(n)); // só estáveis, sem preview/imagem/áudio
    const flash = names.filter(n => !n.endsWith('-lite')).sort((a, b) => versionOf(b) - versionOf(a));
    const lite = names.filter(n => n.endsWith('-lite')).sort((a, b) => versionOf(b) - versionOf(a));
    const list = [...flash.slice(0, 2), ...lite.slice(0, 1)];
    cache = { at: Date.now(), list: list.length ? list : FALLBACK };
    console.log('[Gemini] models:', cache.list.join(', '));
  } catch (e) {
    console.warn('[Gemini] could not list models:', e.message);
    cache = { at: Date.now() - 5.5 * 3600 * 1000, list: FALLBACK }; // tenta listar de novo em 30 min
  }
  return cache.list;
}

module.exports = { geminiModels };
