import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            fontWeight: theme.typography.fontWeightBold,
            fontSize: '2rem',
            [theme.breakpoints.up('sm')]: {
                fontSize: '2.5rem',
            },
            [theme.breakpoints.up('md')]: {
                fontSize: '2.75rem',
            },
            [theme.breakpoints.up('lg')]: {
                fontSize: '3rem',
            },
        },
    }),
);

export default useStyles;
