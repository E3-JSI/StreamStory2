import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TuneIcon from '@material-ui/icons/Tune';

import { Model } from '../api/models';
import AlertPopup from './AlertPopup';
import TransHtml from './TransHtml';

import useStyles from './ModelVisualization.styles';
import MarkovChain from './MarkovChain';

export interface ModelVisualizationProps extends PaperProps {
    model: Model;
    selectedState?: any;
    onStateSelected?: any;
}

function ModelVisualization({
    model,
    selectedState,
    onStateSelected,
    ...other
}: ModelVisualizationProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();

    return (
        <Paper {...other}>
            <Toolbar className={classes.toolbar} variant="dense">
                <Typography className={classes.title} component="h2" variant="h6">
                    {t('visualization')}
                    <AlertPopup severity="info" placement="end">
                        <TransHtml i18nKey="visualization_panel_description" />
                    </AlertPopup>
                </Typography>
                <Box className={classes.buttons}>
                    <Tooltip title={t('options')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                        <IconButton size="small" edge="end">
                            <TuneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
            <Divider />
            {/* Replace with Markov model */}

            <MarkovChain
                model={model}
                selectedState={selectedState}
                onStateSelected={onStateSelected}
            />

            {/* <Box p={2} overflow="auto" height={600}>
                <Typography component="pre" style={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(model, null, 2)}
                </Typography>
            </Box> */}
        </Paper>
    );
}

export default ModelVisualization;
