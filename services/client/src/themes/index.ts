import lightTheme, { overrides as lightOverrides } from './light';
import darkTheme, { overrides as darkOverrides } from './dark';

const overrides = {
    MuiCssBaseline: {
        // Override global styles
        '@global': {}
    },
    MuiTooltip: {
        tooltip: {
            fontSize: 12
        }
    },
    MuiTab: {
        root: {
            '@media (min-width: 600px)': {
                minWidth: 90
            }
        }
    }
};

const themes = {
    light: {
        ...lightTheme,
        overrides: {
            ...overrides,
            ...lightOverrides
        }
    },
    dark: {
        ...darkTheme,
        overrides: {
            ...overrides,
            ...darkOverrides
        }
    }
};

export default themes;
