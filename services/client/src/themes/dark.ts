import { ThemeOptions } from '@material-ui/core/styles';

const theme: ThemeOptions = {
    overrides: {
        MuiCssBaseline: {
            '@global': {}
        }
    },
    palette: {
        type: 'dark',
        background: {
            default: '#212121',
            secondary: '#333'
        },
        primary: {
            main: '#90caf9'
        },
        secondary: {
            main: '#f48fb1'
        }
    }
};

export default theme;
