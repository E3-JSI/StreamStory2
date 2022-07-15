/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultProps } from '../contexts/SessionContext';
import { loadFromStorage } from '../components/SessionProvider';
import config from '../config';
import translation from './en/translation.json';
import { mergeDeep } from '../utils/misc';

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
        const mainTranslation = require(`./${language}/translation.json`);
        if (mainTranslation) {
            languageTranslation = mergeDeep(
                languageTranslation,
                mainTranslation,
            ) as typeof translation;
        }
    } catch (error) {
        // require failed
    }

    try {
        // eslint-disable-next-line global-require
        const configTranslation = require(`../config/i18n/${language}/translation.json`);
        if (configTranslation) {
            languageTranslation = mergeDeep(
                languageTranslation,
                configTranslation,
            ) as typeof translation;
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

const { language } = loadFromStorage({ ...defaultProps, update: null });
i18n.use(initReactI18next).init({
    // interpolation: { escapeValue: false },
    lng: language && languages.includes(language) ? language : languages[0],
    // fallbackLng: languages,
    simplifyPluralSuffix: false,
    resources,
});

export default resources;
