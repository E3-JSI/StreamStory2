import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import Box, { BoxProps } from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';

import { Model } from '../types/api';
import Tab from './Tab';
import TabPanel, { getTabA11yProps } from './TabPanel';

// import useStyles from './StateVisualization.styles';

export interface StateVisualizationProps extends BoxProps {
    model?: Model;
}

function StateVisualization({ /* model, */ ...other }: StateVisualizationProps): JSX.Element {
    // const classes = useStyles();
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);

    const stateTabPrefix = 'model-state';

    function handleTabChange(event: React.ChangeEvent<Record<string, never>>, newValue: number) {
        setTabValue(newValue);
    }

    return (
        <Box {...other}>
            <Paper square>
                <Tabs
                    value={tabValue}
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                    aria-label={t('model_state')}
                    // centered
                >
                    <Tab
                        value={0}
                        label={t('state_history')}
                        {...getTabA11yProps(0, stateTabPrefix)}
                    />
                    <Tab
                        value={1}
                        label={t('coordinates')}
                        {...getTabA11yProps(1, stateTabPrefix)}
                    />
                    <Tab value={2} label={t('time')} {...getTabA11yProps(2, stateTabPrefix)} />
                    <Tab
                        value={3}
                        label={t('explanation_tree')}
                        {...getTabA11yProps(3, stateTabPrefix)}
                    />
                </Tabs>
            </Paper>
            <TabPanel value={tabValue} index={0} prefix={stateTabPrefix}>
                {t('state_history')}
            </TabPanel>
            <TabPanel value={tabValue} index={1} prefix={stateTabPrefix}>
                {t('coordinates')}
            </TabPanel>
            <TabPanel value={tabValue} index={2} prefix={stateTabPrefix}>
                {t('time')}
            </TabPanel>
            <TabPanel value={tabValue} index={3} prefix={stateTabPrefix}>
                {t('explanation_tree')}
            </TabPanel>
        </Box>
    );
}

export default StateVisualization;
