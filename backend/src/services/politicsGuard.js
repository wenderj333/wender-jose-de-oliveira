// "Guardião do chat": impede campanha política no chat da Oração Mundial.
// 1) filtro rápido por palavras; 2) só se houver suspeita, um modelo decide.
// Orar pelo país e pelas autoridades (1 Tm 2:1-2) continua permitido.
const { ask } = require('./translate');

const WORDS = [
  'eleiç', 'eleic', 'elección', 'eleccion', 'election', 'wahl', 'élection', 'alegeri', 'выбор',
  'candidat', 'kandidat', 'vote', 'votem', 'votar', 'voten', 'votez', 'wählt', 'votați', 'голосу',
  'partido', 'partei', 'parti ', 'партия', 'esquerda', 'direita', 'izquierda', 'derecha',
  'lula', 'bolsonaro', 'flávio', 'flavio', 'tarcísio', 'tarcisio', 'haddad', 'ciro gomes', 'marina silva', 'michelle bolsonaro',
  'pt ', ' pl ', 'psdb', 'mdb', 'psol', 'novo partido', 'trump', 'biden', 'harris', 'kamala', 'sánchez', 'sanchez', 'feijóo', 'feijoo', 'vox', 'podemos', 'putin', 'zelensk', 'milei', 'macron', 'le pen', 'afd', 'merz', 'scholz',
  'presidente', 'president', 'präsident', 'президент', 'deputad', 'senador', 'senator', 'governador', 'prefeito',
  'comunista', 'fascista', 'petista', 'bolsonarista', 'lulista', 'esquerdista', 'direitista',
];
const STRONG = /(vot(e|em|ar|en|ez)|candidat|elei[cç]|elecci|election|reelei|reelect|lula|bolsonaro|fl[aá]vio|tarc[ií]sio|haddad|trump|biden|kamala|putin|milei|petista|bolsonarista|comunista|fascista)/i;

function suspicious(text) {
  const t = ' ' + String(text).toLowerCase() + ' ';
  return WORDS.some(w => t.includes(w));
}

const cache = new Map();
async function isPoliticalCampaign(text) {
  const clean = String(text || '').trim();
  if (!clean || !suspicious(clean)) return false;
  const key = clean.toLowerCase().slice(0, 400);
  if (cache.has(key)) return cache.get(key);
  let verdict;
  try {
    const out = await ask(`You moderate a Christian prayer chat open to people of every political view.
Decide if this message is PARTISAN POLITICS: campaigning, asking people to vote or not vote for someone, praising or attacking a politician, party, ideology or candidate, or praying for a specific side to win or lose an election.
NOT partisan (allowed): praying in general for the country, peace, justice, the authorities or "our leaders" without taking sides; mentioning a president only to pray for wisdom and health for them.
Answer with exactly one word: BLOCK or ALLOW.

Message: """${clean.slice(0, 800)}"""`);
    verdict = /BLOCK/i.test(out) && !/ALLOW/i.test(out.replace(/BLOCK/ig, ''));
  } catch (_) {
    // Sem modelo disponível: só bloqueia quando é claramente sobre voto/eleição
    verdict = STRONG.test(clean);
  }
  cache.set(key, verdict);
  if (cache.size > 2000) cache.clear();
  return verdict;
}

module.exports = { isPoliticalCampaign };
