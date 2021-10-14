import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            minHeight: '100vh',
        },
        main: {
            flexGrow: 1,
            marginTop: theme.spacing(7),
            overflow: 'auto',
            '@media (min-width: 0px) and (orientation: landscape)': {
                marginTop: theme.spacing(6),
            },
            [theme.breakpoints.up('sm')]: {
                marginTop: theme.spacing(8),
            },
        },
        mainApplication: {
            height: `calc(100vh - ${theme.spacing(7)}px)`,
            '@media (min-width: 0px) and (orientation: landscape)': {
                height: `calc(100vh - ${theme.spacing(6)}px)`,
            },
            [theme.breakpoints.up('sm')]: {
                height: `calc(100vh - ${theme.spacing(8)}px)`,
            },
        },
        mainContent: {
            padding: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                padding: theme.spacing(3),
            },
        },
        mainSimple: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
    }),
);

export default useStyles;
