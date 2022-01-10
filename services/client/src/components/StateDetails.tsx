import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Model, updateModel } from '../api/models';
import useStyles from './StateDetails.styles';
import StateAttributes from './StateAttributes';
import StateDetailsForm from './StateDetailsForm';

export interface StateDetailsProps extends PaperProps {
    model?: Model;
    commonStateData:any;
    selectedState?: any;
}

function StateDetails({ model, selectedState, commonStateData, onFormChange, ...other }: any): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    const [label, setLabel] = useState<any>();

    useEffect(()=> {
        if(selectedState && model && model.model && model.model.scales) {
            const key = selectedState.initialStates.toString();
            setLabel(commonStateData[key].suggestedLabel.label);
        }  
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleOnFormChange(modelNew:any) {
        onFormChange(modelNew);
    }

    return (
        <Paper key={label} {...other}>
            <Toolbar className={classes.toolbar} variant="dense">
                <Typography className={classes.title} component="h2" variant="h6">
                    {t('details')}
                </Typography>
            </Toolbar>
            <Divider />

            {selectedState && commonStateData && (
                <Box p={2}>
                    <StateDetailsForm model={model} selectedState={selectedState} commonStateData={commonStateData} onFormChange={handleOnFormChange} />
                    <StateAttributes model={model} selectedState={selectedState} commonStateData={commonStateData} />

                </Box>
            )}
        </Paper>
    );
}

export default StateDetails;
