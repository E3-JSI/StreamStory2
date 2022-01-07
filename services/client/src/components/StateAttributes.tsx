import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';  
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import useStyles from './StateDetails.styles';
import {createCommonStateData} from '../utils/markovChainUtils';
import { StateDetailsProps } from './StateDetails';
import Histogram from './Histogram';

const StateAttributes = ({ model, selectedState, ...other }: StateDetailsProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [windowSize] = useState<any>({ width: undefined, height: undefined });
    const [histograms, setHistograms] = useState<any>([]);
    const [totalHistograms, setTotalHistograms] = useState<any>([]);

    useEffect(() => {   
        if(selectedState && model && model.model && model.model.scales) {
            const {hists, totalHists} = createHistogramsAndTotalHistograms();
            setHistograms(hists);
            setTotalHistograms(totalHists)
        }
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps

    function createHistogramsAndTotalHistograms() {
        const rez:any = {hists: null, totalHists:null};

        if(selectedState && model && model.model && model.model.scales) {
            const commonStateData = createCommonStateData(model.model.scales);
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

    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));
    
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
                                
                                <Item>
                                        <Histogram
                                            histogram={hist}
                                            totalHistogram={totalHistograms[i]}
                                            key={selectedState.stateNo + Math.random()}
                                            />
                                            <h4>{hist.attrName}</h4>
                                </Item>

                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ): (<></>)}
        </>
        );
};

export default StateAttributes;
