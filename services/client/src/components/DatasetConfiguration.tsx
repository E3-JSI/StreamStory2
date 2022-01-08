import React, { useRef, useState } from 'react';

import axios, { Canceler } from 'axios';
import clsx from 'clsx';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Alert, { Color } from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DescriptionIcon from '@material-ui/icons/Description';
import EditIcon from '@material-ui/icons/Edit';
import HomeIcon from '@material-ui/icons/Home';
import LabelIcon from '@material-ui/icons/Label';
import UpdateIcon from '@material-ui/icons/Update';

import { getDataSources, deleteDataSource, DataSource } from '../api/dataSources';
import { deleteData, loadDataSource, uploadData, DatasetAttribute } from '../api/models';
import { getResponseErrors } from '../utils/errors';
import { formatDataSize, formatTimeInterval } from '../utils/misc';
import useSnackbar from '../hooks/useSnackbar';
import ConfirmationDialog from './ConfirmationDialog';
import DataSourceDialog, { DataSourceDialogState } from './DataSourceDialog';
import Fieldset from './Fieldset';
import TransHtml from './TransHtml';

import useStyles from './DatasetConfiguration.styles';
import useMountEffect from '../hooks/useMountEffect';
import useSession from '../hooks/useSession';

enum UploadState {
    Ready,
    Uploading,
    Success,
    Failure,
}

export interface DatasetConfigurationProps {
    online?: boolean;
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

function DatasetConfiguration({
    onChange,
    onLoad,
    online: isOnline,
}: DatasetConfigurationProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t, i18n } = useTranslation();
    const [{ user }] = useSession();
    const [uploadState, setUploadState] = useState<UploadState>(UploadState.Ready);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [isRemoveDatasetDialogOpen, setIsRemoveDatasetDialogOpen] = useState(false);
    const [isRemoveDataSourceDialogOpen, setIsRemoveDataSourceDialogOpen] = useState(false);
    const [dataSourceDialogState, setDataSourceDialogState] = useState<DataSourceDialogState>(
        DataSourceDialogState.Closed,
    );
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [dataSource, setDataSource] = useState<DataSource | null>(null);
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
    const { control, setValue } = useForm();
    const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'short',
    });

    useMountEffect(() => {
        async function loadDataSources() {
            if (!user) {
                return;
            }

            const response = await getDataSources(user.id);
            if (response.data.dataSources) {
                setDataSources(response.data.dataSources);
            }
        }

        loadDataSources();
    });

    async function handleDropFile(files: Blob[]) {
        const file: Blob = files[0];

        setUploadState(UploadState.Uploading);
        setUploadProgress(0);
        setUploadSpeed(0);
        onChange(false);

        try {
            const uploadStartTime = Date.now();
            const response = await uploadData(file, {
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

    async function handleLoadButtonClick() {
        if (!dataSource) {
            return;
        }

        setUploadState(UploadState.Uploading);
        setUploadProgress(0);
        setUploadSpeed(0);
        onChange(false);

        try {
            const response = await loadDataSource(dataSource.id, {
                cancelToken: new axios.CancelToken((c: Canceler) => {
                    cancelUpload.current = c;
                }),
            });
            const attributes = response.data.attributes as DatasetAttribute[];

            if (attributes) {
                if (attributes.length > 1) {
                    setUploadState(UploadState.Success);
                    onLoad(dataSource.name, attributes);
                    onChange(true);
                } else {
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
        setIsRemoveDatasetDialogOpen(false);

        try {
            const response = await deleteData();

            if (response.data.success) {
                setUploadState(UploadState.Ready);
                onChange(false);
                showSnackbar({
                    message: t('dataset_has_been_removed', {
                        name: dataSource ? dataSource.name : acceptedFiles[0].name,
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
        setIsRemoveDatasetDialogOpen(false);
    }

    function handleRemoveFileButtonClick() {
        setIsRemoveDatasetDialogOpen(true);
    }

    function handleCancelUploadButtonClick() {
        if (cancelUpload.current !== null) {
            cancelUpload.current(t('error.file_upload_cancelled'));
        }

        setUploadState(UploadState.Ready);
    }

    function handleAddButtonClick() {
        setDataSourceDialogState(DataSourceDialogState.Add);
    }

    function handleEditButtonClick() {
        setDataSourceDialogState(DataSourceDialogState.Edit);
    }

    function handleRemoveDataSourceButtonClick() {
        setIsRemoveDataSourceDialogOpen(true);
    }

    function handleRemoveDataSourceDialogClose() {
        setIsRemoveDataSourceDialogOpen(false);
    }

    async function handleRemoveDataSourceDialogAccept() {
        setIsRemoveDataSourceDialogOpen(false);

        if (!dataSource) {
            return;
        }

        try {
            const response = await deleteDataSource(dataSource.id);

            if (response?.data.success) {
                setValue('dataSource', '');
                setDataSources(dataSources.filter((source) => source.id !== dataSource.id));
                setDataSource(null);
                showSnackbar({
                    message: t('data_source_deleted'),
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

    function handleDataSourceDialogClose() {
        setDataSourceDialogState(DataSourceDialogState.Closed);
    }

    function handleDataSourceDialogAccept(source: DataSource) {
        const sources = [...dataSources];
        setDataSource(source);

        if (dataSourceDialogState === DataSourceDialogState.Add) {
            sources.push(source);
            setDataSources(sources);
            setValue('dataSource', source.id);
        } else {
            const index = dataSources.findIndex((ds) => ds.id === source.id);

            if (index > -1) {
                sources[index] = source;
            }

            setDataSources(sources);
        }

        setDataSourceDialogState(DataSourceDialogState.Closed);
    }

    return (
        <form>
            <Fieldset legend={t('load_dataset')} gutterBottom>
                <Alert className={classes.info} severity="info">
                    <TransHtml
                        i18nKey={
                            isOnline ? 'setup_data_server_description' : 'upload_CSV_description'
                        }
                    />
                </Alert>
                {isOnline ? (
                    <>
                        <Grid container spacing={1}>
                            <Grid className={classes.dataSourceSelectWrapper} item>
                                <Controller
                                    control={control}
                                    name="dataSource"
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            id="data-source"
                                            label={t('data_source')}
                                            margin="normal"
                                            select
                                            fullWidth
                                            disabled={!dataSources.length}
                                            {...field}
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                setValue(field.name, event.target.value);
                                                setDataSource(
                                                    event.target.value
                                                        ? dataSources.find(
                                                              (item) =>
                                                                  item.id ===
                                                                  Number(event.target.value),
                                                          ) || null
                                                        : null,
                                                );
                                            }}
                                        >
                                            {dataSources.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item>
                                <FormControl margin="normal">
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddButtonClick}
                                    >
                                        {t('add')}
                                    </Button>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <DataSourceDialog
                            key={dataSourceDialogState}
                            dataSource={
                                (dataSourceDialogState === DataSourceDialogState.Edit &&
                                    dataSource) ||
                                undefined
                            }
                            open={dataSourceDialogState > DataSourceDialogState.Closed}
                            maxWidth="sm"
                            onClose={handleDataSourceDialogClose}
                            onAccept={handleDataSourceDialogAccept}
                            onDecline={handleDataSourceDialogClose}
                            fullWidth
                        />
                        {dataSource && (
                            <FormControl
                                className={classes.dataSourceInfoWrapper}
                                margin="normal"
                                fullWidth
                            >
                                <dl className={classes.dataSourceInfo}>
                                    <div>
                                        <dt>
                                            <LabelIcon />
                                            {t('name')}
                                        </dt>
                                        <dd>{dataSource.name}</dd>
                                    </div>
                                    {dataSource.description && (
                                        <div>
                                            <dt>
                                                <DescriptionIcon />
                                                {t('description')}
                                            </dt>
                                            <dd>{dataSource.description}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt>
                                            <HomeIcon />
                                            {t('url')}
                                        </dt>
                                        <dd>{dataSource.url}</dd>
                                    </div>
                                    <div>
                                        <dt>
                                            <AccessTimeIcon />
                                            {t('from')}
                                        </dt>
                                        <dd>
                                            {dataSource.timeWindowStart
                                                ? dateFormatter.format(
                                                      new Date(dataSource.timeWindowStart),
                                                  )
                                                : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>
                                            <AccessTimeIcon />
                                            {t('to')}
                                        </dt>
                                        <dd>
                                            {dataSource.timeWindowEnd
                                                ? dateFormatter.format(
                                                      new Date(dataSource.timeWindowEnd),
                                                  )
                                                : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>
                                            <UpdateIcon />
                                            {t('interval')}
                                        </dt>
                                        <dd>{formatTimeInterval(dataSource.interval, t)}</dd>
                                    </div>
                                </dl>
                                <Grid className={classes.buttons} spacing={1} container>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<CloudUploadIcon />}
                                            onClick={handleLoadButtonClick}
                                        >
                                            {t('load')}
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<DeleteIcon />}
                                            onClick={handleRemoveDataSourceButtonClick}
                                        >
                                            {t('delete')}
                                        </Button>
                                        <ConfirmationDialog
                                            id="remove-data-source-dialog"
                                            title={t('delete_data_source')}
                                            content={
                                                <TransHtml
                                                    i18nKey="delete_data_source_confirmation"
                                                    values={{
                                                        name: dataSource.name,
                                                    }}
                                                />
                                            }
                                            open={isRemoveDataSourceDialogOpen}
                                            onClose={handleRemoveDataSourceDialogClose}
                                            onAccept={handleRemoveDataSourceDialogAccept}
                                            onDecline={handleRemoveDataSourceDialogClose}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={handleEditButtonClick}
                                        >
                                            {t('edit')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </FormControl>
                        )}
                    </>
                ) : (
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
                    </FormControl>
                )}
                {uploadState > UploadState.Ready && (acceptedFiles.length > 0 || dataSource) && (
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
                            <Typography className={classes.uploadFileName} variant="body2" noWrap>
                                {dataSource ? dataSource.name : acceptedFiles[0].name}
                            </Typography>
                            {uploadState < UploadState.Failure && (
                                <Tooltip
                                    title={
                                        isUploading
                                            ? t(dataSource ? 'cancel_loading' : 'cancel_uploading')
                                            : t('delete_dataset')
                                    }
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
                                    id="remove-dataset-dialog"
                                    title={t('delete_dataset')}
                                    content={
                                        <TransHtml
                                            i18nKey="delete_dataset_confirmation"
                                            values={{
                                                name: dataSource
                                                    ? dataSource.name
                                                    : acceptedFiles[0].name,
                                            }}
                                        />
                                    }
                                    open={isRemoveDatasetDialogOpen}
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
                                [classes.uploadProgressError]: uploadState === UploadState.Failure,
                            })}
                            variant={dataSource && isUploading ? 'indeterminate' : 'determinate'}
                            value={dataSource ? 100 : uploadProgress}
                        />
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="textSecondary">
                                {!dataSource &&
                                    isUploading &&
                                    `${formatDataSize(
                                        (uploadProgress * acceptedFiles[0].size) / 100,
                                    )} ${t('of')} `}
                                {!dataSource &&
                                    `${formatDataSize(acceptedFiles[0].size)} (${Math.round(
                                        uploadProgress,
                                    )}%)`}
                                {dataSource && (isUploading ? `${t('loading')}…` : t('finished'))}
                            </Typography>
                            {!dataSource && (
                                <Typography
                                    className={classes.uploadSpeed}
                                    variant="caption"
                                    align="right"
                                    color="textSecondary"
                                >
                                    {`${formatDataSize(uploadSpeed)}/s`}
                                </Typography>
                            )}
                        </Box>
                        {uploadState > UploadState.Uploading && (
                            <Typography className={classes.uploadMessage} variant="body2">
                                {uploadState === UploadState.Success
                                    ? t(
                                          (dataSource && 'dataset_successfully_loaded') ||
                                              'dataset_successfully_uploaded',
                                      )
                                    : t('invalid_dataset_instructions')}
                            </Typography>
                        )}
                    </Alert>
                )}
            </Fieldset>
        </form>
    );
}

export default DatasetConfiguration;
