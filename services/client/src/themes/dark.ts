import { ThemeOptions } from '@material-ui/core/styles';

export const overrides = {
    MuiCssBaseline: {
        '@global': {
            body: {
                backgroundColor: '#212121'
            }
        }
    }
};

const theme: ThemeOptions = {
    palette: {
        type: 'dark',
        primary: {
            main: '#90caf9',
            light: '#a6d4fa',
            dark: '#648dae',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        secondary: {
            main: '#f48fb1',
            light: '#f6a5c0',
            dark: '#aa647b',
            contrastText: 'rgba(0, 0, 0, 0.87)'
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
