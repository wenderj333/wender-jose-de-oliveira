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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      'pt-BR': { translation: pt },
      'pt-PT': { translation: pt },
      en: { translation: en },
      'en-US': { translation: en },
      'en-GB': { translation: en },
      'en-AU': { translation: en },
      es: { translation: es },
      'es-ES': { translation: es },
      'es-MX': { translation: es },
      'es-AR': { translation: es },
      de: { translation: de },
      'de-DE': { translation: de },
      'de-AT': { translation: de },
      'de-CH': { translation: de },
      ro: { translation: ro },
      'ro-RO': { translation: ro },
      ru: { translation: ru },
      'ru-RU': { translation: ru },
      fr: { translation: fr },
      'fr-FR': { translation: fr },
      'fr-CA': { translation: fr },
    },
    // Remove `lng: 'pt'` to let detector work
    fallbackLng: 'en', // Fallback to English if detected language not fully supported
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    // Remove `nonExplicitSupportedLngs: true`
    preload: ['pt', 'en', 'es', 'de', 'fr', 'ro', 'ru'],
  });

export default i18n;
