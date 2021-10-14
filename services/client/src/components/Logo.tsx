import React from 'react';

import { useTranslation } from 'react-i18next';

import useStyles from './Logo.styles';

function Logo(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <>
            <b className={classes.stream}>{t('stream')}</b>
            <i className={classes.story}>{t('story')}</i>
        </>
    );
}

export default Logo;
