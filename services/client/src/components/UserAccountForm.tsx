import React, { useRef } from 'react';

import { AxiosResponse } from 'axios';
import { Link as RouterLink, useHistory, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import GitHubIcon from '@material-ui/icons/GitHub';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

import config from '../config';
import {
    initPasswordReset,
    InitPasswordResetRequest,
    InitPasswordResetResponse,
    logIn,
    LogInRequest,
    LogInResponse,
    register as registerUser,
    RegisterRequest,
    RegisterResponse,
    resetPassword,
    ResetPasswordRequest,
    ResetPasswordResponse,
} from '../api/auth';
import { getNotifications } from '../api/notifications';
import { cleanProps } from '../utils/misc';
import { validationPatterns, minPasswordLength, initMuiRegister } from '../utils/forms';
import { Errors, getResponseErrors } from '../utils/errors';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import Copyright from './Copyright';
import PasswordField from './PasswordField';
import PageTitle from './PageTitle';
import LoadingButton from './LoadingButton';
import GoogleIcon from './icons/Google';

import useStyles from './UserAccountForm.styles';

export type UserAccountFormVariant =
    | 'login'
    | 'registration'
    | 'password-reset-init'
    | 'password-reset';

export interface UserAccountFormProps {
    variant: UserAccountFormVariant;
}

export interface UserAccountFormUrlParams {
    token?: string;
}

type FormRequestData =
    | InitPasswordResetRequest
    | LogInRequest
    | RegisterRequest
    | ResetPasswordRequest;

type FormResponseData =
    | InitPasswordResetResponse
    | LogInResponse
    | RegisterResponse
    | ResetPasswordResponse;

export type ResponseHandler = (response: AxiosResponse<FormResponseData>) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserAccountAction = (data: any) => Promise<AxiosResponse<any>>;

interface FormErrors extends Errors {
    email?: string;
    password?: string;
    password2?: string;
}

interface AltLink {
    url: string;
    title: string;
}

function UserAccountForm({ variant }: UserAccountFormProps): JSX.Element {
    const classes = useStyles();
    const history = useHistory();
    const { t } = useTranslation();
    const [, /* session */ setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const {
        formState: { isSubmitting, errors },
        handleSubmit: onSubmit,
        register,
        reset,
        setError,
    } = useForm();
    const muiRegister = initMuiRegister(register);
    const { token } = useParams<UserAccountFormUrlParams>();

    const isLoginForm = variant === 'login';
    const isRegistrationForm = variant === 'registration';
    const isPasswordResetForm = variant === 'password-reset';
    const isPasswordResetInitForm = variant === 'password-reset-init';
    const siteUrl = config.url.replace(/:(80)?$/, '');

    const providerIcon: Record<string, React.ReactNode> = {
        github: <GitHubIcon />,
        google: <GoogleIcon />,
    };

    let title = '';
    let description = '';
    let action: UserAccountAction;
    let actionName = '';
    let altLink: AltLink | null = null;
    let handleResponse: ResponseHandler;

    switch (variant) {
        case 'registration':
            title = t('registration');
            action = registerUser;
            actionName = t('register');
            altLink = {
                url: '/login',
                title: t('already_have_an_account'),
            };
            handleResponse = async (response: AxiosResponse<RegisterResponse>) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('successful_registration.title'),
                        message: t('successful_registration.message'),
                        severity: 'success',
                        autoHideDuration: null,
                    });
                }
            };
            break;

        case 'password-reset':
            title = t('password_reset');
            action = resetPassword;
            actionName = t('reset_password');
            altLink = {
                url: '/password-reset',
                title: t('reset_link_expired'),
            };
            handleResponse = async (response: AxiosResponse<ResetPasswordResponse>) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('successful_password_reset.title'),
                        message: t('successful_password_reset.message'),
                        severity: 'success',
                        autoHideDuration: null,
                    });
                    history.push('/login');
                }
            };
            break;

        case 'password-reset-init':
            title = t('forgot_password');
            description = t('send_request_for_password_reset');
            action = initPasswordReset;
            actionName = t('send');
            altLink = {
                url: '/login',
                title: t('back_to_login'),
            };
            handleResponse = async (response: AxiosResponse<InitPasswordResetResponse>) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('successful_password_reset_initiation.title'),
                        message: t('successful_password_reset_initiation.message'),
                        severity: 'success',
                        autoHideDuration: null,
                    });
                }
            };
            break;

        case 'login':
        default:
            title = t('login');
            action = logIn;
            actionName = t('log_in');
            altLink = {
                url: '/registration',
                title: t('dont_have_an_account'),
            };
            handleResponse = async (response: AxiosResponse<LogInResponse>) => {
                if (response.data.user) {
                    const {
                        data: { notifications },
                    } = await getNotifications(response.data.user.id, true);
                    setSession({
                        user: response.data.user,
                        notifications,
                    });
                }
            };
            break;
    }

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        try {
            const response = await action(data);

            await handleResponse(response);
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

    return (
        <>
            <Card className={classes.card} elevation={24}>
                <CardHeader
                    className={classes.header}
                    classes={{
                        avatar: classes.headerAvatar,
                    }}
                    avatar={<FingerprintIcon />}
                    title={
                        <PageTitle className={classes.title} variant="h5">
                            {title}
                        </PageTitle>
                    }
                    subheader={
                        description && (
                            <Typography
                                className={classes.description}
                                variant="body1"
                                align="center"
                            >
                                {description}
                            </Typography>
                        )
                    }
                    disableTypography
                />
                <CardContent className={classes.content}>
                    <form className={classes.form} onSubmit={onSubmit(handleSubmit)} noValidate>
                        {isPasswordResetForm && (
                            <input type="hidden" value={token} {...register('token')} />
                        )}
                        {!isPasswordResetForm && (
                            <TextField
                                id="email"
                                type="email"
                                label={t('email_address')}
                                defaultValue=""
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                size="medium"
                                margin="normal"
                                // autoComplete="email"
                                autoFocus
                                fullWidth
                                required
                                InputLabelProps={{
                                    required: true,
                                }}
                                {...muiRegister('email', {
                                    required: t('error.required_field'),
                                    pattern: {
                                        value: validationPatterns.emailLoose,
                                        message: t('error.invalid_email'),
                                    },
                                })}
                            />
                        )}
                        {!isPasswordResetInitForm && (
                            <PasswordField
                                id="password"
                                label={t('password')}
                                defaultValue=""
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                size="medium"
                                margin="normal"
                                // autoComplete="password"
                                autoFocus={isPasswordResetForm}
                                fullWidth
                                required
                                InputLabelProps={{
                                    required: true,
                                }}
                                inputProps={{
                                    ref: (instance: HTMLInputElement) => {
                                        passwordRef.current = instance;
                                    },
                                }}
                                {...muiRegister('password', {
                                    required: t('error.required_field'),
                                    minLength: {
                                        value: minPasswordLength,
                                        message: t('error.short_password', {
                                            count: minPasswordLength,
                                        }),
                                    },
                                })}
                            />
                        )}
                        {(isRegistrationForm || isPasswordResetForm) && (
                            <PasswordField
                                id="password2"
                                label={t('password_confirmation')}
                                defaultValue=""
                                error={!!errors.password2}
                                helperText={errors.password2?.message}
                                size="medium"
                                // variant="filled"
                                margin="normal"
                                fullWidth
                                required
                                InputLabelProps={{
                                    required: true,
                                }}
                                {...muiRegister('password2', {
                                    required: t('error.required_field'),
                                    validate: (value) =>
                                        value === passwordRef.current?.value ||
                                        t('error.password_mismatch'),
                                })}
                            />
                        )}
                        {isLoginForm && (
                            <Grid spacing={1} justify="space-between" alignItems="center" container>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                defaultChecked={false}
                                                color="primary"
                                                {...muiRegister('remember')}
                                            />
                                        }
                                        label={t('remember_me')}
                                    />
                                </Grid>
                                <Grid item>
                                    <Link
                                        to="/password-reset"
                                        component={RouterLink}
                                        variant="body2"
                                    >
                                        {t('forgot_password')}
                                    </Link>
                                </Grid>
                            </Grid>
                        )}
                        <Box mt={2} mb={2}>
                            <LoadingButton
                                type="submit"
                                variant="contained"
                                size="large"
                                color="primary"
                                loading={isSubmitting}
                                fullWidth
                            >
                                {actionName}
                            </LoadingButton>
                        </Box>
                    </form>
                    {variant === 'login' && config?.auth?.providers && (
                        <Box className={classes.oauth}>
                            <Typography className={classes.oauthText} variant="body2">
                                <span>{t('or')}</span>
                            </Typography>
                            {config.auth.providers.map((provider) => (
                                <Button
                                    key={provider.id}
                                    variant="outlined"
                                    size="large"
                                    startIcon={providerIcon[provider.id] ?? <VerifiedUserIcon />}
                                    endIcon={<span />}
                                    href={`${provider.authorizationUrl}?${new URLSearchParams({
                                        response_type: 'code',
                                        client_id: provider.clientId,
                                        redirect_uri: `${siteUrl}/login/oauth`,
                                        state: provider.id,
                                        ...cleanProps({ scope: provider.scope }),
                                    }).toString()}`}
                                    fullWidth
                                >
                                    <i>
                                        {t('log_in_with')} {provider.name}
                                    </i>
                                </Button>
                            ))}
                        </Box>
                    )}
                </CardContent>
                <Divider />
                <CardHeader
                    className={classes.header}
                    title={
                        <Link to={altLink.url} component={RouterLink} variant="body2">
                            {altLink.title}
                        </Link>
                    }
                    titleTypographyProps={{ variant: 'body2' }}
                    disableTypography
                />
            </Card>
            <Copyright className={classes.copyright} />
        </>
    );
}

export default UserAccountForm;
