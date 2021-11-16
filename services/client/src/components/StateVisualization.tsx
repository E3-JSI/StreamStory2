import React, { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import Box, { BoxProps } from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';

import { Model } from '../api/models';
import Tab from './Tab';
import TabPanel, { getTabA11yProps } from './TabPanel';

import useStyles from './StateVisualization.styles';
import Histogram from './Histogram';

export interface StateVisualizationProps extends BoxProps {
    model?: Model;
    selectedState?:any;
}

function StateVisualization({ model, selectedState, ...other }: StateVisualizationProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [histogram, setHistogram] = useState<any>();
    const [totalHistogram, setTotalHistogram] = useState<any>();
    
    const stateTabPrefix = 'model-state';

    useEffect(() => {
        if(selectedState != null) {
            const histIx = selectedState.histograms.findIndex((hist:any)=> ((hist.attrName.toLowerCase() === 'time') || (hist.attrName.toLowerCase() === 'timestamp')));
           const currHist = selectedState.histograms[histIx];
            const totalHist = model?.model?.totalHistograms[histIx];
            setTotalHistogram(totalHist);
            
            console.log("currHist=",currHist);
    
            if(currHist) {
                setHistogram(currHist);
            }
        }
       
    }, [selectedState]) // eslint-disable-line react-hooks/exhaustive-deps


    function handleTabChange(event: React.ChangeEvent<Record<string, never>>, newValue: number) {
        setTabValue(newValue);
    }

    return (
        <Box {...other}>
            <Paper className={classes.tabsPaper} square>
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


                {selectedState &&  <>
                    <Histogram
                    histogram={histogram}
                    totalHistogram={totalHistogram}
                    timeType={"hourOfDay"} // eslint-disable-line react/jsx-curly-brace-presence
                    key={selectedState?.stateNo + Math.random()}
                    />

                <h4>Hour of Day</h4>

                <Histogram
                    histogram={histogram}
                    totalHistogram={totalHistogram}
                    timeType={"dayOfWeek"}  // eslint-disable-line react/jsx-curly-brace-presence
                    key={selectedState?.stateNo + Math.random()}
                    />

                <h4>Day of Week</h4>

                <Histogram
                    histogram={histogram}
                    totalHistogram={totalHistogram}
                    timeType={"month"} // eslint-disable-line react/jsx-curly-brace-presence
                    key={selectedState?.stateNo + Math.random()}
                    />

               <h4>Month</h4>

                </>
                }

            </TabPanel>
            <TabPanel value={tabValue} index={3} prefix={stateTabPrefix}>
                {t('explanation_tree')}
            </TabPanel>
        </Box>
    );
}

export default StateVisualization;
