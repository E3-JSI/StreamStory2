import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';

import LoadingButton from './LoadingButton';

function StateDetailsForm({ model, selectedState, commonStateData }: any): JSX.Element {
    const { t } = useTranslation();

    const [label] = useState(commonStateData[selectedState.initialStates.toString()].suggestedLabel.label);
    const [isEvent, setIsEvent] = useState(true);

    function handleSubmit(event:any) {
        event.preventDefault(); // prevent refresh after submit
        
        console.log("start: handleSubmit, modelId=", model.id);

        const payload = {
            initialStates: selectedState.initialStates.toString(),
            stateName: event.target.stateName.value,
            stateDescription: event.target.stateDescription.value,
            eventId: (isEvent && event.target.eventId.value ? event.target.eventId.value: null),
        }

        console.log("payload=", payload);
    }

    function handleChange(event:any, value:any) {
        setIsEvent(value);
    }

    return (
        <form onSubmit={handleSubmit}>
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

        <Grid 
            // className={classes.formButtons}
            spacing={1} 
            container>
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
                    // disabled
                    startIcon={<SaveIcon />}
                >
                    {t('save')}
                </LoadingButton>
            </Grid>}
        </Grid>
    </form>

        

    );
}

export default StateDetailsForm;
