import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translation from './en/translation.json';

const resources = {
    en: {
        translation,
    },
} as const;

i18n.use(initReactI18next).init({
    lng: 'en-GB',
    simplifyPluralSuffix: false,
    resources,
});

export default resources;
