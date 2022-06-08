import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { getModels, Model } from '../api/models';
import { getResponseErrors } from '../utils/errors';
import useMountEffect from '../hooks/useMountEffect';
import useSnackbar from '../hooks/useSnackbar';
import ModelList from '../components/ModelList';
import PageTitle from '../components/PageTitle';
import TransHtml from '../components/TransHtml';

export enum DashboardView {
    OfflineModels = 'offline-models',
    OnlineModels = 'online-models',
}

export interface DashboardUrlParams {
    view?: DashboardView;
}

function Dashboard(): JSX.Element {
    const { t } = useTranslation();
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSnackbar] = useSnackbar();

    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    useMountEffect(() => {
        async function loadModels() {
            setIsLoading(true);

            try {
                const response = await getModels();

                if (response.data.models) {
                    setModels(response.data.models);
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                const responseErrors = getResponseErrors(error, t);

                if (Array.isArray(responseErrors)) {
                    const message = responseErrors;

                    if (message.length) {
                        showSnackbar({
                            message: responseErrors,
                            severity: 'error',
                        });
                    }
                }
            }
        }

        loadModels();
    });

    function handleModelUpdate(model: Model, remove?: boolean) {
        const newModels = models.filter((m) => m.id !== model.id);

        if (!remove) {
            newModels.push(model);
        }
        setModels(newModels);
    }

    let { view } = useParams<DashboardUrlParams>();
    let title;
    let lists;

    switch (view) {
        case DashboardView.OnlineModels:
            title = t('online_models');
            lists = [
                <ModelList
                    key="active-models-list"
                    id="active-models-list"
                    title={t('active_models')}
                    addModelDialogTitle={t('add_new_online_model')}
                    searchPlaceholder={t('search_active_models')}
                    models={models.filter((model) => model.online && model.active)}
                    online
                    showUserColumn={isScreenWidthGteMd}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    onModelUpdate={handleModelUpdate}
                    gutterBottom
                />,
                <ModelList
                    key="inactive-models-list"
                    id="inactive-models-list"
                    title={t('inactive_models')}
                    searchPlaceholder={t('search_inactive_models')}
                    models={models.filter((model) => model.online && !model.active)}
                    online
                    showUserColumn={isScreenWidthGteMd}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    onModelUpdate={handleModelUpdate}
                />,
            ];
            break;

        default:
            if (!view) {
                view = DashboardView.OfflineModels;
            }

            title = t('offline_models');
            lists = [
                <ModelList
                    key="my-models-list"
                    id="my-models-list"
                    title={t('private_models')}
                    description={<TransHtml i18nKey="private_models_description" />}
                    addModelDialogTitle={t('add_new_offline_model')}
                    searchPlaceholder={t('search_private_models')}
                    models={models.filter((model) => !model.online && !model.public)}
                    showUserColumn={isScreenWidthGteMd}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    onModelUpdate={handleModelUpdate}
                    gutterBottom
                />,
                <ModelList
                    key="public-models-list"
                    id="public-models-list"
                    title={t('public_models')}
                    searchPlaceholder={t('search_public_models')}
                    models={models.filter((model) => !model.online && model.public)}
                    showUserColumn={isScreenWidthGteMd}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    onModelUpdate={handleModelUpdate}
                />,
            ];
            break;
    }

    return (
        <>
            <PageTitle gutterBottom>{title}</PageTitle>
            {lists}
        </>
    );
}

export default Dashboard;
