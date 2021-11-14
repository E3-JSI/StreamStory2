import React, { useRef } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    changeCurrentUserPassword,
    ChangeCurrentUserPasswordRequest,
    ChangeCurrentUserPasswordResponse,
} from '../api/users';
import { Errors } from '../utils/errors';
import { minPasswordLength, initMuiRegister } from '../utils/forms';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';
import PasswordField from './PasswordField';

type FormRequestData = ChangeCurrentUserPasswordRequest;
type FormResponseData = ChangeCurrentUserPasswordResponse;

interface FormErrors extends Errors {
    oldPassword?: string;
    newPassword?: string;
    newPassword2?: string;
}

function UserProfileChangePasswordForm(): JSX.Element {
    const { t } = useTranslation();
    const [showSnackbar] = useSnackbar();
    const newPasswordRef = useRef<HTMLInputElement | null>(null);

    const defaultValues = {
        oldPassword: '',
        newPassword: '',
        newPassword2: '',
    };
    const form = useForm<Partial<FormRequestData>>({ defaultValues });
    const {
        formState: { errors },
        register,
        reset,
    } = form;
    const muiRegister = initMuiRegister(register);

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (response) => {
        if (response.data.success) {
            showSnackbar({
                message: t('password_successfully_changed'),
                severity: 'success',
                // autoHideDuration: null
            });
            reset(defaultValues);
        }
    };

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            action={changeCurrentUserPassword}
            onResponse={handleResponse}
        >
            <PasswordField
                id="old-password"
                label={t('current_password')}
                defaultValue=""
                error={!!errors.oldPassword}
                helperText={errors.oldPassword?.message}
                margin="normal"
                // autoComplete="password"
                autoFocus
                fullWidth
                required
                {...muiRegister('oldPassword', {
                    required: t('error.required_field'),
                    minLength: {
                        value: minPasswordLength,
                        message: t('error.short_password', {
                            count: minPasswordLength,
                        }),
                    },
                })}
            />
            <PasswordField
                id="new-password"
                label={t('new_password')}
                defaultValue=""
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                margin="normal"
                inputProps={{
                    ref: (instance: HTMLInputElement) => {
                        newPasswordRef.current = instance;
                    },
                }}
                fullWidth
                required
                {...muiRegister('newPassword', {
                    required: t('error.required_field'),
                    minLength: {
                        value: minPasswordLength,
                        message: t('error.short_password', {
                            count: minPasswordLength,
                        }),
                    },
                })}
            />
            <PasswordField
                id="new-password2"
                label={t('new_password_confirmation')}
                defaultValue=""
                error={!!errors.newPassword2}
                helperText={errors.newPassword2?.message}
                margin="normal"
                fullWidth
                required
                {...muiRegister('newPassword2', {
                    required: t('error.required_field'),
                    validate: (value) =>
                        value === newPasswordRef.current?.value || t('error.password_mismatch'),
                })}
            />
        </UserProfileForm>
    );
}

export default UserProfileChangePasswordForm;
