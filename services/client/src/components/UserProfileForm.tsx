import React from 'react';

import axios, { AxiosResponse, Method } from 'axios';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';

import { getResponseErrors, Errors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import LoadingButton, { LoadingButtonProps } from './LoadingButton';

export type FormResponseHandler<FormResponseData, FormRequestData> = (
    response: AxiosResponse<FormResponseData>,
    requestData?: FormRequestData
) => void;

export interface UserProfileFormProps<FormRequestData, FormResponseData> {
    children: React.ReactNode;
    form: UseFormReturn;
    method?: Method;
    handleResponse: FormResponseHandler<FormResponseData, FormRequestData>;
    submitButton?: LoadingButtonProps | null;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    buttons: {
        marginTop: theme.spacing(3)
    }
}));

function UserProfileForm<FormRequestData, FormResponseData, FormErrors extends Errors>(
    {
        children,
        form,
        method = 'put',
        handleResponse,
        submitButton = {}
    }: UserProfileFormProps<FormRequestData, FormResponseData>,
    ref: React.ForwardedRef<HTMLFormElement>
): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common', 'error']);
    const [showSnackbar] = useSnackbar();

    const {
        formState: { isSubmitting, isDirty },
        handleSubmit: onSubmit,
        setError
    } = form;
    const { children: submitLabel, ...submitButtonProps } = submitButton || {};

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        if (isSubmitting) {
            return;
        }

        try {
            const response = await axios.request<FormResponseData>({
                url: '/api/users/current',
                method,
                data
            });

            handleResponse(response, data as FormRequestData);
        } catch (error) {
            // Handle form errors.
            const errors = getResponseErrors<FormErrors>(error, t);

            if (Array.isArray(errors)) {
                const message = errors;

                if (message.length) {
                    showSnackbar({
                        message: errors,
                        severity: 'error'
                    });
                }
            } else if (errors !== undefined) {
                Object.keys(errors).forEach((name, i) => {
                    setError(
                        name,
                        {
                            type: 'manual',
                            message: errors[name]
                        },
                        { shouldFocus: i < 1 }
                    );
                });
            }
        }
    };

    return (
        <form ref={ref} onSubmit={onSubmit(handleSubmit)} noValidate>
            <Box maxWidth={600}>
                {children}
                {submitButton && (
                    <Grid className={classes.buttons} spacing={1} container>
                        {submitButton && (
                            <Grid item>
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    loading={isSubmitting}
                                    disabled={!isDirty}
                                    startIcon={<SaveIcon />}
                                    {...submitButtonProps}
                                >
                                    {submitLabel || t('common:save')}
                                </LoadingButton>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>
        </form>
    );
}

export default React.forwardRef(UserProfileForm) as <
    FormRequestData,
    FormResponseData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FormErrors extends Errors
>(
    props: UserProfileFormProps<FormRequestData, FormResponseData> & {
        ref?: React.ForwardedRef<HTMLFormElement>;
    }
) => ReturnType<typeof UserProfileForm>;
