import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { DateTimePicker } from '@material-ui/pickers';

import { Option } from '../types/select';
import {
    addDataSource,
    updateDataSource,
    DataSource,
    DataSourceConfiguration,
    DataSourceSettings,
} from '../api/dataSources';
import { getResponseErrors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import useSession from '../hooks/useSession';
import UtcWrapper from './UtcWrapper';
import LoadingButton from './LoadingButton';

import useStyles from './DataSourceDialog.styles';

export enum DataSourceDialogState {
    Closed,
    Add,
    Edit,
}

type TimeUnit = 'sec' | 'min' | 'hour' | 'day';
type FormRequestData = DataSourceConfiguration | DataSourceSettings;
type FormErrors = Record<string, never>;

export interface DataSourceDialogProps extends DialogProps {
    dataSource?: DataSource;
    userId?: number;
    onAccept: (dataSource: DataSource) => void;
    onDecline: React.ReactEventHandler<HTMLElement>;
}

function DataSourceDialog({
    dataSource,
    userId,
    onAccept,
    onDecline,
    ...other
}: DataSourceDialogProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [{ user }] = useSession();
    const [showSnackbar] = useSnackbar();
    const [timeUnit, setTimeUnit] = useState<TimeUnit>('sec');
    const {
        control,
        formState: { errors, isDirty, isSubmitting },
        handleSubmit: onSubmit,
        register,
        setError,
        setValue,
        getValues,
    } = useForm();
    const variant = dataSource ? 'edit' : 'add';
    const values = getValues();
    const timeUnitOptions: Option[] = [
        {
            label: t('seconds'),
            value: 'sec',
        },
        {
            label: t('minutes'),
            value: 'min',
        },
        {
            label: t('hours'),
            value: 'hour',
        },
        {
            label: t('days'),
            value: 'day',
        },
    ];
    const timeUnitSize: Record<TimeUnit, number> = {
        sec: 1,
        min: 60,
        hour: 3600,
        day: 86400,
    };

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        const requestData = {
            ...data,
            interval: data.interval * timeUnitSize[timeUnit],
        };

        try {
            const response = await (dataSource
                ? updateDataSource(dataSource.id, requestData)
                : addDataSource(requestData as DataSourceConfiguration));

            if (response?.data.dataSource) {
                showSnackbar({
                    message: t(dataSource ? 'data_source_saved' : 'data_source_added'),
                    severity: 'success',
                });
                onAccept(response.data.dataSource);
            }
        } catch (error) {
            // Handle form errors.
            const responseErrors = getResponseErrors<FormErrors>(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            } else if (responseErrors !== undefined) {
                Object.keys(responseErrors).forEach((name, i) => {
                    setError(
                        name,
                        {
                            type: 'manual',
                            message: responseErrors[name],
                        },
                        { shouldFocus: i < 1 },
                    );
                });
            }
        }
    };

    function handleTimeUnitChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.value) {
            const unit = event.target.value as TimeUnit;
            const interval = Math.round(
                (getValues('interval') * timeUnitSize[timeUnit]) / timeUnitSize[unit],
            );
            setTimeUnit(unit);
            setValue('interval', Math.max(1, interval));
        }
    }

    return (
        <Dialog aria-labelledby={`${variant}-data-source-dialog-title`} {...other}>
            <DialogTitle id={`${variant}-data-source-dialog-title`}>
                {t(dataSource ? 'edit_data_source' : 'add_data_source')}
            </DialogTitle>
            <DialogContent dividers>
                <form id="data-source-form" onSubmit={onSubmit(handleSubmit)} noValidate>
                    {!dataSource && (
                        <input type="hidden" value={userId || user?.id} {...register('userId')} />
                    )}
                    <Controller
                        control={control}
                        name="name"
                        defaultValue={dataSource?.name}
                        rules={{
                            required: t('error.required_named_field', {
                                name: t('name'),
                            }),
                        }}
                        render={({ field }) => (
                            <TextField
                                id="data-source-name"
                                label={t('name')}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                margin="normal"
                                autoFocus
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="description"
                        defaultValue={dataSource?.description}
                        rules={{
                            required: t('error.required_named_field', {
                                name: t('description'),
                            }),
                        }}
                        render={({ field }) => (
                            <TextField
                                id="data-source-description"
                                label={t('description')}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                                margin="normal"
                                fullWidth
                                multiline
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="url"
                        defaultValue={dataSource?.url}
                        rules={{
                            required: t('error.required_named_field', {
                                name: t('url'),
                            }),
                        }}
                        render={({ field }) => (
                            <TextField
                                id="data-source-url"
                                label={t('url')}
                                error={!!errors.url}
                                helperText={errors.url?.message}
                                type="url"
                                margin="normal"
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                    <UtcWrapper>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    control={control}
                                    name="timeWindowStart"
                                    defaultValue={
                                        dataSource
                                            ? new Date(dataSource?.timeWindowStart || 0).getTime()
                                            : new Date().getTime()
                                    }
                                    render={({ field: { onBlur, value, name } }) => (
                                        <DateTimePicker
                                            id="data-source-from"
                                            label={t('from')}
                                            name={name}
                                            value={new Date(value)}
                                            variant="inline"
                                            format="DD/MM/yyyy hh:mm"
                                            ampm={false}
                                            margin="normal"
                                            onBlur={onBlur}
                                            onChange={(mmt) => {
                                                setValue(name, mmt?.toDate().getTime());
                                            }}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    control={control}
                                    name="timeWindowEnd"
                                    defaultValue={
                                        dataSource
                                            ? new Date(dataSource?.timeWindowEnd || 0).getTime()
                                            : new Date().getTime()
                                    }
                                    render={({ field: { onBlur, value, name } }) => (
                                        <DateTimePicker
                                            id="data-source-to"
                                            label={t('to')}
                                            name={name}
                                            value={new Date(value)}
                                            minDate={values.timeWindowStart}
                                            variant="inline"
                                            format="DD/MM/yyyy hh:mm"
                                            ampm={false}
                                            margin="normal"
                                            onChange={(mmt) => {
                                                setValue(name, mmt?.toDate().getTime());
                                            }}
                                            onBlur={onBlur}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </UtcWrapper>
                    <Grid container spacing={1}>
                        <Grid item className={classes.intervalWrapper}>
                            <Controller
                                control={control}
                                name="interval"
                                defaultValue={dataSource?.interval || 60}
                                rules={{
                                    required: t('error.required_named_field', {
                                        name: t('interval'),
                                    }),
                                    min: {
                                        value: 1,
                                        message: t('error.value_must_be_gte', {
                                            min: 1,
                                        }),
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        id="data-source-interval"
                                        label={t('interval')}
                                        inputProps={{
                                            min: 1,
                                        }}
                                        error={!!errors.interval}
                                        helperText={errors.interval?.message}
                                        type="number"
                                        margin="normal"
                                        fullWidth
                                        {...field}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                className={classes.timeUnit}
                                label={t('time_unit')}
                                value={timeUnit}
                                onChange={handleTimeUnitChange}
                                margin="normal"
                                select
                            >
                                {timeUnitOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDecline} color="primary">
                    {t('cancel')}
                </Button>
                <LoadingButton
                    type="submit"
                    form="data-source-form"
                    color="secondary"
                    loading={isSubmitting}
                    disabled={!isDirty}
                >
                    {t('save')}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

export default DataSourceDialog;
