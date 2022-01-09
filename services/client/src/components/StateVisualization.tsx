import React, { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import Box, { BoxProps } from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';

import useStyles from './StateVisualization.styles';
import { Model } from '../api/models';
import DecisionTree from './DecisionTree';
import StateHistory from './StateHistory';
import StateTime from './StateTime';
import Tab from './Tab';
import TabPanel, { getTabA11yProps } from './TabPanel';

export interface StateVisualizationProps extends BoxProps {
    model: Model;
    selectedState?:any;
    commonStateData:any;
    onStateSelected?:any;
}

function StateVisualization({ model, onStateSelected, selectedState, commonStateData, ...other }: StateVisualizationProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [tabs, setTabs] = useState<any>({
        stateHistory: {visible: true, index: 0},
        coordinates: {visible: true, index: 1},
        time: {visible: true, index: 2},
        explanationTree: {visible: true, index: 3},
    });
    const [tabsVisible, setTabsVisible] = useState(true);
    
    const stateTabPrefix = 'model-state';

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hide = params.get('hide');
        // console.log("hide=", hide);

        if(hide != null) {
            const stateHistoryVisible = hide.indexOf("state_history") === -1;
            const coordinatesVisible = hide.indexOf("coordinates") === -1;
            const timeVisible = hide.indexOf("time") === -1;
            const explanationTreeVisible = hide.indexOf("explanation_tree") === -1;
            const tabsNew = {...tabs}
            let index = 0;

            tabsNew.stateHistory.visible = stateHistoryVisible;
            tabsNew.stateHistory.index = stateHistoryVisible ? index: -1;

            if(stateHistoryVisible) {
                index += 1;
            }
            tabsNew.coordinates.visible = coordinatesVisible;
            tabsNew.coordinates.index = coordinatesVisible ? index: -1;

            if(coordinatesVisible) {
                index += 1;
            }
            tabsNew.time.visible = timeVisible;
            tabsNew.time.index = timeVisible ? index: -1;

            if(timeVisible) {
                index += 1;
            }
            tabsNew.explanationTree.visible = explanationTreeVisible;
            tabsNew.explanationTree.index = explanationTreeVisible ? index: -1;

            if(explanationTreeVisible) {
                index += 1;  
            }
            const areTabsVisible = Object.keys(tabsNew).some((key:any) => tabsNew[key].visible);
            setTabsVisible(areTabsVisible);
            setTabs(tabsNew);
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    function handleTabChange(event: React.ChangeEvent<Record<string, never>>, newValue: number) {
        setTabValue(newValue);
    }

    return (
      
        <>
            {tabsVisible && commonStateData && (
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

                            {tabs.stateHistory.visible ? (
                                <Tab
                                    value={tabs.stateHistory.index}
                                    label={t('state_history')}
                                        {...getTabA11yProps(tabs.stateHistory.index, stateTabPrefix)}
                                />) : null}

                            {tabs.coordinates.visible ? (
                                <Tab
                                    value={tabs.coordinates.index}
                                    label={t('coordinates')}
                                    {...getTabA11yProps(tabs.coordinates.index, stateTabPrefix)}
                                />
                            ): null}

                            {tabs.time.visible ? (
                                <Tab 
                                    value={tabs.time.index} 
                                    label={t('time')} 
                                    {...getTabA11yProps(tabs.time.index, stateTabPrefix)}
                                />
                            ): null}

                            {tabs.explanationTree.visible ? (
                                <Tab
                                    value={tabs.explanationTree.index}
                                    label={t('explanation_tree')}
                                    {...getTabA11yProps(tabs.explanationTree.index, stateTabPrefix)}
                                />
                            ): null}

                        </Tabs>
                    </Paper>
                    <TabPanel value={tabValue} index={tabs.stateHistory.index} prefix={stateTabPrefix}>
                        <StateHistory model={model} selectedState={selectedState} commonStateData={commonStateData} onStateSelected={(stateCurr:any)=> {
                            onStateSelected(stateCurr)
                        }

                        } />
                    </TabPanel>
                    <TabPanel value={tabValue} index={tabs.coordinates.index} prefix={stateTabPrefix}>
                        {t('coordinates')}
                    </TabPanel>
                    <TabPanel value={tabValue} index={tabs.time.index} prefix={stateTabPrefix}>
                        <StateTime model={model} selectedState={selectedState} commonStateData={commonStateData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={tabs.explanationTree.index} prefix={stateTabPrefix}>
                        <DecisionTree selectedState={selectedState} commonStateData={commonStateData}/>
                    </TabPanel>
            </Box>
          )}
        
        </>
    );
}

export default StateVisualization;
