import { ThemeOptions } from '@material-ui/core/styles';

const theme: ThemeOptions = {
    overrides: {
        MuiCssBaseline: {
            '@global': {}
        },
        MuiButton: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }
            }
        },
        MuiIconButton: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }
            }
        }
    },
    palette: {
        type: 'light',
        background: {
            default: '#f7f9fc',
            secondary: '#fff'
        },
        primary: {
            main: '#1976d2'
        },
        secondary: {
            main: '#dc004e'
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.7)'
        }
    }
};

export default theme;
