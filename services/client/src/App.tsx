import React, { useMemo } from 'react';

import axios from 'axios';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Model from './pages/Model';
import PasswordReset from './pages/PasswordReset';
import Registration from './pages/Registration';
import UserProfile from './pages/UserProfile';

import useMountEffect from './hooks/useMountEffect';
import useSession from './hooks/useSession';
import PageRoute from './components/PageRoute';
import PageProgress from './components/PageProgress';
import SnackbarProvider from './components/SnackbarProvider';
import themes from './themes';
import './i18n/config';

function App(): JSX.Element {
    const [session, setSession] = useSession();

    const muiTheme = useMemo(
        () => createMuiTheme(themes[session.theme]),
        // Recreate theme only when switched.
        [session.theme]
    );

    // Sync user/login status.
    useMountEffect(() => {
        async function getStatus() {
            try {
                const response = await axios.get('/api/auth/status');

                if (response.data.user) {
                    setSession({ user: response.data.user });
                }

                setSession({ isLoading: false });
            } catch {
                setSession({ isLoading: false });
            }
        }

        getStatus();
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <PageProgress open={session.isLoading} />
            {!session.isLoading && (
                <Router>
                    <SnackbarProvider>
                        <Switch>
                            {/* Private routes */}
                            <PageRoute
                                path="/profile"
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
                    </SnackbarProvider>
                </Router>
            )}
        </ThemeProvider>
    );
}

export default App;
