import lightTheme from './light';
import darkTheme from './dark';
import { mergeDeep } from '../utils/misc';

const theme = {
    overrides: {
        MuiCssBaseline: {
            '@global': {}
        },
        MuiDialog: {
            paper: {
                margin: 16,
                '@media (min-width: 600px)': {
                    margin: 24
                }
            },
            paperWidthFalse: {
                maxWidth: 'calc(100% - 32px)',
                '@media (min-width: 600px)': {
                    maxWidth: 'calc(100% - 48px)'
                }
            },
            paperScrollPaper: {
                maxHeight: 'calc(100% - 32px)',
                '@media (min-width: 600px)': {
                    maxHeight: 'calc(100% - 48px)'
                }
            }
        },
        MuiTab: {
            root: {
                '@media (min-width: 600px)': {
                    minWidth: 90
                }
            }
        },
        MuiTooltip: {
            tooltip: {
                fontSize: 12
            }
        }
    },
    palette: {
        error: {
            dark: '#d32f2f',
            light: '#e57373',
            main: '#f44336'
        },
        info: {
            dark: '#1976d2',
            light: '#64b5f6',
            main: '#2196f3'
        },
        success: {
            contrastText: 'rgba(0, 0, 0, 0.7)',
            dark: '#388e3c',
            light: '#81c784',
            main: '#4caf50'
        },
        warning: {
            contrastText: 'rgba(0, 0, 0, 0.7)',
            dark: '#f57c00',
            light: '#ffb74d',
            main: '#ff9800'
        }
    }
};

const themes = {
    light: mergeDeep({}, theme, lightTheme),
    dark: mergeDeep({}, theme, darkTheme)
};

export default themes;
