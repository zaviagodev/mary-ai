import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '../locales/en/common.json';
import thTranslations from '../locales/th/common.json';

const resources = {
  en: {
    common: enTranslations,
  },
  th: {
    common: thTranslations,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'th', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    
    // Use 'common' as default namespace
    defaultNS: 'common',
    ns: ['common'],
    
    // React options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;
