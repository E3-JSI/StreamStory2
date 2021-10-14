import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            fontSize: '2.375rem',
            [theme.breakpoints.up('sm')]: {
                fontSize: '3rem',
            },
            [theme.breakpoints.up('md')]: {
                fontSize: '3.375rem',
            },
            [theme.breakpoints.up('lg')]: {
                fontSize: '3.75rem',
            },
        },
    }),
);

export default useStyles;
