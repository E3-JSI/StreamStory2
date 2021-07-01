import React, { useContext, useState } from 'react';

import { Typography } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import SnackbarContext, { SnackbarProps } from '../contexts/SnackbarContext';

export interface SnackbarProviderProps {
    children: React.ReactNode;
}

function SnackbarProvider({ children }: SnackbarProviderProps): JSX.Element {
    const [snackbar, setSnackbar] = useState(useContext(SnackbarContext));

    function handleClose(event?: React.SyntheticEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        if (snackbar.hide) {
            snackbar.hide();
        }
    }

    // Pass `show` function to SnackbarContext.Provider
    snackbar.show = (props: SnackbarProps) => {
        setSnackbar((prevSnackbar) => ({
            ...prevSnackbar,
            ...props,
            open: true
        }));
    };

    // Pass `hide` function to SnackbarContext.Provider
    snackbar.hide = () => {
        setSnackbar((prevSnackbar) => ({
            ...prevSnackbar,
            open: false
        }));
    };

    const key = Array.isArray(snackbar.message) ? snackbar.message.join(' ') : snackbar.message;
    const message = Array.isArray(snackbar.message)
        ? snackbar.message.map((m, i) => (
            <Typography key={`msg${i + 1}:${m}`} variant="body2">
                {m}
            </Typography>
        ))
        : snackbar.message;

    return (
        <SnackbarContext.Provider value={snackbar}>
            {children}
            <Snackbar
                key={key}
                autoHideDuration={snackbar.autoHideDuration}
                open={snackbar.open}
                anchorOrigin={snackbar.anchorOrigin}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={snackbar.severity}
                    elevation={snackbar.elevation}
                    variant={snackbar.variant}
                >
                    {snackbar.title && <AlertTitle>{snackbar.title}</AlertTitle>}
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}

export default SnackbarProvider;
