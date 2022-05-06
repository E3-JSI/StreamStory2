import React from 'react';

import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { activateAccount, logInWithOauth } from '../api/auth';
import { getNotifications } from '../api/notifications';
import { getResponseErrors } from '../utils/errors';
import { validationPatterns } from '../utils/forms';
import config from '../config';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import useMountEffect from '../hooks/useMountEffect';
import UserAccountForm from '../components/UserAccountForm';

export enum LoginAction {
    activation = 'activation',
    oauth = 'oauth',
}
export interface LoginUrlParams {
    action?: string;
    token?: string;
}

function Login(): JSX.Element {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const { action, token } = useParams<LoginUrlParams>();
    const [, /* session */ setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    const siteUrl = config.url.replace(/:(80)?$/, '');

    function redirect() {
        history.push('/login');
    }

    useMountEffect(() => {
        async function activate() {
            try {
                setSession({ isPageLoading: true });
                const response = await activateAccount({ token: token || '' });
                setSession({ isPageLoading: false });

                if (response.data.success) {
                    showSnackbar({
                        title: t('successful_account_activation.title'),
                        message: t('successful_account_activation.message'),
                        severity: 'success',
                        autoHideDuration: null,
                    });
                }
            } catch (error) {
                setSession({ isPageLoading: false });

                const errors = getResponseErrors(error, t);

                if (Array.isArray(errors)) {
                    showSnackbar({
                        message: errors,
                        severity: 'error',
                    });
                }
            }

            redirect();
        }

        async function login(code: string, state: string) {
            try {
                setSession({ isPageLoading: true });
                const response = await logInWithOauth({
                    code,
                    state,
                    redirectUri: `${siteUrl}/login/oauth`,
                });

                if (response.data.user) {
                    const {
                        data: { notifications },
                    } = await getNotifications(response.data.user.id, true);
                    setSession({
                        user: response.data.user,
                        notifications,
                    });
                }

                setSession({ isPageLoading: false });
            } catch (error) {
                setSession({ isPageLoading: false });

                const errors = getResponseErrors(error, t);

                if (Array.isArray(errors)) {
                    showSnackbar({
                        message: errors,
                        severity: 'error',
                    });
                }

                redirect();
            }
        }

        switch (action) {
            case LoginAction.activation: {
                // Try to activate user if activation token is provided in url.
                if (!token || !token.match(validationPatterns.userToken)) {
                    redirect();
                    break;
                }

                activate();
                break;
            }
            case LoginAction.oauth: {
                const searchParams = new URLSearchParams(location.search.slice(1));
                const code = searchParams.get('code');
                const state = searchParams.get('state');

                if (!code || !state) {
                    redirect();
                    break;
                }

                login(code, state);
                break;
            }
            default:
                if (action) {
                    redirect();
                }

                break;
        }
    });

    return <UserAccountForm variant="login" />;
}

export default Login;
