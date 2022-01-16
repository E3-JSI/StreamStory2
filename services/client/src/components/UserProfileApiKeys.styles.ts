import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            // TODO: Remove example
            color: theme.palette.primary.main,
        },
    }),
);

export default useStyles;
