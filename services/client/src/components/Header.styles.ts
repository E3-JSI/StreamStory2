import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { setColorOpacity } from '../utils/misc';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
            backgroundColor:
                theme.palette.type === 'light'
                    ? theme.palette.primary.main
                    : theme.palette.background.secondary,
        },
        rootPublic: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.secondary,
            transition: theme.transitions.create(['transform', 'visibility'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
            }),
        },
        rootHidden: {
            visibility: 'hidden',
            transform: 'translate3d(0, -100%, 0)',
        },
        menuButton: {
            marginRight: theme.spacing(0.5),
            [theme.breakpoints.up('sm')]: {
                marginRight: theme.spacing(1.5),
            },
        },
        logoLink: {
            '&:hover': {
                textDecoration: 'none',
            },
        },
        logoLinkPublic: {
            '& > b': {
                color: theme.palette.primary.main,
            },
        },
        loginButton: {
            marginLeft: theme.spacing(1),
            textTransform: 'none',
            backgroundColor: setColorOpacity(
                theme.palette.primary.main,
                theme.palette.type === 'light' ? 0.08 : 0.12,
            ),
        },
        avatarButton: {
            padding: theme.spacing(1),
            marginRight: -theme.spacing(1),
            marginLeft: theme.spacing(0.5),
            [theme.breakpoints.up('sm')]: {
                padding: theme.spacing(0.5),
                marginRight: -theme.spacing(0.5),
                marginLeft: theme.spacing(1),
            },
        },
        avatar: {
            width: theme.spacing(4),
            height: theme.spacing(4),
            fontSize: theme.typography.body1.fontSize,
            color: theme.palette.getContrastText(theme.palette.primary.light),
            backgroundColor: theme.palette.primary.light,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(5),
                height: theme.spacing(5),
                fontSize: theme.typography.h6.fontSize,
            },
        },
    }),
);

export default useStyles;
