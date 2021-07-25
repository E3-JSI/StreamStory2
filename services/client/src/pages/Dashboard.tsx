import React from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

export interface DashboardUrlParams {
    view?: string;
}

function Dashboard(): JSX.Element {
    const { t } = useTranslation(['common']);

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

    return <PageTitle>{title}</PageTitle>;
}

export default Dashboard;
