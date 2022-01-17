import React, { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { Divider, Paper, Toolbar, Typography } from '@material-ui/core';
import { getModelWithApiKey, Model as ModelType } from '../api/models';
import useMountEffect from '../hooks/useMountEffect';
import useSession from '../hooks/useSession';
import ModelVisualization from '../components/ModelVisualization';
import StateVisualization from '../components/StateVisualization';
import PageTitle from '../components/PageTitle';
import useStyles from './ModelIframe.styles';
import { addColorsToScaleStates, createCommonStateData } from '../utils/markovChainUtils';
import StateAttributes from '../components/StateAttributes';

export interface ModelUrlParams {
    id: string;
}

function ModelIframe(): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const { id } = useParams<ModelUrlParams>();
    const [{ currentModel, commonStateDataArr }, setSession] = useSession();
    const model = currentModel.find((m) => m.id === Number(id));
    const { commonStateData } = commonStateDataArr.find((m) => m.id === Number(id)) || {};
    const [isLoading, setIsLoading] = useState(!model);
    const [selectedState, setSelectedState] = useState<any>();
    const [stateDetailsVisible, setStateDetailsVisible] = useState(true);
    const [label, setLabel] = useState<any>();

    useMountEffect(() => {
        async function loadModel() {
            try {
                const params = new URLSearchParams(window.location.search);
                const hide = params.get('hide');
                const apiKey = params.get('apiKey');

                if (hide != null) {
                    setStateDetailsVisible(hide.indexOf('state_details') === -1);
                }

                if (apiKey && apiKey !== '') {
                    const response = await getModelWithApiKey(Number(id), apiKey);

                    if (response.data.model) {
                        const modelNew = response.data.model as ModelType;
                        const commStateDataNew = {
                            id: Number(id),
                            commonStateData: createCommonStateData(modelNew.model.scales),
                        };
                        addColorsToScaleStates(
                            modelNew.model.scales,
                            commStateDataNew.commonStateData,
                        );

                        setSession({
                            currentModel: [modelNew, ...currentModel],
                            commonStateDataArr: [commStateDataNew, ...commonStateDataArr],
                        });
                    }
                    setIsLoading(false);
                }
            } catch (ex) {
                setIsLoading(false);
            }
        }

        if (!model) {
            loadModel();
        }
    });

    useEffect(() => {
        if (selectedState && model && model.model && model.model.scales) {
            const key = selectedState.initialStates.toString();
            setLabel(commonStateData[key].suggestedLabel.label);
        }
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Box display="flex" justifyContent="space-between">
                <PageTitle gutterBottom>
                    {isLoading ? t('loading_model') : model?.name || t('model_not_found')}
                </PageTitle>
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
                        <Paper key={label}>
                            <Toolbar className={classes.toolbar} variant="dense">
                                <Typography className={classes.title} component="h2" variant="h6">
                                    {t('details')}
                                </Typography>
                            </Toolbar>
                            <Divider />

                            {selectedState && commonStateData && (
                                <Box p={2}>
                                    <StateAttributes
                                        model={model}
                                        selectedState={selectedState}
                                        commonStateData={commonStateData}
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </>
    );
}

export default ModelIframe;
