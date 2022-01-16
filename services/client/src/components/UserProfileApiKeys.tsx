import React from 'react';
import { useTranslation } from 'react-i18next';

import useStyles from './UserProfileApiKeys.styles';

function UserProfileApiKeys(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    return <div className={classes.root}>{t('api_keys')}</div>;
}

export default UserProfileApiKeys;
