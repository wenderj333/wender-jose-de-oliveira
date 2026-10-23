// "Guardião dos pedidos": verifica pedidos de oração e palavras de encorajamento antes de aparecerem.
// 1) regras rápidas (links, telefones, e-mails, dados bancários); 2) um modelo decide o resto.
// Pedidos sinceros sobre temas difíceis (abuso, vícios, depressão, doença, pensamentos suicidas) são PERMITIDOS.
const { ask } = require('./translate');
const { isPoliticalCampaign } = require('./politicsGuard');

const LINK = /(https?:\/\/|www\.|t\.me\/|wa\.me\/|bit\.ly|\b[a-z0-9-]{2,}\.(com|net|org|br|es|pt|info|io|xyz|me|ly|link|site|online|shop|app|store|club|top|vip)\b)/i;
const BANK = /\b(pix|iban|swift|cpf|cnpj|nif|dni|chave pix|n[uú]mero da conta|n[uú]mero de cuenta|account number|bank account|bizum|paypal|western union)\b/i;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
const PHONE = /\+?\d[\d\s().-]{7,}\d/g;
const hasPhone = (t) => (String(t).match(PHONE) || []).some(m => m.replace(/\D/g, '').length >= 9);

function quickCheck(text) {
  const t = String(text || '');
  if (EMAIL.test(t) || hasPhone(t) || BANK.test(t)) return 'contact';
  if (LINK.test(t)) return 'link';
  return null;
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
const cache = new Map();

// Devolve null (pode publicar) ou o motivo: 'link' | 'contact' | 'politics' | 'spam' | 'sexual' | 'abuse' | 'scam'
async function checkRequest(text, kind = 'request') {
  const clean = String(text || '').trim();
  if (!clean) return null;
  const quick = quickCheck(clean);
  if (quick) return quick;
  const key = kind + '|' + clean.toLowerCase().slice(0, 500);
  if (cache.has(key)) return cache.get(key);
  let verdict = null;
  try {
    const out = await withTimeout(ask(`You moderate "World Prayer", a Christian page where people post prayer requests${kind === 'comment' ? ' and short words of encouragement to them' : ''}. People of every country, church and political view use it.
Decide if this ${kind === 'comment' ? 'encouragement message' : 'prayer request'} must be BLOCKED. Block ONLY if it is clearly one of:
- SPAM: advertising, selling, promoting a business, channel, page or product, chain messages.
- SEXUAL: sexual or pornographic content, or seeking dates/romance.
- ABUSE: insults, hate, mocking God or believers, threats, harassment of a person.
- SCAM: asking for money, donations or gifts, investment or "miracle" offers.
- POLITICS: partisan politics — campaigning, asking to vote or not vote, praising or attacking a politician, party or ideology, praying for one side to win an election.
ALLOW everything else, especially sincere requests about painful topics (illness, addiction, abuse suffered, depression, suicidal thoughts, prison, family problems, debts, unemployment), prayers for the country, peace or the authorities without taking sides, testimonies and thanks. When in doubt, ALLOW.
Answer with exactly one word: ALLOW, SPAM, SEXUAL, ABUSE, SCAM or POLITICS.

Text: """${clean.slice(0, 1200)}"""`), 8000);
    const word = String(out || '').trim().toUpperCase().match(/ALLOW|SPAM|SEXUAL|ABUSE|SCAM|POLITICS/);
    verdict = word && word[0] !== 'ALLOW' ? word[0].toLowerCase() : null;
  } catch (_) {
    // Sem modelo disponível: só a regra de política clara
    try { verdict = (await isPoliticalCampaign(clean)) ? 'politics' : null; } catch { verdict = null; }
  }
  cache.set(key, verdict);
  if (cache.size > 2000) cache.clear();
  return verdict;
}

module.exports = { checkRequest, quickCheck };
