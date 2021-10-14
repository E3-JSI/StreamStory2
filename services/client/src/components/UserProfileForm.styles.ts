import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: theme.breakpoints.values.sm,
        },
        buttons: {
            marginTop: theme.spacing(3),
        },
    }),
);

export default useStyles;
