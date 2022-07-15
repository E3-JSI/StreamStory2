import React from 'react';

import { useTranslation } from 'react-i18next';

import useStyles from './Logo.styles';

function Logo(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const title = t('stream_story');

    return (
        <>
            {title.split(/\s+/).map((s, i) =>
                i % 2 === 0 ? (
                    <b key={`key-${i * 2}`} className={classes.bold}>
                        {s}
                    </b>
                ) : (
                    <i key={`key-${i * 2}`} className={classes.italic}>
                        {s}
                    </i>
                ),
            )}
        </>
    );
}

export default Logo;
