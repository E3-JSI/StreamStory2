import React, { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';

import { getModel, Model as ModelType } from '../api/models';
import useMountEffect from '../hooks/useMountEffect';
import useSession from '../hooks/useSession';
import ModelVisualization from '../components/ModelVisualization';
import StateDetails from '../components/StateDetails';
import StateVisualization from '../components/StateVisualization';
import PageTitle from '../components/PageTitle';

import useStyles from './Model.styles';
import { addColorsToScaleStates, createCommonStateData } from '../utils/markovChainUtils';

export interface ModelUrlParams {
    id: string;
}

function Model(): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const { id } = useParams<ModelUrlParams>();
    const history = useHistory();
    const [{ currentModel, commonStateDataArr }, setSession] = useSession();
    const model = currentModel.find((m) => m.id === Number(id));
    const { commonStateData } = commonStateDataArr.find((m) => m.id === Number(id)) || {};
    const [isLoading, setIsLoading] = useState(!model);
    const [selectedState, setSelectedState] = useState<any>();
    const [stateDetailsVisible, setStateDetailsVisible] = useState(true);

    useMountEffect(() => {
        async function loadModel() {
            try {
                const response = await getModel(Number(id));

                if (response.data.model) {
                    const modelNew = response.data.model as ModelType;
                    const commStateDataNew = {
                        id: Number(id),
                        commonStateData: createCommonStateData(modelNew.model.scales),
                    };
                    addColorsToScaleStates(modelNew.model.scales, commStateDataNew.commonStateData);

                    setSession({
                        currentModel: [modelNew, ...currentModel],
                        commonStateDataArr: [commStateDataNew, ...commonStateDataArr],
                    });
                }

                setIsLoading(false);
            } catch {
                setIsLoading(false);
            }
        }

        if (!model) {
            loadModel();
        }
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hide = params.get('hide');
        console.log('hide=', hide);

        if (hide != null) {
            setStateDetailsVisible(hide.indexOf('state_details') === -1);
        }
    }, []);

    function handleCloseClick() {
        const nextModels = currentModel.filter((m) => m.id !== Number(id));

        history.push(
            nextModels.length
                ? `/model/${nextModels[0].id}`
                : `/dashboard/${model?.online ? 'online-models' : 'offline-models'}`,
        );
        setSession({ currentModel: nextModels });
    }

    return (
        <>
            <Box display="flex" justifyContent="space-between">
                <PageTitle gutterBottom>
                    {isLoading ? t('loading_model') : model?.name || t('model_not_found')}
                </PageTitle>
                <Tooltip title={t('close_model')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                    <IconButton
                        className={classes.closeButton}
                        aria-label={t('close_model')}
                        edge="end"
                        onClick={handleCloseClick}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            {model && commonStateData && (
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={8}>
                        <Grid item container direction="column" spacing={2}>
                            <Grid item>
                                <ModelVisualization
                                    model={model}
                                    selectedState={selectedState}
                                    commonStateData={commonStateData}
                                    onStateSelected={setSelectedState}
                                />
                            </Grid>
                            <Grid item>
                                <StateVisualization
                                    model={model}
                                    selectedState={selectedState}
                                    commonStateData={commonStateData}
                                    onStateSelected={setSelectedState}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        lg={4}
                        style={stateDetailsVisible ? {} : { display: 'none' }}
                    >
                        <StateDetails
                            className={classes.details}
                            model={model}
                            commonStateData={commonStateData}
                            selectedState={selectedState}
                        />
                    </Grid>
                </Grid>
            )}
        </>
    );
}

export default Model;
