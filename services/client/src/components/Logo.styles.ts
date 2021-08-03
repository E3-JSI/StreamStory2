import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    stream: {
        fontWeight: theme.typography.fontWeightMedium
    },
    story: {
        fontWeight: theme.typography.fontWeightLight
    }
}));

export default useStyles;
