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
    lng: localStorage.getItem('i18nextLng') || 'pt',
    lng: localStorage.getItem('i18nextLng') || 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // Normalize language codes to support regional variants
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    // Force explicit language code normalization
    nonExplicitSupportedLngs: true,
  });

// Ensure saved language preference is respected on app load
const savedLng = localStorage.getItem('i18nextLng');
if (savedLng) {
  const normalizedLng = savedLng.split('-')[0]; // Extract base language code (pt from pt-BR)
  i18n.changeLanguage(normalizedLng);
}

export default i18n;
