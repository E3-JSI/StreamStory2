import React from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LockIcon from '@material-ui/icons/Lock';

import { extendRegRet } from '../utils/forms';
import { getUserSession, User } from '../contexts/SessionContext';
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
    const { t } = useTranslation(['common', 'error']);
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const form = useForm<FormRequestData>({
        defaultValues: {
            firstName: user?.firstName,
            lastName: user?.lastName
        }
    });
    const { register, reset } = form;

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (
        response,
        requestData
    ) => {
        if (response.data.user) {
            setSession(getUserSession(response.data.user));
            showSnackbar({
                message: t('common:details_successfully_saved'),
                severity: 'success'
                // autoHideDuration: null
            });
            reset(requestData);
        }
    };

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            handleResponse={handleResponse}
        >
            <TextField
                id="first-name"
                label={t('common:first_name')}
                variant="standard"
                margin="normal"
                autoFocus
                fullWidth
                {...extendRegRet(register('firstName'))}
            />
            <TextField
                id="last-name"
                label={t('common:last_name')}
                variant="standard"
                margin="normal"
                fullWidth
                {...extendRegRet(register('lastName'))}
            />
            <TextField
                id="email"
                label={t('common:email_address')}
                value={user?.email}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <LockIcon color="secondary" />
                        </InputAdornment>
                    ),
                    inputProps: {
                        readOnly: true,
                        tabIndex: -1
                    }
                }}
                variant="standard"
                margin="normal"
                fullWidth
            />
        </UserProfileForm>
    );
}

export default UserProfileDetailsForm;
