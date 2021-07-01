import { ThemeOptions } from '@material-ui/core/styles';

export const overrides = {};

const theme: ThemeOptions = {
    palette: {
        type: 'light',
        primary: {
            main: '#1976d2',
            light: '#4791db',
            dark: '#115293',
            contrastText: '#fff'
        },
        secondary: {
            main: '#dc004e',
            light: '#e33371',
            dark: '#9a0036',
            contrastText: '#fff'
        },
        error: {
            contrastText: '#fff',
            dark: '#d32f2f',
            light: '#e57373',
            main: '#f44336'
        },
        warning: {
            contrastText: 'rgba(0, 0, 0, 0.87)',
            dark: '#f57c00',
            light: '#ffb74d',
            main: '#ff9800'
        },
        info: {
            contrastText: '#fff',
            dark: '#1976d2',
            light: '#64b5f6',
            main: '#2196f3'
        },
        success: {
            contrastText: 'rgba(0, 0, 0, 0.87)',
            dark: '#388e3c',
            light: '#81c784',
            main: '#4caf50'
        }
    }
};

export default theme;
