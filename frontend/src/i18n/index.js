import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import am from './locales/am.json';

const storedLanguage = window.localStorage.getItem('app-language');
const initialLanguage = storedLanguage === 'am' ? 'am' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    returnNull: false
  });

i18n.on('languageChanged', (language) => {
  const activeLanguage = language === 'am' ? 'am' : 'en';
  window.localStorage.setItem('app-language', activeLanguage);
  document.documentElement.lang = activeLanguage;
  document.documentElement.dir = 'ltr';
  document.documentElement.classList.toggle('language-amharic', activeLanguage === 'am');
});

document.documentElement.lang = initialLanguage;
document.documentElement.dir = 'ltr';
document.documentElement.classList.toggle('language-amharic', initialLanguage === 'am');

export default i18n;
