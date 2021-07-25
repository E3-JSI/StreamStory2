import React, { useMemo, useState } from 'react';

import axios from 'axios';
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

import { getUserSession } from './contexts/SessionContext';
import useMountEffect from './hooks/useMountEffect';
import useSession from './hooks/useSession';
import PageRoute from './components/PageRoute';
import PageProgress from './components/PageProgress';
import SnackbarProvider from './components/SnackbarProvider';
import themes from './themes';
import './i18n/config';

function App(): JSX.Element {
    const [session, setSession] = useSession();
    const [syncing, setSyncing] = useState(true);
    const preferredTheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const selectedTheme = session.theme === 'system' ? preferredTheme : session.theme;
    const muiTheme = useMemo(
        () => createMuiTheme(themes[selectedTheme]),
        // Recreate theme only when switched.
        [selectedTheme]
    );

    // Sync user/login status.
    useMountEffect(() => {
        async function getStatus() {
            try {
                const response = await axios.get('/api/auth/status');

                if (response.data.user) {
                    setSession(getUserSession(response.data.user));
                }

                setSyncing(false);
                setSession({ pageLoading: false });
            } catch {
                setSyncing(false);
                setSession({ pageLoading: false });
            }
        }

        getStatus();
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <PageProgress open={session.pageLoading} />
            {!syncing && (
                <SnackbarProvider>
                    <Router>
                        <Switch>
                            {/* Private routes */}
                            <PageRoute
                                path="/profile/:tab?"
                                type="private"
                                layout="dashboard"
                                component={UserProfile}
                                exact
                            />
                            <PageRoute
                                path="/dashboard/:view"
                                type="private"
                                layout="dashboard"
                                component={Dashboard}
                                exact
                            />
                            <PageRoute
                                path="/model/:id"
                                type="private"
                                layout="dashboard"
                                component={Model}
                                exact
                            />
                            {/* Restricted routes */}
                            <PageRoute
                                path="/login/:token?"
                                type="restricted"
                                layout="simple"
                                component={Login}
                                exact
                            />
                            <PageRoute
                                path="/registration"
                                type="restricted"
                                layout="simple"
                                component={Registration}
                                exact
                            />
                            <PageRoute
                                path="/password-reset/:token?"
                                type="restricted"
                                layout="simple"
                                component={PasswordReset}
                                exact
                            />
                            {/* Public routes */}
                            <PageRoute path="/" type="public" layout="content" component={Home} />
                        </Switch>
                    </Router>
                </SnackbarProvider>
            )}
        </ThemeProvider>
    );
}

export default App;
