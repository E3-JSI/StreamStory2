import React, { useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import useMountEffect from '../hooks/useMountEffect';
import useSession from '../hooks/useSession';
import PageTitle from '../components/PageTitle';

export interface ModelUrlParams {
    id: string;
}

function Model(): JSX.Element {
    const {t} = useTranslation();
    const [{ currentModel: model }, setSession] = useSession();
    const [isLoading, setIsLoading] = useState(!model);
    const { id } = useParams<ModelUrlParams>();

    useMountEffect(() => {
        async function getModel() {
            try {
                const response = await axios.get(`/api/models/${id}`);

                if (response.data.model) {
                    setSession({ currentModel: response.data.model });
                }

                setIsLoading(false);
            } catch {
                setIsLoading(false);
            }
        }

        if (!model) {
            getModel();
        }
    });

    return (
        <>
            <PageTitle gutterBottom>
                {isLoading ? t('loading_model') : model?.name || t('model_not_found')}
            </PageTitle>
            {model && (
                <Typography component="pre" style={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(model, null, 2)}
                </Typography>
            )}
        </>
    );
}

export default Model;
