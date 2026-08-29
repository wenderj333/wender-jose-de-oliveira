import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './pt.json';
import en from './en.json';
import es from './es.json';
import de from './de.json';
import ro from './ro.json';
import ru from './ru.json';
import fr from './fr.json';

import { repairMojibake } from '../utils/textEncoding';

// A few older locale files were saved with UTF-8 decoded as Windows-1252.
// Normalize every translated string at load time so users never see Ã/Ð/ðŸ text.
function normalizeLocale(value) {
  if (Array.isArray(value)) return value.map(normalizeLocale);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeLocale(item)]));
  }
  return repairMojibake(value);
}

const locales = {
  pt: normalizeLocale(pt), en: normalizeLocale(en), es: normalizeLocale(es),
  de: normalizeLocale(de), ro: normalizeLocale(ro), ru: normalizeLocale(ru), fr: normalizeLocale(fr),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: locales.pt },
      'pt-BR': { translation: locales.pt },
      'pt-PT': { translation: locales.pt },
      en: { translation: locales.en },
      'en-US': { translation: locales.en },
      'en-GB': { translation: locales.en },
      'en-AU': { translation: locales.en },
      es: { translation: locales.es },
      'es-ES': { translation: locales.es },
      'es-MX': { translation: locales.es },
      'es-AR': { translation: locales.es },
      de: { translation: locales.de },
      'de-DE': { translation: locales.de },
      'de-AT': { translation: locales.de },
      'de-CH': { translation: locales.de },
      ro: { translation: locales.ro },
      'ro-RO': { translation: locales.ro },
      ru: { translation: locales.ru },
      'ru-RU': { translation: locales.ru },
      fr: { translation: locales.fr },
      'fr-FR': { translation: locales.fr },
      'fr-CA': { translation: locales.fr },
    },
    // ⚠️ NÃO definir 'lng' aqui — deixa o LanguageDetector detectar automaticamente
    fallbackLng: 'pt', // só fallback se o idioma do browser não for suportado
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Ordem: primeiro verifica localStorage (escolha salva), depois browser, depois HTML
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    nonExplicitSupportedLngs: true,
    preload: ['pt', 'en', 'es', 'de', 'fr', 'ro', 'ru'],
  });

export default i18n;
