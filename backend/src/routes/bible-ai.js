const express = require('express');
const router = express.Router();
const { callLLM } = require('../services/llmFallback');

// ─── Cache & Rate Limiting ────────────────────────────────────────────────────
const responseCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
const userRequests = new Map();
const USER_LIMIT = 10;  // por hora por IP
const GLOBAL_LIMIT = 50;
let globalRequests = [];

function cleanOldEntries(arr, windowMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  return arr.filter(t => t > cutoff);
}

function getCacheKey(message, language, context) {
  return `${(message || '').trim().toLowerCase().slice(0, 200)}|${language || ''}|${context || ''}`;
}

// ─── System prompt da IA Bíblica ──────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é um assistente bíblico cristão do app "Sigo com Fé" chamado "IA Bíblica".
Ajude qualquer pessoa que queira aprender sobre a Bíblia e a fé cristã:
- Responda perguntas sobre a Bíblia, seus livros, personagens e ensinamentos
- Explique passagens com linguagem clara e acessível
- Ofereça orientação espiritual com fundamento bíblico
- Dê conforto, esperança e encorajamento através da Palavra de Deus

Diretrizes:
- Responda sempre no idioma do usuário
- Seja acolhedor, paciente e não julgador
- Cite versículos específicos (livro capítulo:versículo)
- Use emojis com moderação (📖, 🙏, ✝️, 💛)
- Máximo 300 palavras por resposta`;

const CONTEXT_PROMPTS = {
  bible: 'O usuário quer explorar uma passagem bíblica. Explique com contexto histórico e versículos.',
  questions: 'O usuário tem uma pergunta sobre o Cristianismo ou teologia. Responda com base nas Escrituras.',
  prayer: 'O usuário quer ajuda com oração. Ofereça orientação bíblica sobre vida de oração.',
  guidance: 'O usuário busca orientação espiritual. Seja compassivo e ofereça sabedoria bíblica.',
};

// ─── Rota principal ───────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, language, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    // Verificar cache
    const cacheKey = getCacheKey(message, language, context);
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return res.json({ reply: cached.reply, cached: true });
    }

    // Rate limiting por IP
    const userIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    let userReqs = cleanOldEntries(userRequests.get(userIp) || []);
    if (userReqs.length >= USER_LIMIT) {
      return res.status(429).json({
        error: 'A IA Bíblica está descansando um pouquinho. Tente novamente em alguns minutos! 🙏',
        retryAfter: 60,
      });
    }

    // Rate limiting global
    globalRequests = cleanOldEntries(globalRequests);
    if (globalRequests.length >= GLOBAL_LIMIT) {
      return res.status(429).json({
        error: 'Estamos com alta demanda no momento. Tente novamente em alguns instantes 🙏',
        retryAfter: 60,
      });
    }

    userReqs.push(Date.now());
    userRequests.set(userIp, userReqs);
    globalRequests.push(Date.now());

    // Montar prompt completo
    const contextHint = CONTEXT_PROMPTS[context] || '';
    const langHint = language ? `Responda em ${language}.` : '';
    const fullPrompt = [contextHint, langHint, `Pergunta do usuário: ${message}`]
      .filter(Boolean).join('\n');

    // ── Chamar IA com fallback automático ──────────────────────────────────
    const result = await callLLM(fullPrompt, SYSTEM_PROMPT, {
      models: ['gemini-flash', 'gemini-pro', 'claude-haiku', 'claude-sonnet'],
      timeoutMs: 15000,
    });

    // Guardar no cache (só se não foi mensagem de fallback)
    if (!result.failed) {
      responseCache.set(cacheKey, { reply: result.text, timestamp: Date.now() });
      if (responseCache.size > 200) {
        const cutoff = Date.now() - CACHE_TTL;
        for (const [k, v] of responseCache) {
          if (v.timestamp < cutoff) responseCache.delete(k);
        }
      }
    }

    res.json({
      reply: result.text,
      model: result.model,       // qual modelo respondeu
      cached: false,
    });

  } catch (err) {
    console.error('Bible AI route error:', err);
    res.status(500).json({
      error: 'Estamos com alta demanda no momento. Tente novamente em alguns instantes 🙏',
    });
  }
});

module.exports = router;
