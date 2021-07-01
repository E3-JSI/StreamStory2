import React from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => createStyles({
    stream: {
        fontWeight: 500
    },
    story: {
        fontWeight: 300
    }
}));

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
