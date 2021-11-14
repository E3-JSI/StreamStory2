import React from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LockIcon from '@material-ui/icons/Lock';

import {
    UpdateCurrentUserDetailsRequest,
    UpdateCurrentUserDetailsResponse,
    updateCurrentUserDetails,
} from '../api/users';
import { initMuiRegister } from '../utils/forms';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';

type FormRequestData = UpdateCurrentUserDetailsRequest;
type FormResponseData = UpdateCurrentUserDetailsResponse;
type FormErrors = Record<string, never>;

function UserProfileDetailsForm(): JSX.Element {
    const { t } = useTranslation();
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const form = useForm<Partial<FormRequestData>>({
        defaultValues: {
            name: user?.name,
        },
    });
    const { register, reset } = form;
    const muiRegister = initMuiRegister(register);

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (
        response,
        requestData,
    ) => {
        if (response.data.user) {
            setSession({ user: response.data.user });
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
            action={updateCurrentUserDetails}
            onResponse={handleResponse}
        >
            <TextField
                id="display-name"
                label={t('display_name')}
                margin="normal"
                autoFocus
                fullWidth
                {...muiRegister('name')}
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
