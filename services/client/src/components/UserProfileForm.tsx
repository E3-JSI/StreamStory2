import React from 'react';

import { AxiosResponse } from 'axios';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import SaveIcon from '@material-ui/icons/Save';

import { getResponseErrors, Errors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import LoadingButton, { LoadingButtonProps } from './LoadingButton';

import useStyles from './UserProfileForm.styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserProfileAction = (data?: any) => Promise<AxiosResponse<any>>;
export type FormResponseHandler<FormResponseData, FormRequestData> = (
    response: AxiosResponse<FormResponseData>,
    requestData?: FormRequestData,
) => void;

export interface UserProfileFormProps<FormRequestData, FormResponseData> {
    children: React.ReactNode;
    form: UseFormReturn;
    action: UserProfileAction;
    submitButton?: LoadingButtonProps | null;
    onResponse: FormResponseHandler<FormResponseData, FormRequestData>;
}

function UserProfileForm<FormRequestData, FormResponseData, FormErrors extends Errors>(
    {
        children,
        form,
        action,
        submitButton = {},
        onResponse,
    }: UserProfileFormProps<FormRequestData, FormResponseData>,
    ref: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [showSnackbar] = useSnackbar();

    const {
        formState: { isSubmitting, isDirty },
        handleSubmit: onSubmit,
        setError,
    } = form;
    const { children: submitLabel, ...submitButtonProps } = submitButton || {};

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        // if (isSubmitting) {
        //     return;
        // }

        try {
            const response = await (Object.keys(data).length ? action(data) : action());

            onResponse(response as AxiosResponse<FormResponseData>, data as FormRequestData);
        } catch (error) {
            // Handle form errors.
            const errors = getResponseErrors<FormErrors>(error, t);

            if (Array.isArray(errors)) {
                const message = errors;

                if (message.length) {
                    showSnackbar({
                        message: errors,
                        severity: 'error',
                    });
                }
            } else if (errors !== undefined) {
                Object.keys(errors).forEach((name, i) => {
                    setError(
                        name,
                        {
                            type: 'manual',
                            message: errors[name],
                        },
                        { shouldFocus: i < 1 },
                    );
                });
            }
        }
    };

    return (
        <form className={classes.root} ref={ref} onSubmit={onSubmit(handleSubmit)} noValidate>
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
                                {submitLabel || t('save')}
                            </LoadingButton>
                        </Grid>
                    )}
                </Grid>
            )}
        </form>
    );
}

export default React.forwardRef(UserProfileForm) as <
    FormRequestData,
    FormResponseData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    FormErrors extends Errors,
>(
    props: UserProfileFormProps<FormRequestData, FormResponseData> & {
        ref?: React.ForwardedRef<HTMLFormElement>;
    },
) => ReturnType<typeof UserProfileForm>;
