import React from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';

export interface DashboardUrlParams {
    view?: string;
}

function Dashboard(): JSX.Element {
    const { t } = useTranslation(['common', 'error']);

    let { view } = useParams<DashboardUrlParams>();

    let title = '';

    switch (view) {
        case 'online-models':
            title = t('common:online_models');
            break;

        default:
            if (!view) {
                view = 'offline-models';
            }

            title = t('common:offline_models');
            break;
    }

    return (
        <Typography component="h1" variant="h4">
            {title}
        </Typography>
    );
}

export default Dashboard;
