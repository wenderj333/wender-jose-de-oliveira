// Regional pricing utility - detects user region and returns appropriate price
const TIMEZONE_TO_REGION = {
  'America/Sao_Paulo': 'br', 'America/Fortaleza': 'br', 'America/Recife': 'br',
  'America/Bahia': 'br', 'America/Belem': 'br', 'America/Manaus': 'br',
  'America/New_York': 'us', 'America/Chicago': 'us', 'America/Denver': 'us',
  'America/Los_Angeles': 'us', 'America/Phoenix': 'us',
  'America/Toronto': 'us', 'America/Vancouver': 'us',
  'Europe/London': 'eu', 'Europe/Paris': 'eu', 'Europe/Berlin': 'eu',
  'Europe/Madrid': 'eu', 'Europe/Rome': 'eu', 'Europe/Amsterdam': 'eu',
  'Europe/Brussels': 'eu', 'Europe/Vienna': 'eu', 'Europe/Lisbon': 'eu',
  'Europe/Dublin': 'eu', 'Europe/Helsinki': 'eu', 'Europe/Warsaw': 'eu',
  'Europe/Prague': 'eu', 'Europe/Budapest': 'eu', 'Europe/Bucharest': 'eu',
  'Europe/Athens': 'eu', 'Europe/Stockholm': 'eu', 'Europe/Oslo': 'eu',
  'Europe/Copenhagen': 'eu', 'Europe/Zurich': 'eu',
};

export function detectRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_TO_REGION[tz]) return TIMEZONE_TO_REGION[tz];
    if (tz && tz.startsWith('America/')) {
      const lang = navigator.language || '';
      if (lang.startsWith('pt')) return 'br';
      return 'us';
    }
    if (tz && tz.startsWith('Europe/')) return 'eu';
    return 'other';
  } catch {
    return 'other';
  }
}

// Prices in cents for each course and region
const PRICES = {
  advanced: { eu: { amount: 999, currency: 'eur', symbol: '\u20ac', display: '\u20ac9,99' }, us: { amount: 999, currency: 'usd', symbol: '$', display: '$9.99' }, br: { amount: 2990, currency: 'brl', symbol: 'R$', display: 'R$29,90' }, other: { amount: 499, currency: 'usd', symbol: '$', display: '$4.99' } },
  finance:  { eu: { amount: 1999, currency: 'eur', symbol: '\u20ac', display: '\u20ac19,99' }, us: { amount: 1999, currency: 'usd', symbol: '$', display: '$19.99' }, br: { amount: 4990, currency: 'brl', symbol: 'R$', display: 'R$49,90' }, other: { amount: 999, currency: 'usd', symbol: '$', display: '$9.99' } },
  theology: { eu: { amount: 2999, currency: 'eur', symbol: '\u20ac', display: '\u20ac29,99' }, us: { amount: 2999, currency: 'usd', symbol: '$', display: '$29.99' }, br: { amount: 7990, currency: 'brl', symbol: 'R$', display: 'R$79,90' }, other: { amount: 1499, currency: 'usd', symbol: '$', display: '$14.99' } },
};

export function getPrice(courseType) {
  const region = detectRegion();
  return PRICES[courseType]?.[region] || PRICES[courseType]?.other;
}

export function getPriceForBackend(courseType) {
  const region = detectRegion();
  const p = PRICES[courseType]?.[region] || PRICES[courseType]?.other;
  return { amount: p.amount, currency: p.currency, region };
}
