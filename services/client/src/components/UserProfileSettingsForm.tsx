import React from 'react';

import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';

import {
    updateCurrentUserSettings,
    UpdateCurrentUserSettingsRequest,
    UpdateCurrentUserSettingsResponse,
} from '../api/users';
import config from '../config';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';

import languages from '../i18n/languages.json';

type FormRequestData = UpdateCurrentUserSettingsRequest;
type FormResponseData = UpdateCurrentUserSettingsResponse;
type FormErrors = Record<string, never>;

function UserProfileSettingsForm(): JSX.Element {
    const { t } = useTranslation();
    const [{ language, theme }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const form = useForm<Partial<FormRequestData>>({ defaultValues: { language, theme } });
    const { control, reset } = form;

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (
        response,
        requestData,
    ) => {
        if (response.data.user) {
            // Sync session.
            setSession({ user: response.data.user });
            showSnackbar({
                message: t('settings_successfully_saved'),
                severity: 'success',
                // autoHideDuration: null
            });
            reset(requestData);
        }
    };

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            action={updateCurrentUserSettings}
            onResponse={handleResponse}
        >
            <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel id="theme-settings" component="legend">
                    {t('theme')}
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
                                label={t('light')}
                            />
                            <FormControlLabel value="dark" control={<Radio />} label={t('dark')} />
                            <FormControlLabel
                                value="system"
                                control={<Radio />}
                                label={t('system')}
                            />
                        </RadioGroup>
                    )}
                />
            </FormControl>
            {config.languages && config.languages.length > 1 && (
                <FormControl component="fieldset" margin="normal">
                    <FormLabel id="language-settings" component="legend">
                        {t('language')}
                    </FormLabel>
                    <Controller
                        name="language"
                        control={control}
                        render={({ field: { onChange, name, value } }) => (
                            <TextField
                                name={name}
                                value={value}
                                onChange={onChange}
                                aria-labelledby="language-settings"
                                margin="normal"
                                select
                            >
                                {config.languages?.map((languageCode) => {
                                    const nativeName =
                                        languages[languageCode as keyof typeof languages]
                                            ?.nativeName || languageCode;
                                    return (
                                        <MenuItem key={languageCode} value={languageCode}>
                                            {nativeName}
                                        </MenuItem>
                                    );
                                })}
                            </TextField>
                        )}
                    />
                </FormControl>
            )}
        </UserProfileForm>
    );
}

export default UserProfileSettingsForm;
