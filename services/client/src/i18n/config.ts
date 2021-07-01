import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './en/common.json';
import error from './en/error.json';

const resources = {
    en: {
        common,
        error
    }
} as const;

i18n.use(initReactI18next).init({
    lng: 'en',
    ns: ['common', 'error'],
    resources
});

export default resources;
