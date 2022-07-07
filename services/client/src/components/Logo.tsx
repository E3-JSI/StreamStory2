import React from 'react';

import { useTranslation } from 'react-i18next';

import useStyles from './Logo.styles';

function Logo(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const title = t('stream_story');

    return (
        title === 'StreamStory' ? (
            <>
                <b className={classes.bold}>Stream</b>
                <i className={classes.italic}>Story</i>
            </>
        ) : <strong className={classes.bold}>{title}</strong>
    );
}

export default Logo;
