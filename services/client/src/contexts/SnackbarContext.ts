import React from 'react';

import { SnackbarOrigin } from '@material-ui/core/Snackbar';
import { AlertProps } from '@material-ui/lab/Alert';

export interface SnackbarProps {
    title?: string;
    message: string | string[];
    severity?: AlertProps['severity'];
    variant?: AlertProps['variant'];
    anchorOrigin?: SnackbarOrigin;
    autoHideDuration?: number | null;
    elevation?: number | undefined;
}

export type ShowSnackbar = (props: SnackbarProps) => void;
export type HideSnackbar = () => void;

export type Snackbar = SnackbarProps & {
    open: boolean;
    show: null | ShowSnackbar;
    hide: null | HideSnackbar;
};

const SnackbarContext = React.createContext<Snackbar>({
    title: '',
    message: '',
    severity: 'info',
    variant: 'filled',
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center'
    },
    autoHideDuration: 20000,
    elevation: 6,
    open: false,
    show: null,
    hide: null
});

export default SnackbarContext;
