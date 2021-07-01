import lightTheme, { overrides as lightOverrides } from './light';
import darkTheme, { overrides as darkOverrides } from './dark';

const overrides = {
    MuiTooltip: {
        tooltip: {
            fontSize: 12
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
