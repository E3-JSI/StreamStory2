import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useStyles from './StateAttributes.styles';
import Histogram from './Histogram';

export interface StateAttributesProps {
    model: any; // eslint-disable-line
    selectedState: any; // eslint-disable-line
    commonStateData: any; // eslint-disable-line
}

const StateAttributes = ({
    model,
    selectedState,
    commonStateData,
}: StateAttributesProps): JSX.Element => {
    const { t } = useTranslation();
    const classes = useStyles();
    const [histograms, setHistograms] = useState<any[]>(); // eslint-disable-line
    const [totalHistograms, setTotalHistograms] = useState<any[]>(); // eslint-disable-line

    useEffect(() => {
        if (
            commonStateData != null &&
            selectedState &&
            model &&
            model.model &&
            model.model.scales
        ) {
            const { hists, totalHists } = createHistogramsAndTotalHistograms();
            setHistograms(hists);
            setTotalHistograms(totalHists);
        }
    }, [selectedState, commonStateData]); // eslint-disable-line react-hooks/exhaustive-deps

    function createHistogramsAndTotalHistograms() {
        const rez: any = { hists: null, totalHists: null }; // eslint-disable-line

        if (selectedState && model && model.model && model.model.scales) {
            const key = selectedState.initialStates.toString();
            const histIndices = commonStateData[key].histograms.map((h: any, ix: number) => ix); // eslint-disable-line
            const hists = []; // eslint-disable-line
            const totalHists = []; // eslint-disable-line

            for (let i = 0; i < histIndices.length; i++) {
                if (model && model.model && model.model.totalHistograms) {
                    const index = histIndices[i];
                    const hist = commonStateData[key].histograms[index];
                    // if not time hists
                    if (Object.prototype.hasOwnProperty.call(hist, 'bounds')) {
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
            {histograms && totalHistograms && histograms.length && totalHistograms.length ? (
                <Box>
                    <Typography className={classes.attributesTitle} component="h3">
                        {t('attributes')}
                    </Typography>
                    <Grid container spacing={1}>
                        {histograms.map(
                            (
                                hist: any, // eslint-disable-line
                                i: number,
                            ) => (
                                <Grid key={hist.attrName} item xs={6} md={4} xl={2}>
                                    <div className={classes.histogramBox}>
                                        <Histogram
                                            histogram={hist}
                                            totalHistogram={totalHistograms[i]}
                                            key={selectedState.stateNo + Math.random()}
                                        />
                                        <h4>{hist.attrName}</h4>
                                    </div>
                                </Grid>
                            ),
                        )}
                    </Grid>
                </Box>
            ) : (
                <></>
            )}
        </>
    );
};

export default StateAttributes;
