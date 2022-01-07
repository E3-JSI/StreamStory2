import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';  
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import useStyles from './StateAttributes.styles';
import {createCommonStateData} from '../utils/markovChainUtils';
import { StateDetailsProps } from './StateDetails';
import Histogram from './Histogram';

const StateAttributes = ({ model, selectedState, commonStateData }: any) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [windowSize] = useState<any>({ width: undefined, height: undefined });
    const [histograms, setHistograms] = useState<any>([]);
    const [totalHistograms, setTotalHistograms] = useState<any>([]);

    useEffect(() => {   
        if(commonStateData != null && selectedState && model && model.model && model.model.scales) {
            console.log("commonStateData=", commonStateData)
            const {hists, totalHists} = createHistogramsAndTotalHistograms();
            setHistograms(hists);
            setTotalHistograms(totalHists)
        }
    }, [selectedState, commonStateData]); // eslint-disable-line react-hooks/exhaustive-deps

    function createHistogramsAndTotalHistograms() {
        const rez:any = {hists: null, totalHists:null};

        if(selectedState && model && model.model && model.model.scales) {
            const key = selectedState.initialStates.toString();
            const histIndices = commonStateData[key].histograms
            .map((hist:any, ix:any) => ((hist.attrName.toLowerCase() !== 'time') && (hist.attrName.toLowerCase() !== 'timestamp')) ? ix: null)
            .filter((el:any)=> el!= null);

            const hists:any[] =[]
            const totalHists:any[] =[]

            for(let i = 0; i<  histIndices.length; i++) {
                if(model && model.model && model.model.totalHistograms) {
                    const index = histIndices[i];
                    const hist = commonStateData[key].histograms[index];

                    if(Object.prototype.hasOwnProperty.call(hist, 'bounds')) { // if not time hists
                        hists.push(commonStateData[key].histograms[index]);
                        totalHists.push(model.model.totalHistograms[index]);
                    }
               }
            }
            rez.hists = hists;
            rez.totalHists = totalHists;
        }
        return rez;
    }

    return (
        <>
          {(histograms && totalHistograms && histograms.length && totalHistograms.length) ? (
                <Box>
                    <Typography className={classes.attributesTitle} component="h3">
                        {t('attributes')}
                    </Typography>
                    <Grid container spacing={1}>
                        {histograms.map((hist: any, i: number) => (
                            <Grid key={hist.attrName} item xs={6}>
                                
                                <div className={classes.histogramBox}>
                                        <Histogram
                                            histogram={hist}
                                            totalHistogram={totalHistograms[i]}
                                            key={selectedState.stateNo + Math.random()}
                                            />
                                            <h4>{hist.attrName}</h4>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ): (<></>)}
        </>
        );
};

export default StateAttributes;
