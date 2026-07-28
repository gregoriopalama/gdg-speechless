import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import itTranslation from './locales/it.json';
import enTranslation from './locales/en.json';

const resources = {
  it: {
    translation: itTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it', // Lingua di default configurata a livello host
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react già si occupa di fare escaping di XSS
    },
  });

export default i18n;
