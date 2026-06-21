// Regional pricing detection utility

const TIMEZONE_TO_COUNTRY = {
  'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Bahia': 'BR',
  'America/Belem': 'BR', 'America/Manaus': 'BR', 'America/Recife': 'BR',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'Europe/Lisbon': 'EU', 'Europe/London': 'EU', 'Europe/Paris': 'EU',
  'Europe/Berlin': 'EU', 'Europe/Madrid': 'EU', 'Europe/Rome': 'EU',
  'Europe/Amsterdam': 'EU', 'Europe/Brussels': 'EU', 'Europe/Vienna': 'EU',
  'Europe/Zurich': 'EU', 'Europe/Dublin': 'EU', 'Europe/Warsaw': 'EU',
  'Europe/Prague': 'EU', 'Europe/Budapest': 'EU', 'Europe/Bucharest': 'EU',
  'Europe/Helsinki': 'EU', 'Europe/Stockholm': 'EU', 'Europe/Oslo': 'EU',
  'Europe/Copenhagen': 'EU', 'Europe/Athens': 'EU',
};

const LANG_TO_REGION = {
  'pt-BR': 'BR', 'pt': 'BR',
  'en-US': 'US', 'en': 'US',
  'de': 'EU', 'fr': 'EU', 'es': 'EU', 'it': 'EU', 'nl': 'EU', 'ro': 'EU',
};

export function detectRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
  } catch (e) {}

  const lang = navigator.language || navigator.userLanguage || '';
  if (LANG_TO_REGION[lang]) return LANG_TO_REGION[lang];
  if (LANG_TO_REGION[lang.split('-')[0]]) return LANG_TO_REGION[lang.split('-')[0]];

  return 'OTHER';
}

const PRICES = {
  finance: {
    EU: { amount: '19,99', currency: 'EUR', symbol: '\u20ac', cents: 1999 },
    US: { amount: '19.99', currency: 'USD', symbol: '$', cents: 1999 },
    BR: { amount: '49,90', currency: 'BRL', symbol: 'R$', cents: 4990 },
    OTHER: { amount: '9.99', currency: 'USD', symbol: '$', cents: 999 },
  },
  theology: {
    EU: { amount: '29,99', currency: 'EUR', symbol: '\u20ac', cents: 2999 },
    US: { amount: '29.99', currency: 'USD', symbol: '$', cents: 2999 },
    BR: { amount: '79,90', currency: 'BRL', symbol: 'R$', cents: 7990 },
    OTHER: { amount: '14.99', currency: 'USD', symbol: '$', cents: 1499 },
  },
};

export function getPrice(courseType) {
  const region = detectRegion();
  const courseP = PRICES[courseType];
  if (!courseP) return PRICES.finance.OTHER;
  return courseP[region] || courseP.OTHER;
}

export function formatPrice(courseType) {
  const p = getPrice(courseType);
  return `${p.symbol}${p.amount}`;
}
