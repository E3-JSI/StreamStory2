/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import config from '../config';
import translation from './en/translation.json';

const languages = config.languages || ['en'];
let resources = {
    en: {
        translation,
    },
};

languages.forEach((language) => {
    let languageTranslation = { ...translation };
    try {
        // eslint-disable-next-line global-require
        const defaultTranslation = require(`./${language}/translation.json`);
        if (defaultTranslation) {
            languageTranslation = { ...languageTranslation, ...defaultTranslation };
        }
    } catch (error) {
        // require failed
    }

    try {
        // eslint-disable-next-line global-require
        const configTranslation = require(`../config/i18n/${language}/translation.json`);
        if (configTranslation) {
            languageTranslation = { ...languageTranslation, ...configTranslation };
        }
    } catch (error) {
        // require failed
    }

    const res = {
        [language]: {
            translation: languageTranslation,
        },
    };

    resources = { ...resources, ...res } as typeof resources;
});

let lng = localStorage.getItem('lng');
if (!lng || !languages.includes(lng)) {
    [lng] = languages;
}

i18n.use(initReactI18next).init({
    // interpolation: { escapeValue: false },
    lng,
    simplifyPluralSuffix: false,
    resources,
});

export default resources;
