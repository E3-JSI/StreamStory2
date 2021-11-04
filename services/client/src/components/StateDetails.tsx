import React from 'react';

import { useTranslation } from 'react-i18next';
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

export interface StateDetailsProps extends PaperProps {
    model?: Model;
}

function StateDetails({ /* model, */ ...other }: StateDetailsProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Paper {...other}>
            <Toolbar className={classes.toolbar} variant="dense">
                <Typography className={classes.title} component="h2" variant="h6">
                    {t('details')}
                </Typography>
            </Toolbar>
            <Divider />
            <Box p={2}>
                <form>
                    <TextField
                        name="stateName"
                        label={t('state_name')}
                        defaultValue="Rainfall"
                        // variant="standard"
                        margin="none"
                        InputLabelProps={{
                            required: true,
                        }}
                        fullWidth
                    />
                    <TextField
                        name="stateDescription"
                        label={t('description')}
                        // variant="standard"
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
                                // loading={isSubmitting}
                                // disabled={!isDirty}
                                disabled
                                startIcon={<SaveIcon />}
                            >
                                {t('save')}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </form>
                <Typography className={classes.attributesTitle} component="h3">
                    {t('attributes')}
                </Typography>
            </Box>
        </Paper>
    );
}

export default StateDetails;
