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
import { DashboardView } from './Dashboard';

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

    useMountEffect(() => {
        async function loadModel() {
            try {
                const response = await getModel(Number(id));

                if (response.data.model) {
                    const newModel = response.data.model as ModelType;
                    const newCommStateData = {
                        id: Number(id),
                        commonStateData: createCommonStateData(newModel.model.scales),
                    };
                    addColorsToScaleStates(newModel.model.scales, newCommStateData.commonStateData);
                    setSession({
                        currentModel: [newModel, ...currentModel],
                        commonStateDataArr: [newCommStateData, ...commonStateDataArr],
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

    function handleModelChange(modelNew: any) {
        if (modelNew) {
            const modelIx = currentModel.findIndex((m) => m.id === Number(id));
            const commStateDataIx = commonStateDataArr.findIndex((m) => m.id === Number(id));

            if (modelIx > -1 && commStateDataIx > -1) {
                const commStateDataNew = {
                    id: Number(id),
                    commonStateData: createCommonStateData(modelNew.model.scales),
                };
                addColorsToScaleStates(modelNew.model.scales, commStateDataNew.commonStateData);

                currentModel[modelIx] = modelNew;
                commonStateDataArr[commStateDataIx] = commStateDataNew;

                setSession({
                    currentModel: [...currentModel],
                    commonStateDataArr: [...commonStateDataArr],
                });
            }
        }
    }

    function handleCloseClick() {
        const nextModels = currentModel.filter((m) => m.id !== Number(id));

        history.push(
            nextModels.length
                ? `/model/${nextModels[0].id}`
                : `/dashboard/${
                      model?.online ? DashboardView.OnlineModels : DashboardView.OfflineModels
                  }`,
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
                            <Grid item className={classes.visualizationItem}>
                                <ModelVisualization
                                    model={model}
                                    selectedState={selectedState}
                                    commonStateData={commonStateData}
                                    onStateSelected={setSelectedState}
                                />
                            </Grid>
                            <Grid item className={classes.visualizationItem}>
                                <StateVisualization
                                    model={model}
                                    selectedState={selectedState}
                                    commonStateData={commonStateData}
                                    onStateSelected={setSelectedState}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <StateDetails
                            className={classes.details}
                            model={model}
                            commonStateData={commonStateData}
                            selectedState={selectedState}
                            onFormChange={handleModelChange} // eslint-disable-line
                        />
                    </Grid>
                </Grid>
            )}
        </>
    );
}

export default Model;
