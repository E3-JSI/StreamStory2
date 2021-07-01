import React, { useRef, useState } from 'react';

import axios, { AxiosResponse, Method } from 'axios';
import { Link as RouterLink, useHistory, useParams } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { patterns, minPasswordLength } from '../utils/validation';
import { excludeProps } from '../utils/misc';
import { FormFieldErrors, getResponseErrors, focusFormFieldError } from '../utils/errors';
import { User } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import Copyright from './Copyright';
import PasswordField from './PasswordField';

export type UserAccountFormVariant =
    | 'login'
    | 'registration'
    | 'password-reset-init'
    | 'password-reset';

export type ResponseHandler = (response: AxiosResponse<FormResponse>) => void;

export interface UserAccountFormProps {
    variant: UserAccountFormVariant;
}

export interface UserAccountFormUrlParams {
    token?: string;
}

export interface FormData {
    email?: string;
    password?: string;
    password2?: string;
    remember?: boolean;
}

export interface FormResponse {
    user?: User;
    success?: boolean;
    error?: FormErrors;
}

export interface FormErrors extends FormFieldErrors {
    email?: string;
    password?: string;
    password2?: string;
}

export interface AltLink {
    url: string;
    title: string;
}

const useStyles = makeStyles((theme) => createStyles({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    description: {
        marginTop: theme.spacing(2)
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(8)
    },
    submitWrapper: {
        margin: theme.spacing(3, 0, 2),
        position: 'relative'
    },
    submitProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12
    },
    altLink: {
        marginRight: theme.spacing(2)
    }
}));

function UserAccountForm({ variant }: UserAccountFormProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common', 'error']);

    const [, /* session */ setSession] = useSession();
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSnackbar] = useSnackbar();
    const {
        handleSubmit: onSubmit, control, register, reset
    } = useForm();
    const { token } = useParams<UserAccountFormUrlParams>();
    const history = useHistory();

    const inputRefs = {
        email: useRef<HTMLInputElement | null>(null),
        password: useRef<HTMLInputElement | null>(null),
        password2: useRef<HTMLInputElement | null>(null)
    };

    const varLogin = variant === 'login';
    const varRegistration = variant === 'registration';
    const varPwdReset = variant === 'password-reset';
    const varPwdResetInit = variant === 'password-reset-init';

    let title = '';
    let description = '';
    let url = '';
    let method: Method = 'post';
    let action = '';
    let altLink: AltLink | null = null;
    let altLink2: AltLink | null = null;
    let handleResponse: ResponseHandler;

    switch (variant) {
        case 'registration':
            title = t('common:registration');
            url = '/api/auth/registration';
            action = t('common:register');
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
                        severity: 'success'
                        // autoHideDuration: null
                    });
                }
            };
            break;

        case 'password-reset':
            title = t('common:password_reset');
            url = '/api/auth/password';
            method = 'put';
            action = t('common:reset_password');
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
                        severity: 'success'
                        // autoHideDuration: null
                    });
                    history.push('/login');
                }
            };
            break;

        case 'password-reset-init':
            title = t('common:forgot_password');
            description = t('common:send_request_for_password_reset');
            url = '/api/auth/password';
            action = t('common:send');
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
            action = t('common:log_in');
            altLink = {
                url: '/registration',
                title: t('common:dont_have_an_account')
            };
            altLink2 = {
                url: '/password-reset',
                title: t('common:forgot_password')
            };
            handleResponse = (response) => {
                setSession({
                    user: response.data.user
                });
            };
            break;
    }

    const handleSubmit: SubmitHandler<FormData> = async (data) => {
        if (isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.request<FormResponse>({
                url,
                method,
                data
            });
            setIsLoading(false);

            setFormErrors({});
            handleResponse(response);
        } catch (error) {
            setIsLoading(false);

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
                setFormErrors(errors);
                focusFormFieldError(errors, inputRefs);
            }
        }
    };

    return (
        <>
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h4">
                    {title}
                </Typography>
                {description && (
                    <Typography className={classes.description} variant="body1" align="center">
                        {description}
                    </Typography>
                )}
                <form className={classes.form} onSubmit={onSubmit(handleSubmit)} noValidate>
                    {varPwdReset && <input type="hidden" value={token} {...register('token')} />}
                    {!varPwdReset && (
                        <Controller
                            name="email"
                            defaultValue=""
                            control={control}
                            rules={{
                                required: t('error:required_field'),
                                pattern: {
                                    value: patterns.emailLoose,
                                    message: t('error:invalid_email')
                                }
                            }}
                            render={({
                                field: { onChange, value, ref },
                                fieldState: { error }
                            }) => (
                                <TextField
                                    id="email"
                                    type="email"
                                    label={t('common:email_address')}
                                    value={value}
                                    error={!!error || !!formErrors.email}
                                    helperText={error?.message || formErrors.email}
                                    inputRef={(ir) => {
                                        inputRefs.email.current = ir;
                                        ref(ir);
                                    }}
                                    variant="filled"
                                    margin="normal"
                                    // disabled={isLoading}
                                    // autoComplete="email"
                                    onChange={(e) => {
                                        setFormErrors((errors) => excludeProps(errors, ['email']));
                                        onChange(e);
                                    }}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    )}
                    {!varPwdResetInit && (
                        <Controller
                            name="password"
                            defaultValue=""
                            control={control}
                            rules={{
                                required: t('error:required_field'),
                                minLength: {
                                    value: minPasswordLength,
                                    message: t('error:short_password', {
                                        count: minPasswordLength
                                    })
                                }
                            }}
                            render={({
                                field: { onChange, value, ref },
                                fieldState: { error }
                            }) => (
                                <PasswordField
                                    id="password"
                                    label={t('common:password')}
                                    value={value}
                                    error={!!error || !!formErrors.password}
                                    helperText={error?.message || formErrors.password}
                                    inputRef={(ir) => {
                                        inputRefs.password.current = ir;
                                        ref(ir);
                                    }}
                                    variant="filled"
                                    margin="normal"
                                    // disabled={isLoading}
                                    // autoComplete="password"
                                    onChange={(e) => {
                                        setFormErrors((errors) => excludeProps(errors, ['password']));
                                        onChange(e);
                                    }}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    )}
                    {(varRegistration || varPwdReset) && (
                        <Controller
                            name="password2"
                            defaultValue=""
                            control={control}
                            rules={{
                                required: t('error:required_field'),
                                validate: (value) => value === inputRefs.password.current?.value
                                    || t('error:password_mismatch')
                            }}
                            render={({
                                field: { onChange, value, ref },
                                fieldState: { error }
                            }) => (
                                <PasswordField
                                    id="password2"
                                    label={t('common:password_confirmation')}
                                    value={value}
                                    error={!!error || !!formErrors.password2}
                                    helperText={error?.message || formErrors.password2}
                                    inputRef={(ir) => {
                                        inputRefs.password2.current = ir;
                                        ref(ir);
                                    }}
                                    variant="filled"
                                    margin="normal"
                                    // disabled={isLoading}
                                    // autoComplete="password"
                                    onChange={(e) => {
                                        setFormErrors((errors) => excludeProps(errors, ['password2']));
                                        onChange(e);
                                    }}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    )}
                    {varLogin && (
                        <FormControlLabel
                            control={(
                                <Controller
                                    name="remember"
                                    defaultValue={false}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Checkbox
                                            name="remember"
                                            value={value}
                                            color="primary"
                                            // disabled={isLoading}
                                            onChange={onChange}
                                        />
                                    )}
                                />
                            )}
                            label={t('common:remember_me')}
                        />
                    )}
                    <div className={classes.submitWrapper}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            fullWidth
                        >
                            {action}
                        </Button>
                        {isLoading && (
                            <CircularProgress size={24} className={classes.submitProgress} />
                        )}
                    </div>
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
