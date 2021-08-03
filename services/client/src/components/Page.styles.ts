import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        display: 'flex',
        minHeight: '100vh'
    },
    main: {
        flexGrow: 1,
        marginTop: theme.spacing(7),
        overflow: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(8)
        }
    },
    mainContent: {
        padding: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(3)
        }
    },
    mainSimple: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));

export default useStyles;
