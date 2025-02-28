import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationFa from './locales/fa/translation.json';
import translationEn from './locales/en/translation.json';

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'fa', // Default to Farsi
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      fa: {
        translation: translationFa
      },
      en: {
        translation: translationEn
      }
    },
    // Set RTL languages
    supportedLngs: ['fa', 'en'],
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Function to determine text direction
i18n.dir = function(lng = i18n.language) {
  return ['fa', 'ar', 'he'].indexOf(lng) >= 0 ? 'rtl' : 'ltr';
};

export default i18n; 