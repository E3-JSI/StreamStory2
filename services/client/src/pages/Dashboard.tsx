import React, { useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Model, ModelsResponse } from '../api/models';
import { getResponseErrors } from '../utils/errors';
import useMountEffect from '../hooks/useMountEffect';
import useSnackbar from '../hooks/useSnackbar';
import ModelList from '../components/ModelList';
import PageTitle from '../components/PageTitle';
import TransHtml from '../components/TransHtml';

export interface DashboardUrlParams {
    view?: string;
}

function Dashboard(): JSX.Element {
    const { t } = useTranslation();
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSnackbar] = useSnackbar();

    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    useMountEffect(() => {
        async function getModels() {
            setIsLoading(true);

            try {
                const response = await axios.get<ModelsResponse>('/api/models/');

                if (Array.isArray(response.data.model)) {
                    setModels(response.data.model);
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

        getModels();
    });

    function updateModel(model: Model, remove?: boolean) {
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
        case 'online-models':
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
                    showUserColumn={false}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    updateModel={updateModel}
                    gutterBottom
                />,
                <ModelList
                    key="inactive-models-list"
                    id="inactive-models-list"
                    title={t('inactive_models')}
                    searchPlaceholder={t('search_inactive_models')}
                    models={models.filter((model) => model.online && !model.active)}
                    online
                    showUserColumn={false}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    updateModel={updateModel}
                />,
            ];
            break;

        default:
            if (!view) {
                view = 'offline-models';
            }

            title = t('offline_models');
            lists = [
                <ModelList
                    key="my-models-list"
                    id="my-models-list"
                    title={t('my_models')}
                    description={<TransHtml i18nKey="my_models_description" />}
                    addModelDialogTitle={t('add_new_offline_model')}
                    searchPlaceholder={t('search_my_models')}
                    models={models.filter((model) => !model.online && !model.public)}
                    showUserColumn={false}
                    showDateColumn={isScreenWidthGteSm}
                    loading={isLoading}
                    updateModel={updateModel}
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
                    updateModel={updateModel}
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
