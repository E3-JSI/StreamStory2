import React from 'react';

import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getResponseErrors } from '../utils/errors';
import { validationPatterns } from '../utils/forms';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import useMountEffect from '../hooks/useMountEffect';
import UserAccountForm from '../components/UserAccountForm';

export interface LoginUrlParams {
    token?: string;
}

function Login(): JSX.Element {
    const history = useHistory();
    const { t } = useTranslation();
    const [, /* session */ setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const { token } = useParams<LoginUrlParams>();

    function redirect() {
        history.push('/login');
    }

    useMountEffect(() => {
        // Try to activate user if activation token is provided in url.
        if (!token) {
            return;
        }

        if (!token.match(validationPatterns.userToken)) {
            redirect();
        }

        async function activate() {
            try {
                setSession({ isPageLoading: true });
                const response = await axios.post('/api/auth/activation', { token });
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

        activate();
    });

    return <UserAccountForm variant="login" />;
}

export default Login;
