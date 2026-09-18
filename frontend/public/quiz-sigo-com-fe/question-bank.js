import { questions as seedQuestions } from './questions.js';

export const QUESTION_BANK_SIZE = 2000;

const LANGUAGES = ['pt', 'en', 'es', 'de', 'fr', 'ro', 'ru'];
const VARIANT_PROMPTS = {
  pt: ['Releia com atenção:', 'Na perspectiva do texto bíblico:', 'Em uma nova forma de lembrar:', 'Qual alternativa completa este estudo?', 'Durante esta jornada de estudo,'],
  en: ['Read this carefully:', 'From the biblical text:', 'In another way of remembering:', 'Which option completes this study?', 'During this study journey,'],
  es: ['Lee con atención:', 'Desde el texto bíblico:', 'De otra manera de recordar:', '¿Qué opción completa este estudio?', 'Durante este camino de estudio,'],
  de: ['Lies aufmerksam:', 'Ausgehend vom biblischen Text:', 'Auf eine andere Weise erinnert:', 'Welche Antwort vervollständigt diese Frage?', 'Auf dieser Lernreise,'],
  fr: ['Lisez attentivement :', 'À partir du texte biblique :', 'Autrement dit pour vous souvenir :', 'Quelle réponse complète cette étude ?', 'Pendant ce chemin d’étude,'],
  ro: ['Citește cu atenție:', 'Pornind de la textul biblic:', 'Într-un alt fel de a-ți aminti:', 'Ce răspuns completează acest studiu?', 'În această călătorie de studiu,'],
  ru: ['Прочитайте внимательно:', 'С точки зрения библейского текста:', 'Иными словами, чтобы вспомнить:', 'Какой ответ завершает этот вопрос?', 'Во время этого пути обучения,']
};

function createVariant(seed, index) {
  const sourceIndex = index % seedQuestions.length;
  const variantNumber = Math.floor(index / seedQuestions.length) + 1;
  const localized = {};
  LANGUAGES.forEach((language) => {
    const source = seed[language] || seed.pt;
    const prompt = VARIANT_PROMPTS[language][(variantNumber - 1) % VARIANT_PROMPTS[language].length];
    localized[language] = {
      ...source,
      question: `${prompt} ${source.question} (${language === 'pt' ? 'variação' : 'variant'} ${variantNumber})`
    };
  });
  return {
    ...seed,
    bankId: `bible-question-${String(index + 1).padStart(4, '0')}`,
    sourceIndex,
    variantNumber,
    ...localized
  };
}

export const questionBank = Array.from({ length: QUESTION_BANK_SIZE }, (_, index) => (
  createVariant(seedQuestions[index % seedQuestions.length], index)
));

const questionByBankId = new Map(questionBank.map((question) => [question.bankId, question]));

export function restoreJourneyQuestions(ids) {
  if (!Array.isArray(ids) || ids.length !== seedQuestions.length) return null;
  const restored = ids.map((id) => questionByBankId.get(id));
  if (restored.some((question) => !question) || new Set(ids).size !== ids.length) return null;
  return restored;
}

export function pickJourneyQuestions(count = seedQuestions.length) {
  const safeCount = Math.max(1, Math.min(seedQuestions.length, Math.floor(Number(count) || seedQuestions.length)));
  const selected = [];
  const usedVariants = new Set();
  for (let sourceIndex = 0; sourceIndex < safeCount; sourceIndex += 1) {
    const candidates = questionBank.filter((question) => question.sourceIndex === sourceIndex);
    const offset = Math.floor(Math.random() * candidates.length);
    const variant = candidates[offset];
    selected.push(variant);
    usedVariants.add(variant.bankId);
  }
  return selected.length === safeCount && usedVariants.size === safeCount
    ? selected
    : seedQuestions.slice(0, safeCount);
}
