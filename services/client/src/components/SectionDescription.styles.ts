import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            fontSize: '1.125rem',
            [theme.breakpoints.up('md')]: {
                fontSize: '1.25rem',
            },
        },
    }),
);

export default useStyles;
