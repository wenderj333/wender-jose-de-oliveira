/**
 * llmFallback.js — Sistema resiliente de chamadas LLM com fallback automático
 * Suporta: Anthropic Claude + Google Gemini
 * Funciona: tenta o mais barato primeiro → fallback automático → resposta amigável
 */

const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Clientes ────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Configuração dos modelos (ordenado por custo: mais barato primeiro) ─────
const MODEL_PRIORITY = [
  {
    id: 'gemini-flash',
    name: 'Google Gemini 1.5 Flash',
    cost: 'baixo',
    call: async (prompt, systemPrompt) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    },
  },
  {
    id: 'gemini-pro',
    name: 'Google Gemini 1.5 Pro',
    cost: 'médio',
    call: async (prompt, systemPrompt) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    },
  },
  {
    id: 'claude-haiku',
    name: 'Anthropic Claude Haiku',
    cost: 'médio',
    call: async (prompt, systemPrompt) => {
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt || 'Você é um assistente cristão útil e compassivo.',
        messages: [{ role: 'user', content: prompt }],
      });
      return msg.content[0].text;
    },
  },
  {
    id: 'claude-sonnet',
    name: 'Anthropic Claude Sonnet',
    cost: 'alto',
    call: async (prompt, systemPrompt) => {
      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt || 'Você é um assistente cristão útil e compassivo.',
        messages: [{ role: 'user', content: prompt }],
      });
      return msg.content[0].text;
    },
  },
];

// ─── Mensagem amigável ao usuário (jamais expõe erros técnicos) ───────────────
const FRIENDLY_ERROR = 'Estamos com alta demanda no momento. Tente novamente em alguns instantes 🙏';

// ─── Detectar tipo de erro ────────────────────────────────────────────────────
function classifyError(err) {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;

  if (msg.includes('credit balance') || msg.includes('billing') || status === 402)
    return 'billing';
  if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429)
    return 'rate_limit';
  if (msg.includes('timeout') || msg.includes('etimedout') || msg.includes('econnreset'))
    return 'timeout';
  if (status >= 500)
    return 'server_error';
  return 'unknown';
}

// ─── Deve tentar fallback para este tipo de erro? ─────────────────────────────
function shouldFallback(errorType) {
  return ['billing', 'rate_limit', 'timeout', 'server_error'].includes(errorType);
}

// ─── Delay com exponential backoff ───────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const RETRY_DELAYS = [1000, 2000, 5000]; // 1s → 2s → 5s

// ─── Logger estruturado ───────────────────────────────────────────────────────
function log(level, data) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    ...data,
  };
  if (level === 'error') console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Função principal com retry + fallback ────────────────────────────────────
/**
 * Chama modelos LLM com fallback automático.
 * @param {string} prompt — Pergunta do usuário
 * @param {string} [systemPrompt] — Instruções do sistema (opcional)
 * @param {object} [options]
 * @param {string[]} [options.models] — IDs de modelos a usar (ex: ['gemini-flash','claude-haiku'])
 * @param {number} [options.timeoutMs=15000] — Timeout por chamada em ms
 * @returns {Promise<{text: string, model: string, attempts: object[]}>}
 */
async function callLLM(prompt, systemPrompt = null, options = {}) {
  const {
    models: modelIds = null,
    timeoutMs = 15000,
  } = options;

  // Filtra modelos se especificado, senão usa todos na ordem de prioridade
  const queue = modelIds
    ? MODEL_PRIORITY.filter(m => modelIds.includes(m.id))
    : MODEL_PRIORITY;

  const attempts = [];

  for (let i = 0; i < queue.length; i++) {
    const model = queue[i];
    const retryDelay = RETRY_DELAYS[i] || 5000;

    log('info', { event: 'llm_attempt', model: model.id, attempt: i + 1 });

    const startMs = Date.now();
    let lastError = null;

    // Tentar com timeout
    try {
      const text = await Promise.race([
        model.call(prompt, systemPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs)
        ),
      ]);

      const ms = Date.now() - startMs;
      log('info', { event: 'llm_success', model: model.id, ms });

      attempts.push({ model: model.id, status: 'success', ms });
      return { text, model: model.id, attempts };

    } catch (err) {
      const ms = Date.now() - startMs;
      const errorType = classifyError(err);

      log('error', {
        event: 'llm_error',
        model: model.id,
        errorType,
        message: err?.message,
        ms,
        willFallback: shouldFallback(errorType) && i < queue.length - 1,
      });

      attempts.push({ model: model.id, status: 'error', errorType, ms });
      lastError = err;

      if (!shouldFallback(errorType)) {
        // Erro não recuperável (ex: API key inválida) — para imediatamente
        log('warn', { event: 'llm_abort', reason: 'non_retriable', errorType });
        break;
      }

      // Aguarda antes do próximo modelo
      if (i < queue.length - 1) {
        log('info', { event: 'llm_delay', ms: retryDelay, nextModel: queue[i + 1].id });
        await delay(retryDelay);
      }
    }
  }

  // Todos os modelos falharam
  log('error', { event: 'llm_all_failed', attempts });
  return { text: FRIENDLY_ERROR, model: null, attempts, failed: true };
}

// ─── Helpers especializados para rotas do Sigo com Fé ────────────────────────

/**
 * IA Bíblica — Q&A sobre a Bíblia
 */
async function callBibleAI(question) {
  const systemPrompt = `Você é um assistente bíblico cristão especializado. 
Responda perguntas sobre a Bíblia com carinho, precisão e citações de versículos relevantes.
Seja conciso (máx 300 palavras). Use linguagem simples e acessível.
Se a pergunta não for bíblica, redirecione gentilmente.`;

  return callLLM(question, systemPrompt, {
    models: ['gemini-flash', 'gemini-pro', 'claude-haiku'],
    timeoutMs: 12000,
  });
}

/**
 * Chat Pastoral — conselheiro espiritual
 */
async function callPastoralAI(message) {
  const systemPrompt = `Você é um conselheiro pastoral cristão compassivo e experiente.
Ouça com empatia, ofereça apoio bíblico e encorajamento.
Nunca dê aconselhamento médico ou jurídico. Máx 400 palavras.
Se detectar crise grave (suicídio, violência), encaminhe para ajuda profissional imediatamente.`;

  return callLLM(message, systemPrompt, {
    models: ['claude-haiku', 'gemini-pro', 'claude-sonnet'],
    timeoutMs: 15000,
  });
}

module.exports = { callLLM, callBibleAI, callPastoralAI };
