import React, { useState } from 'react';

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

import { DatasetAttribute } from '../api/models';
import { DialogOnCloseExt } from '../types/dialog';
import ModelConfiguration from './ModelConfiguration';
import DatasetConfiguration from './DatasetConfiguration';

import useStyles from './AddModelDialog.styles';

export interface AddModelDialogProps extends Omit<DialogProps, 'onClose'> {
    title: string;
    online?: boolean;
    onClose: DialogOnCloseExt;
}

function AddModelDialog({
    open,
    title,
    online: isOnline,
    onClose,
    ...other
}: AddModelDialogProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [isDatasetConfigReady, setIsDatasetConfigReady] = useState(false);
    const [datasetAttributes, setDatasetAttributes] = useState<DatasetAttribute[]>([]);
    const [datasetName, setDatasetName] = useState<string>('');
    const [dataSource, setDataSource] = useState<number>(0);
    const {
        formState: { isValid },
        // getValues,
    } = useFormContext();

    function handleCloseClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (onClose) {
            onClose(event, 'closeClick');
        }
    }

    function handleDatasetLoad(name: string, attributes: DatasetAttribute[], dataSourceId: number) {
        setDatasetName(name);
        setDatasetAttributes(attributes);
        setDataSource(dataSourceId);
    }

    function handleDatasetConfigChange(ready: boolean) {
        setIsDatasetConfigReady(ready);
    }

    return (
        <Dialog
            open={open}
            aria-labelledby="add-model-dialog-title"
            onClose={onClose}
            // fullWidth
            fullScreen
            {...other}
        >
            <DialogTitle id="add-model-dialog-title" className={classes.title} disableTypography>
                <Typography component="h2" variant="h6">
                    {title}
                </Typography>
                <Tooltip title={t('close_dialog')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                    <IconButton
                        className={classes.closeButton}
                        aria-label={t('close_dialog')}
                        edge="end"
                        onClick={handleCloseClick}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent className={classes.content} dividers>
                <Box className={classes.config}>
                    <DatasetConfiguration
                        online={isOnline}
                        onChange={handleDatasetConfigChange}
                        onLoad={handleDatasetLoad}
                    />
                    {isDatasetConfigReady && (
                        <ModelConfiguration
                            datasetName={datasetName}
                            datasetAttributes={datasetAttributes}
                            dataSource={dataSource}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={handleCloseClick}>
                    {t('cancel')}
                </Button>
                <Button
                    form="model-form"
                    type="submit"
                    color="secondary"
                    disabled={!isDatasetConfigReady || !isValid}
                    autoFocus
                >
                    {t('submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddModelDialog;
