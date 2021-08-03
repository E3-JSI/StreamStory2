import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    listItemIcon: {
        minWidth: 0,
        marginRight: theme.spacing(2)
    },
    listItemIconSelected: {
        marginRight: 0,
        marginLeft: theme.spacing(2)
    },
    listItemIconEmpty: {
        minWidth: theme.spacing(5)
    }
}));

export default useStyles;
