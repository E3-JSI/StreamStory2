import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    listItemIcon: {
        minWidth: 0,
        marginRight: theme.spacing(2)
    }
}));

export default useStyles;
