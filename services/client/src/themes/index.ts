import { ThemeOptions } from '@material-ui/core';
import type {} from '@material-ui/lab/themeAugmentation';

import lightTheme from './light';
import darkTheme from './dark';
import { mergeDeep } from '../utils/misc';

const theme: ThemeOptions = {
    props: {
        MuiTextField: {
            size: 'small',
            variant: 'outlined',
        },
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    position: 'relative',
                },
                '.overflowHidden': {
                    overflow: 'hidden',
                },
                '@keyframes fadeIn': {
                    '0%': {
                        opacity: 0,
                    },
                    '100%': {
                        opacity: 1,
                    },
                },
                '@keyframes fadeOut': {
                    '0%': {
                        opacity: 1,
                    },
                    '100%': {
                        opacity: 0,
                    },
                },
            },
        },
        MuiAlert: {
            icon: {
                '@media (max-width: 599px)': {
                    display: 'none',
                },
            },
        },
        MuiDialog: {
            paper: {
                maxWidth: 'calc(100% - 32px)',
                margin: 16,
                '@media (min-width: 600px)': {
                    maxWidth: 'calc(100% - 48px)',
                    margin: 24,
                },
            },
            paperFullWidth: {
                width: 'calc(100% - 32px)',
                '@media (min-width: 600px)': {
                    width: 'calc(100% - 48px)',
                },
            },
            paperWidthFalse: {
                maxWidth: 'calc(100% - 32px)',
                '@media (min-width: 600px)': {
                    maxWidth: 'calc(100% - 48px)',
                },
            },
            paperScrollPaper: {
                maxHeight: 'calc(100% - 32px)',
                '@media (min-width: 600px)': {
                    maxHeight: 'calc(100% - 48px)',
                },
            },
        },
        MuiDialogContent: {
            root: {
                paddingRight: 16,
                paddingLeft: 16,
                paddingTop: 12,
                paddingBottom: 12,
                '@media (min-width: 0px) and (orientation: landscape)': {
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                '@media (min-width: 600px)': {
                    paddingRight: 24,
                    paddingLeft: 24,
                    paddingTop: 16,
                    paddingBottom: 16,
                },
            },
            dividers: {
                padding: 16,
                '@media (min-width: 600px)': {
                    paddingRight: 24,
                    paddingLeft: 24,
                },
            },
        },
        MuiDialogTitle: {
            root: {
                paddingRight: 16,
                paddingLeft: 16,
                paddingTop: 12,
                paddingBottom: 12,
                '@media (min-width: 0px) and (orientation: landscape)': {
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                '@media (min-width: 600px)': {
                    paddingRight: 24,
                    paddingLeft: 24,
                    paddingTop: 16,
                    paddingBottom: 16,
                },
            },
        },
        MuiIconButton: {
            sizeSmall: {
                padding: 5,
                '&.MuiIconButton-edgeEnd': {
                    marginRight: -5,
                },
                '&.MuiIconButton-edgeStart': {
                    marginLeft: -5,
                },
                '& .MuiSvgIcon-root': {
                    width: 20,
                    height: 20,
                },
            },
        },
        MuiListItemIcon: {
            root: {
                '&.narrow': {
                    minWidth: 0,
                    marginRight: 16,
                },
            },
        },
        MuiPopover: {
            root: {
                '&::before': {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: -1,
                    content: '""',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    animation: 'fadeIn 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms forwards',
                },
                '&[aria-hidden="true"]::before': {
                    animation: 'fadeOut 195ms cubic-bezier(0.4, 0, 0.2, 1) 0ms forwards',
                },
            },
        },
        MuiTab: {
            root: {
                '@media (min-width: 600px)': {
                    minWidth: 90,
                },
            },
        },
        MuiToolbar: {
            regular: {
                // '@media (min-width: 0px) and (orientation: landscape)': {
                //     minHeight: 56
                // }
            },
        },
        MuiTooltip: {
            tooltip: {
                fontSize: '0.75rem',
            },
        },
    },
    palette: {
        error: {
            dark: '#d32f2f',
            light: '#e57373',
            main: '#f44336',
        },
        info: {
            dark: '#1976d2',
            light: '#64b5f6',
            main: '#2196f3',
        },
        success: {
            contrastText: 'rgba(0, 0, 0, 0.7)',
            dark: '#388e3c',
            light: '#81c784',
            main: '#4caf50',
        },
        warning: {
            contrastText: 'rgba(0, 0, 0, 0.7)',
            dark: '#f57c00',
            light: '#ffb74d',
            main: '#ff9800',
        },
    },
    timing: {
        tooltipEnterDelay: 750,
    },
};

const themes = {
    light: mergeDeep({}, theme, lightTheme),
    dark: mergeDeep({}, theme, darkTheme),
};

export default themes;
