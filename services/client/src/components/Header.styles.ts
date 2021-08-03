import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor:
                theme.palette.type === 'light'
                    ? theme.palette.primary.main
                    : theme.palette.background.secondary
    },
    menuButton: {
        marginRight: theme.spacing(0.5),
        [theme.breakpoints.up('sm')]: {
            marginRight: theme.spacing(1.5)
        }
    },
    titleLink: {
        '&:hover': {
            textDecoration: 'none'
        }
    },
    loginButton: {
        marginLeft: theme.spacing(1),
        textTransform: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.16)'
    },
    avatarButton: {
        padding: theme.spacing(1),
        marginRight: -theme.spacing(1),
        marginLeft: theme.spacing(0.5),
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(0.5),
            marginRight: -theme.spacing(0.5),
            marginLeft: theme.spacing(1)
        }
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
            fontSize: theme.typography.h6.fontSize
        }
    }
}));

export default useStyles;
