import React, { useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CssBaseline, useMediaQuery } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Model from './pages/Model';
import ModelIframe from './pages/ModelIframe';
import PasswordReset from './pages/PasswordReset';
import Registration from './pages/Registration';
import UserProfile from './pages/UserProfile';

import { getNotifications } from './api/notifications';
import { getAuthStatus } from './api/auth';
import { SessionProps } from './contexts/SessionContext';
import { ShowSnackbar } from './contexts/SnackbarContext';
import useMountEffect from './hooks/useMountEffect';
import useSnackbar from './hooks/useSnackbar';
import useSession from './hooks/useSession';
import PageRoute from './components/PageRoute';
import PageProgress from './components/PageProgress';
import SnackbarProvider from './components/SnackbarProvider';
import themes from './themes';
import './i18n/config';

function App(): JSX.Element {
    const { t } = useTranslation();
    const [session, setSession] = useSession();
    const [syncing, setSyncing] = useState(true);
    const [showSnackbar] = useSnackbar();
    const preferredTheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const selectedTheme = session.theme === 'system' ? preferredTheme : session.theme;
    const muiTheme = useMemo(
        () => createMuiTheme(themes[selectedTheme]),
        // Recreate theme only when switched.
        [selectedTheme],
    );
    const sessionRef = useRef<Required<SessionProps> | null>(null);
    const showSnackbarRef = useRef<ShowSnackbar | null>(null);

    sessionRef.current = session;
    showSnackbarRef.current = showSnackbar;

    // Sync user/login status.
    useMountEffect(() => {
        async function loadStatus() {
            try {
                const response = await getAuthStatus();

                if (response.data.user) {
                    const {
                        data: { notifications },
                    } = await getNotifications(response.data.user.id, true);
                    setSession({
                        user: response.data.user,
                        notifications,
                    });
                }

                setSyncing(false);
                setSession({ isPageLoading: false });
            } catch {
                setSyncing(false);
                setSession({ isPageLoading: false });
            }
        }

        async function updateStatus() {
            const { current: currentSession } = sessionRef;

            try {
                const {
                    data: { user },
                } = await getAuthStatus();

                if (user) {
                    const {
                        data: { notifications },
                    } = await getNotifications(user.id, true);

                    if (
                        notifications &&
                        currentSession &&
                        notifications.length > currentSession.notifications.length &&
                        showSnackbarRef.current !== null
                    ) {
                        const numNewMessages =
                            notifications.length - currentSession.notifications.length;
                        showSnackbarRef.current({
                            message: t('you_have_n_new_messages' as Parameters<typeof t>[0], {
                                count: numNewMessages,
                            }) as string,
                            severity: 'info',
                        });
                    }

                    setSession({
                        user,
                        notifications,
                    });
                } else if (user === null && currentSession && currentSession.user !== null) {
                    setSession({
                        user: null,
                        currentModel: [],
                        notifications: [],
                    });
                }
            } catch (error) {
                // Failed to update status.
            }
        }

        loadStatus();
        const interval = setInterval(updateStatus, 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <PageProgress open={session.isPageLoading} />
            {!syncing && (
                <SnackbarProvider>
                    <Router>
                        <Switch>
                            {/* Private routes */}
                            <PageRoute
                                path="/profile/:tab?/:item?"
                                type="private"
                                variant="application"
                                component={UserProfile}
                                exact
                            />
                            <PageRoute
                                path="/dashboard/:view?"
                                type="private"
                                variant="application"
                                component={Dashboard}
                                exact
                            />
                            <PageRoute
                                path="/model/:id"
                                type="private"
                                variant="application"
                                component={Model}
                                exact
                            />
                            {/* Restricted routes */}
                            <PageRoute
                                path="/login/:action?/:token?"
                                type="restricted"
                                variant="simple"
                                component={Login}
                                exact
                            />
                            <PageRoute
                                path="/registration"
                                type="restricted"
                                variant="simple"
                                component={Registration}
                                exact
                            />
                            <PageRoute
                                path="/password-reset/:token?"
                                type="restricted"
                                variant="simple"
                                component={PasswordReset}
                                exact
                            />
                            {/* Public routes */}
                            <PageRoute
                                path="/iframe/model/:id?"
                                type="public"
                                variant="iframe"
                                component={ModelIframe}
                            />
                            <PageRoute path="/" type="public" variant="content" component={Home} />
                        </Switch>
                    </Router>
                </SnackbarProvider>
            )}
        </ThemeProvider>
    );
}

export default App;
