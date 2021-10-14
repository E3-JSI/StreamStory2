import React from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LockIcon from '@material-ui/icons/Lock';

import { User } from '../types/api';
import { extendRegRet } from '../utils/forms';
import { getUserSession } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';

export interface FormRequestData {
    firstName?: string;
    lastName?: string;
}

export interface FormResponseData {
    user?: User;
    error?: FormErrors | string[] | string;
}

export type FormErrors = Record<string, never>;

function UserProfileDetailsForm(): JSX.Element {
    const { t } = useTranslation();
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const form = useForm<FormRequestData>({
        defaultValues: {
            firstName: user?.firstName,
            lastName: user?.lastName,
        },
    });
    const { register, reset } = form;

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (
        response,
        requestData,
    ) => {
        if (response.data.user) {
            setSession(getUserSession(response.data.user));
            showSnackbar({
                message: t('details_successfully_saved'),
                severity: 'success',
                // autoHideDuration: null
            });
            reset(requestData);
        }
    };

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            onResponse={handleResponse}
        >
            <TextField
                id="first-name"
                label={t('first_name')}
                margin="normal"
                autoFocus
                fullWidth
                {...extendRegRet(register('firstName'))}
            />
            <TextField
                id="last-name"
                label={t('last_name')}
                margin="normal"
                fullWidth
                {...extendRegRet(register('lastName'))}
            />
            <TextField
                id="email"
                label={t('email_address')}
                value={user?.email}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <LockIcon fontSize="small" color="secondary" />
                        </InputAdornment>
                    ),
                    inputProps: {
                        readOnly: true,
                        tabIndex: -1,
                    },
                }}
                margin="normal"
                fullWidth
            />
        </UserProfileForm>
    );
}

export default UserProfileDetailsForm;
