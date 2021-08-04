import React, { useRef } from 'react';

import axios, { AxiosResponse, Method } from 'axios';
import { Link as RouterLink, useHistory, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { validationPatterns, minPasswordLength, extendRegRet } from '../utils/forms';
import { Errors, getResponseErrors } from '../utils/errors';
import { getUserSession, User } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import Copyright from './Copyright';
import PasswordField from './PasswordField';
import PageTitle from './PageTitle';
import LoadingButton from './LoadingButton';

import useStyles from './UserAccountForm.styles';

export type UserAccountFormVariant =
    | 'login'
    | 'registration'
    | 'password-reset-init'
    | 'password-reset';

export type ResponseHandler = (response: AxiosResponse<FormResponseData>) => void;

export interface UserAccountFormProps {
    variant: UserAccountFormVariant;
}

export interface UserAccountFormUrlParams {
    token?: string;
}

export interface FormRequestData {
    email?: string;
    password?: string;
    password2?: string;
    remember?: boolean;
}

export interface FormResponseData {
    user?: User;
    success?: boolean;
    error?: FormErrors;
}

export interface FormErrors extends Errors {
    email?: string;
    password?: string;
    password2?: string;
}

export interface AltLink {
    url: string;
    title: string;
}

function UserAccountForm({ variant }: UserAccountFormProps): JSX.Element {
    const classes = useStyles();
    const history = useHistory();
    const { t } = useTranslation(['common', 'error']);
    const [, /* session */ setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const {
        formState: { isSubmitting, errors },
        handleSubmit: onSubmit,
        register,
        reset,
        setError
    } = useForm();
    const { token } = useParams<UserAccountFormUrlParams>();

    const isLoginForm = variant === 'login';
    const isRegistrationForm = variant === 'registration';
    const isPasswordResetForm = variant === 'password-reset';
    const isPasswordResetInitForm = variant === 'password-reset-init';

    let title = '';
    let description = '';
    let url = '';
    let method: Method = 'post';
    let actionName = '';
    let altLink: AltLink | null = null;
    let altLink2: AltLink | null = null;
    let handleResponse: ResponseHandler;

    switch (variant) {
        case 'registration':
            title = t('common:registration');
            url = '/api/auth/registration';
            actionName = t('common:register');
            altLink2 = {
                url: '/login',
                title: t('common:already_have_an_account')
            };
            handleResponse = (response) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('common:successful_registration.title'),
                        message: t('common:successful_registration.message'),
                        severity: 'success',
                        autoHideDuration: null
                    });
                }
            };
            break;

        case 'password-reset':
            title = t('common:password_reset');
            url = '/api/auth/password';
            method = 'put';
            actionName = t('common:reset_password');
            altLink2 = {
                url: '/password-reset',
                title: t('common:reset_link_expired')
            };
            handleResponse = (response) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('common:successful_password_reset.title'),
                        message: t('common:successful_password_reset.message'),
                        severity: 'success',
                        autoHideDuration: null
                    });
                    history.push('/login');
                }
            };
            break;

        case 'password-reset-init':
            title = t('common:forgot_password');
            description = t('common:send_request_for_password_reset');
            url = '/api/auth/password';
            actionName = t('common:send');
            altLink2 = {
                url: '/login',
                title: t('common:back_to_login')
            };
            handleResponse = (response) => {
                if (response.data.success) {
                    reset();
                    showSnackbar({
                        title: t('common:successful_password_reset_initiation.title'),
                        message: t('common:successful_password_reset_initiation.message'),
                        severity: 'success',
                        autoHideDuration: null
                    });
                }
            };
            break;

        case 'login':
        default:
            title = t('common:login');
            url = '/api/auth/login';
            actionName = t('common:log_in');
            altLink = {
                url: '/registration',
                title: t('common:dont_have_an_account')
            };
            altLink2 = {
                url: '/password-reset',
                title: t('common:forgot_password')
            };
            handleResponse = (response) => {
                if (response.data.user) {
                    setSession(getUserSession(response.data.user));
                }
            };
            break;
    }

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        if (isSubmitting) {
            return;
        }

        try {
            const response = await axios.request<FormResponseData>({
                url,
                method,
                data
            });

            handleResponse(response);
        } catch (error) {
            // Handle form errors.
            const responseErrors = getResponseErrors<FormErrors>(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error'
                    });
                }
            } else if (responseErrors !== undefined) {
                Object.keys(responseErrors).forEach((name, i) => {
                    setError(
                        name,
                        {
                            type: 'manual',
                            message: responseErrors[name]
                        },
                        { shouldFocus: i < 1 }
                    );
                });
            }
        }
    };

    return (
        <>
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <PageTitle variant="h5">{title}</PageTitle>
                {description && (
                    <Typography className={classes.description} variant="body1" align="center">
                        {description}
                    </Typography>
                )}
                <form className={classes.form} onSubmit={onSubmit(handleSubmit)} noValidate>
                    {isPasswordResetForm && (
                        <input type="hidden" value={token} {...register('token')} />
                    )}
                    {!isPasswordResetForm && (
                        <TextField
                            id="email"
                            type="email"
                            label={t('common:email_address')}
                            defaultValue=""
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            variant="filled"
                            margin="normal"
                            // autoComplete="email"
                            autoFocus
                            fullWidth
                            required
                            {...extendRegRet(
                                register('email', {
                                    required: t('error:required_field'),
                                    pattern: {
                                        value: validationPatterns.emailLoose,
                                        message: t('error:invalid_email')
                                    }
                                })
                            )}
                        />
                    )}
                    {!isPasswordResetInitForm && (
                        <PasswordField
                            id="password"
                            label={t('common:password')}
                            defaultValue=""
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            variant="filled"
                            margin="normal"
                            // autoComplete="password"
                            autoFocus={isPasswordResetForm}
                            fullWidth
                            required
                            {...extendRegRet(
                                register('password', {
                                    required: t('error:required_field'),
                                    minLength: {
                                        value: minPasswordLength,
                                        message: t('error:short_password', {
                                            count: minPasswordLength
                                        })
                                    }
                                }),
                                {
                                    ref: (instance) => {
                                        passwordRef.current = instance;
                                    }
                                }
                            )}
                        />
                    )}
                    {(isRegistrationForm || isPasswordResetForm) && (
                        <PasswordField
                            id="password2"
                            label={t('common:password_confirmation')}
                            defaultValue=""
                            error={!!errors.password2}
                            helperText={errors.password2?.message}
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            {...extendRegRet(
                                register('password2', {
                                    required: t('error:required_field'),
                                    validate: (value) => value === passwordRef.current?.value
                                        || t('error:password_mismatch')
                                })
                            )}
                        />
                    )}
                    {isLoginForm && (
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    defaultChecked={false}
                                    color="primary"
                                    {...extendRegRet(register('remember'))}
                                />
                            )}
                            label={t('common:remember_me')}
                        />
                    )}
                    <Box mt={3} mb={2}>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            loading={isSubmitting}
                            fullWidth
                        >
                            {actionName}
                        </LoadingButton>
                    </Box>
                    <Grid spacing={1} justify="space-between" container>
                        {altLink && (
                            <Grid className={classes.altLink} item>
                                <Link to={altLink.url} component={RouterLink} variant="body2">
                                    {altLink.title}
                                </Link>
                            </Grid>
                        )}
                        {altLink2 && (
                            <Grid item>
                                <Link to={altLink2.url} component={RouterLink} variant="body2">
                                    {altLink2.title}
                                </Link>
                            </Grid>
                        )}
                    </Grid>
                </form>
            </div>
            <Copyright />
        </>
    );
}

export default UserAccountForm;
