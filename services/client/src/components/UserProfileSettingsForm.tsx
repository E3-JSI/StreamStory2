import React from 'react';

import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import { getUserSession, User } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';

export interface FormRequestData {
    theme?: string;
}

export interface FormResponseData {
    user?: User;
    error?: string[] | string;
}

export type FormErrors = Record<string, never>;

function UserProfileSettingsForm(): JSX.Element {
    const { t } = useTranslation(['common']);
    const [{ theme }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const form = useForm<FormRequestData>({ defaultValues: { theme } });
    const { control, reset } = form;

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (
        response,
        requestData
    ) => {
        if (response.data.user) {
            // Sync session.
            setSession(getUserSession(response.data.user));
            showSnackbar({
                message: t('common:settings_successfully_saved'),
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
            <FormControl component="fieldset">
                <FormLabel id="theme-settings" component="legend">
                    {t('common:theme')}
                </FormLabel>
                <Controller
                    name="theme"
                    control={control}
                    render={({ field: { onChange, name, value } }) => (
                        <RadioGroup
                            name={name}
                            value={value}
                            onChange={onChange}
                            aria-labelledby="theme-settings"
                            row
                        >
                            <FormControlLabel
                                value="light"
                                control={<Radio />}
                                label={t('common:light')}
                            />
                            <FormControlLabel
                                value="dark"
                                control={<Radio />}
                                label={t('common:dark')}
                            />
                            <FormControlLabel
                                value="system"
                                control={<Radio />}
                                label={t('common:system')}
                            />
                        </RadioGroup>
                    )}
                />
            </FormControl>
        </UserProfileForm>
    );
}

export default UserProfileSettingsForm;
