import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SaveIcon from '@material-ui/icons/Save';

import { Model } from '../api/models';
import LoadingButton from './LoadingButton';

import useStyles from './StateDetails.styles';
import Histogram from './Histogram';

export interface StateDetailsProps extends PaperProps {
    model?: Model;
    selectedState?: any;
}

function StateDetails({ model, selectedState, ...other }: StateDetailsProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    const [histograms, setHistograms] = useState<any>([]);
    const [totalHistograms, setTotalHistograms] = useState<any>([]);

    useEffect(()=> {
        if(selectedState) {
            console.log("selectedState=", selectedState.suggestedLabel.label)
            const histIndices = selectedState.histograms
            .map((hist:any, ix:any) => ((hist.attrName.toLowerCase() !== 'time') && (hist.attrName.toLowerCase() !== 'timestamp')) ? ix: null)
            .filter((el:any)=> el!= null);

            const hists:any[] =[]
            const totalHists:any[] =[]


            for(let i = 0; i<  histIndices.length; i++) {

                if(model && model.model && model.model.totalHistograms) {
                    const index = histIndices[i];
                    hists.push(selectedState.histograms[index]);
                    totalHists.push(model.model.totalHistograms[index]);
               } else {
                   console.log("problem!!")
               }
            }

            console.log("hists=", hists)
            console.log("totalHists=", totalHists)

            setHistograms(hists);
            setTotalHistograms(totalHists)
        }
    
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps


    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    return (
        <Paper key={selectedState?.suggestedLabel?.label} {...other}>
            <Toolbar className={classes.toolbar} variant="dense">
                <Typography className={classes.title} component="h2" variant="h6">
                    {t('details')}
                </Typography>
            </Toolbar>
            <Divider />
            {selectedState && (
                <Box p={2}>
                    <form>
                        <TextField
                            name="stateName"
                            label={t('state_name')}
                            defaultValue={selectedState.suggestedLabel.label}
                            variant="standard"
                            margin="none"
                            InputLabelProps={{
                                required: true,
                            }}
                            fullWidth
                        />
                        <TextField
                            name="stateDescription"
                            label={t('description')}
                            variant="standard"
                            margin="normal"
                            // rows={3}
                            multiline
                            fullWidth
                        />
                        <Grid className={classes.formButtons} spacing={1} container>
                            {/* <Grid item>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="secondary"
                                    startIcon={<CancelIcon />}
                                    // onClick={handleCancelButtonClick}
                                >
                                    {t('cancel')}
                                </Button>
                            </Grid> */}
                            <Grid item>
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    // loading={isSubmitting}s
                                    // disabled={!isDirty}
                                    disabled
                                    startIcon={<SaveIcon />}
                                >
                                    {t('save')}
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </form>
                    {(histograms.length && totalHistograms.length) ? (
                        <Box>
                            <Typography className={classes.attributesTitle} component="h3">
                                {t('attributes')}
                            </Typography>
                            <Grid container spacing={2}>
                                {histograms.map((histogram: any, i: number) => (
                                    <Grid key={histogram.attrName} item xs={6}>
                                        <Item>
                                            <Histogram
                                                histogram={histogram}
                                                totalHistogram={totalHistograms[i]}
                                                key={selectedState.stateNo + Math.random()}
                                                />
                                                <h4>{histogram.attrName}</h4>
                                        </Item>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ): <></>}
                </Box>
            )}
        </Paper>
    );
}

export default StateDetails;
