import React from 'react';

import { useTranslation } from 'react-i18next';

import useStyles from './Logo.styles';

function Logo(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);

    return (
        <>
            <b className={classes.stream}>{t('common:stream')}</b>
            <i className={classes.story}>{t('common:story')}</i>
        </>
    );
}

export default Logo;
