import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        paper: {
            width: 'auto',
        },
        drawer: {
            width: 'auto',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        drawerContainer: {
            overflowX: 'hidden',
            overflowY: 'auto',
        },
        toolbar: {
            borderBottomWidth: 1,
            borderBottomColor: theme.palette.divider,
            borderBottomStyle: 'solid',
        },
        closeButton: {
            marginRight: theme.spacing(0.5),
            [theme.breakpoints.up('sm')]: {
                marginRight: theme.spacing(1.5),
            },
        },
        logoLink: {
            '&:hover': {
                textDecoration: 'none',
            },
            '& > b': {
                color: theme.palette.primary.main,
            },
        },
        navItem: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            '&.active': {
                backgroundColor: theme.palette.action.selected,
            },
            [theme.breakpoints.up('sm')]: {
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(3),
            },
        },
        navItemCollapsed: {
            flexDirection: 'column',
        },
        navItemIcon: {
            minWidth: theme.spacing(5),
            [theme.breakpoints.up('sm')]: {
                minWidth: theme.spacing(6),
            },
        },
        navItemIconCollapsed: {
            minWidth: 0,
        },
        navItemText: {
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
            }),
        },
        navItemTextCollapsed: {
            opacity: 0,
        },
    }),
);

export default useStyles;
