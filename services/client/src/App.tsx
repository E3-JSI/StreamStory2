import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { CssBaseline, useMediaQuery } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Model from './pages/Model';
import PasswordReset from './pages/PasswordReset';
import Registration from './pages/Registration';
import UserProfile from './pages/UserProfile';

import { getAuthStatus } from './api/auth';
import useMountEffect from './hooks/useMountEffect';
import useSession from './hooks/useSession';
import PageRoute from './components/PageRoute';
import PageProgress from './components/PageProgress';
import SnackbarProvider from './components/SnackbarProvider';
import themes from './themes';
import './i18n/config';
import ModelIframe from './pages/ModelIframe';

function App(): JSX.Element {
    const [session, setSession] = useSession();
    const [syncing, setSyncing] = useState(true);
    const preferredTheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const selectedTheme = session.theme === 'system' ? preferredTheme : session.theme;
    const muiTheme = useMemo(
        () => createMuiTheme(themes[selectedTheme]),
        // Recreate theme only when switched.
        [selectedTheme],
    );

    // Sync user/login status.
    useMountEffect(() => {
        async function loadStatus() {
            try {
                const response = await getAuthStatus();

                if (response.data.user) {
                    setSession({ user: response.data.user });
                }

                setSyncing(false);
                setSession({ isPageLoading: false });
            } catch {
                setSyncing(false);
                setSession({ isPageLoading: false });
            }
        }

        loadStatus();
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
                                path="/profile/:tab?"
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
                            <PageRoute path="/" type="public" variant="content" component={Home} />
                            <PageRoute
                                path="/iframe/model/:id?"
                                type="public"
                                variant="iframe"
                                component={ModelIframe}
                            />
                        </Switch>
                    </Router>
                </SnackbarProvider>
            )}
        </ThemeProvider>
    );
}

export default App;
