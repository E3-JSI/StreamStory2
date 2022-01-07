import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Box, { BoxProps } from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

import { Model } from '../api/models';

import useStyles from './StateVisualization.styles';
import Histogram from './Histogram';
import { createCommonStateData } from '../utils/markovChainUtils';

export interface StateVisualizationProps extends BoxProps {
    model: Model;
    selectedState?:any;
    onStateSelected?:any;
}

function StateTime({ model, selectedState, commonStateData }: any): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    
    const [histogram, setHistogram] = useState<any>();
    const [totalHistogram, setTotalHistogram] = useState<any>();
    const [tabs, setTabs] = useState<any>({
        stateHistory: {visible: true, index: 0},
        coordinates: {visible: true, index: 1},
        time: {visible: true, index: 2},
        explanationTree: {visible: true, index: 3},
    });
    
    useEffect(() => {
        if(selectedState != null && commonStateData != null && model && model.model && model.model.scales) {
            const key = selectedState.initialStates.toString();
            const histIx = commonStateData[key].histograms.findIndex((hist:any)=> !Object.prototype.hasOwnProperty.call(hist, 'bounds'));
            const currHist = commonStateData[key].histograms[histIx];
            const totalHist = model.model.totalHistograms[histIx];
            setTotalHistogram(totalHist);
                
            if(currHist) {
                setHistogram(currHist);
            }
        }
       
    }, [selectedState, commonStateData]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {selectedState &&  (
                <>

                    <Histogram
                    histogram={histogram}
                    totalHistogram={totalHistogram}
                    timeType={"hourOfDay"} // eslint-disable-line react/jsx-curly-brace-presence
                    key={selectedState?.stateNo + Math.random()}
                    />
                    <h4>{t('hour_of_day')}</h4>

                    <Divider />

                    <Histogram
                        histogram={histogram}
                        totalHistogram={totalHistogram}
                        timeType={"dayOfWeek"}  // eslint-disable-line react/jsx-curly-brace-presence
                        key={selectedState?.stateNo + Math.random()}
                        />
                    <h4>{t('day_of_week')}</h4>

                    <Divider />

                    <Histogram
                        histogram={histogram}
                        totalHistogram={totalHistogram}
                        timeType={"month"} // eslint-disable-line react/jsx-curly-brace-presence
                        key={selectedState?.stateNo + Math.random()}
                        />
                    <h4>{t('month')}</h4>

                    <Divider />
                </>
                )}
        </> 
    );
}

export default StateTime;
