import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
            backgroundColor: theme.palette.background.secondary,
            borderTop: `1px solid ${theme.palette.divider}`,
        },
    }),
);

export default useStyles;
