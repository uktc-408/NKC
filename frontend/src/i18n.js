import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';

// Retrieve the language setting from local storage (in lowercase)
const storedLanguage = localStorage.getItem('displayLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      zh: {
        translation: zhTranslation
      }
    },
    lng: storedLanguage, // Directly use the stored language code
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Add language change listener
window.addEventListener('languageChange', (event) => {
  const newLang = event.detail.toLowerCase();
  i18n.changeLanguage(newLang);
});

export default i18n; 