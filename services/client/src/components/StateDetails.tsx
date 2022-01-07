import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';

import LoadingButton from './LoadingButton';

import { Model, updateModel } from '../api/models';
import useStyles from './StateDetails.styles';
import { createCommonStateData } from '../utils/markovChainUtils';
import StateAttributes from './StateAttributes';

export interface StateDetailsProps extends PaperProps {
    model?: Model;
    selectedState?: any;
}

function StateDetails({ model, selectedState, ...other }: StateDetailsProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    const [label, setLabel] = useState<any>();
    const [isEvent, setIsEvent] = useState(true);

    useEffect(()=> {
        if(selectedState && model && model.model && model.model.scales) {
            const commonStateData = createCommonStateData(model.model.scales);
            const key = selectedState.initialStates.toString();
            setLabel(commonStateData[key].suggestedLabel.label);
        }  
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleChange(event:any, value:any) {
        setIsEvent(value);
    }

    function updateModelForm() {
        console.log("start: updateModelForm");
        console.log("end: updateModelForm");
    }

    return (
        <Paper key={label} {...other}>
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
                            defaultValue={label}
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

                        <FormControlLabel
                            label={t('is_event')}
                            control={
                                <Checkbox
                                checked={isEvent}
                                onChange={handleChange}
                                name="isEvent"
                                color="primary"
                                />
                            }
                        />

                        {isEvent && (
                            <TextField
                                name="eventId"
                                label={t('event_id')}
                                variant="standard"
                                margin="normal"
                                fullWidth
                            />
                        )}

                        <Grid className={classes.formButtons} spacing={1} container>
                            {<Grid item>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="secondary"
                                    startIcon={<CancelIcon />}
                                    // onClick={handleCancelButtonClick}
                                >
                                    {t('cancel')}
                                </Button>
                            </Grid> }
                            {<Grid item>
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
                            </Grid>}
                        </Grid>
                    </form>

                    <StateAttributes model={model} selectedState={selectedState} />

                </Box>
            )}
        </Paper>
    );
}

export default StateDetails;
