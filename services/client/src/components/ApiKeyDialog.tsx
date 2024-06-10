import React from 'react';

import { useTranslation } from 'react-i18next';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import {
    ApiKey,
    addApiKey,
    updateApiKey,
    ApiKeyConfiguration,
    ApiKeySettings,
} from '../api/apiKeys';
import { getResponseErrors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import useSession from '../hooks/useSession';
import LoadingButton from './LoadingButton';

export enum ApiKeyDialogState {
    Closed,
    Add,
    Edit,
}

type FormRequestData = ApiKeyConfiguration | ApiKeySettings;
type FormErrors = Record<string, never>;

export interface DataSourceDialogProps extends DialogProps {
    apiKey?: ApiKey;
    userId?: number;
    onAccept: (apiKey: ApiKey) => void;
    onDecline: React.ReactEventHandler<HTMLElement>;
}

function generateApiKey(): string {
    let d = new Date().getTime();
    const key: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
        const r = (d + Math.random() * 16) % 16 | 0; // eslint-disable-line
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); // eslint-disable-line
    });
    return key;
}

function ApiKeyDialog({
    apiKey,
    userId,
    onAccept,
    onDecline,
    ...other
}: DataSourceDialogProps): JSX.Element {
    const { t } = useTranslation();
    const [{ user }] = useSession();
    const [showSnackbar] = useSnackbar();
    const {
        control,
        formState: { errors, isDirty, isSubmitting },
        handleSubmit: onSubmit,
        register,
        setError,
        setValue,
    } = useForm();
    const variant = apiKey ? 'edit' : 'add';

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        const requestData = {
            ...data,
        };
        try {
            const response = await (apiKey
                ? updateApiKey(apiKey.id, requestData)
                : addApiKey(requestData as ApiKeyConfiguration));

            if (response?.data.apiKey) {
                showSnackbar({
                    message: t(apiKey ? 'data_source_saved' : 'data_source_added'),
                    severity: 'success',
                });
                onAccept(response.data.apiKey);
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

    function handleGenerateClick() {
        const key = generateApiKey();
        setValue('value', key);
    }

    return (
        <Dialog aria-labelledby={`${variant}-data-source-dialog-title`} {...other}>
            <DialogTitle id={`${variant}-data-source-dialog-title`}>
                {t(apiKey ? 'edit_api_key' : 'add_api_key')}
            </DialogTitle>
            <DialogContent dividers>
                <form id="data-source-form" onSubmit={onSubmit(handleSubmit)} noValidate>
                    {!apiKey && (
                        <input type="hidden" value={userId || user?.id} {...register('userId')} />
                    )}

                    <Controller
                        control={control}
                        name="domain"
                        defaultValue={apiKey?.domain}
                        rules={{
                            required: t('error.required_named_field', {
                                name: t('domain'),
                            }),
                        }}
                        render={({ field }) => (
                            <TextField
                                id="api-key-domain"
                                label={t('domain')}
                                error={!!errors.domain}
                                helperText={errors.domain?.message}
                                margin="normal"
                                fullWidth
                                multiline
                                {...field}
                            />
                        )}
                    />

                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={10}>
                            <Controller
                                control={control}
                                name="value"
                                defaultValue={apiKey?.value || generateApiKey()}
                                rules={{
                                    required: t('error.required_named_field', {
                                        name: t('api_key'),
                                    }),
                                }}
                                render={({ field }) => (
                                    <TextField
                                        id="api-key-value"
                                        disabled
                                        label={t('api_key')}
                                        error={!!errors.value}
                                        helperText={errors.value?.message}
                                        margin="normal"
                                        fullWidth
                                        multiline
                                        {...field}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Button
                                disabled={(apiKey != null)!} // eslint-disable-line
                                color="primary"
                                onClick={handleGenerateClick}
                            >
                                {t('generate')}
                            </Button>
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

export default ApiKeyDialog;
