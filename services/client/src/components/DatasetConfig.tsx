import React, { useRef, useState } from 'react';

import axios, { Canceler } from 'axios';
import clsx from 'clsx';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Alert, { Color } from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';

import { getResponseErrors } from '../utils/errors';
import { formatDataSize } from '../utils/misc';
import useSnackbar from '../hooks/useSnackbar';
import ConfirmationDialog from './ConfirmationDialog';
import Fieldset from './Fieldset';
import TransHtml from './TransHtml';

import useStyles from './DatasetConfig.styles';

enum UploadState {
    Ready,
    Uploading,
    Success,
    Failure,
}

export interface DatasetAttribute {
    name: string;
    numeric: boolean;
}

export interface DatasetConfigProps {
    onLoad: (name: string, attributes: DatasetAttribute[]) => void;
    onChange: (ready: boolean) => void;
}

function getUploadProgress(loaded: number, total: number): number {
    return (loaded / total) * 100;
}

function getUploadSpeed(loaded: number, startTime: number): number {
    const dt = (Date.now() - startTime) / 1000; // seconds
    return loaded / dt;
}

function DatasetConfig({ onChange, onLoad }: DatasetConfigProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [uploadState, setUploadState] = useState<UploadState>(UploadState.Ready);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [isRemoveFileDialogOpen, setIsRemoveFileDialogOpen] = useState(false);
    const [showSnackbar] = useSnackbar();
    const cancelUpload = useRef<Canceler | null>(null);
    const isUploading = uploadState === UploadState.Uploading;
    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        isDragActive,
        open: openFileDialog,
    } = useDropzone({
        accept: '.csv',
        disabled: isUploading,
        multiple: false,
        noClick: true,
        noKeyboard: true,
        onDrop: handleDropFile,
    });

    async function handleDropFile(files: Blob[]) {
        const file: Blob = files[0];

        setUploadState(UploadState.Uploading);
        setUploadProgress(0);
        setUploadSpeed(0);
        onChange(false);

        try {
            const data = new FormData();
            data.append('file', file);

            const uploadStartTime = Date.now();
            const response = await axios.post('/api/models/data', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                cancelToken: new axios.CancelToken((c: Canceler) => {
                    cancelUpload.current = c;
                }),
                onUploadProgress: (event: ProgressEvent) => {
                    setUploadProgress(getUploadProgress(event.loaded, event.total));
                    setUploadSpeed(getUploadSpeed(event.loaded, uploadStartTime));
                },
            });
            const attributes = response.data.attributes as DatasetAttribute[];

            if (attributes) {
                if (attributes.length > 1) {
                    // Success
                    setUploadState(UploadState.Success);
                    onLoad((file as File).name, attributes);
                    onChange(true);
                } else {
                    // Invalid data file
                    setUploadState(UploadState.Failure);
                }
            }
        } catch (error) {
            setUploadState(UploadState.Ready);

            const responseErrors = getResponseErrors(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            }
        }
    }

    async function handleRemoveFileDialogAccept() {
        setIsRemoveFileDialogOpen(false);

        try {
            const response = await axios.delete('/api/models/data');

            if (response.data.success) {
                setUploadState(UploadState.Ready);
                onChange(false);
                showSnackbar({
                    message: t('file_has_been_removed', {
                        name: acceptedFiles[0].name,
                    }),
                    severity: 'success',
                });
            }
        } catch (error) {
            const responseErrors = getResponseErrors(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            }
        }
    }

    function handleRemoveFileDialogClose() {
        setIsRemoveFileDialogOpen(false);
    }

    function handleRemoveFileButtonClick() {
        setIsRemoveFileDialogOpen(true);
    }

    function handleCancelUploadButtonClick() {
        if (cancelUpload.current !== null) {
            cancelUpload.current(t('error.file_upload_cancelled'));
        }

        setUploadState(UploadState.Ready);
    }

    return (
        <form>
            <Fieldset
                legend={t('load_dataset')}
                gutterBottom
            >
                <Alert className={classes.info} severity="info">
                    <TransHtml i18nKey="upload_CSV_description" />
                </Alert>
                <FormControl margin="normal" fullWidth>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        {...getRootProps({
                            className: clsx(classes.dropzone, {
                                [classes.dropzoneActive]: isDragActive,
                            }),
                        })}
                    >
                        <input {...getInputProps()} />
                        <CloudUploadIcon
                            className={classes.dropzoneIcon}
                            fontSize="large"
                            color="disabled"
                        />
                        <Typography
                            className={classes.dropzoneText}
                            variant="body1"
                            color={isUploading ? 'textSecondary' : 'textPrimary'}
                        >
                            {t('drag_and_drop_CSV_file')}
                            <em> {t('or')}</em>
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={openFileDialog}
                            disabled={isUploading}
                        >
                            {t('click_here_to_select_file')}
                        </Button>
                    </Box>
                    {uploadState > UploadState.Ready && acceptedFiles.length > 0 && (
                        <Alert
                            className={classes.uploadInfo}
                            classes={{
                                icon: classes.uploadInfoIcon,
                                message: classes.uploadInfoContent,
                            }}
                            severity={['info', 'info', 'success', 'error'][uploadState] as Color}
                            icon={isUploading ? <DescriptionIcon /> : undefined}
                        >
                            <Box display="flex" justifyContent="space-between">
                                <Typography
                                    className={classes.uploadFileName}
                                    variant="body2"
                                    noWrap
                                >
                                    {acceptedFiles[0].name}
                                </Typography>
                                {uploadState < UploadState.Failure && (
                                    <Tooltip
                                        title={isUploading ? t('cancel_upload') : t('remove_file')}
                                        enterDelay={muiTheme.timing.tooltipEnterDelay}
                                    >
                                        <IconButton
                                            className={classes.uploadCancelButton}
                                            size="small"
                                            edge="end"
                                            onClick={
                                                isUploading
                                                    ? handleCancelUploadButtonClick
                                                    : handleRemoveFileButtonClick
                                            }
                                        >
                                            {isUploading ? (
                                                <CloseIcon fontSize="small" />
                                            ) : (
                                                <DeleteIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {uploadState === UploadState.Success && (
                                    <ConfirmationDialog
                                        id="remove-file-dialog"
                                        title={t('remove_file')}
                                        content={
                                            <TransHtml
                                                i18nKey="remove_file_confirmation"
                                                values={{
                                                    name: acceptedFiles[0].name,
                                                }}
                                            />
                                        }
                                        open={isRemoveFileDialogOpen}
                                        onClose={handleRemoveFileDialogClose}
                                        onAccept={handleRemoveFileDialogAccept}
                                        onDecline={handleRemoveFileDialogClose}
                                    />
                                )}
                            </Box>
                            <LinearProgress
                                key={`progress-${!!uploadProgress}`}
                                className={clsx(classes.uploadProgress, {
                                    [classes.uploadProgressSuccess]:
                                        uploadState === UploadState.Success,
                                    [classes.uploadProgressError]:
                                        uploadState === UploadState.Failure,
                                })}
                                variant="determinate"
                                value={uploadProgress}
                            />
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="caption" color="textSecondary">
                                    {isUploading &&
                                        `${formatDataSize(
                                            (uploadProgress * acceptedFiles[0].size) / 100,
                                        )} ${t('of')} `}
                                    {`${formatDataSize(acceptedFiles[0].size)} (${Math.round(
                                        uploadProgress,
                                    )}%)`}
                                </Typography>
                                <Typography
                                    className={classes.uploadSpeed}
                                    variant="caption"
                                    align="right"
                                    color="textSecondary"
                                >
                                    {`${formatDataSize(uploadSpeed)}/s`}
                                </Typography>
                            </Box>
                            {uploadState > UploadState.Uploading && (
                                <Typography className={classes.uploadMessage} variant="body2">
                                    {uploadState === UploadState.Success
                                        ? t('dataset_successfully_uploaded')
                                        : t('invalid_dataset_instructions')}
                                </Typography>
                            )}
                        </Alert>
                    )}
                </FormControl>
            </Fieldset>
        </form>
    );
}

export default DatasetConfig;
