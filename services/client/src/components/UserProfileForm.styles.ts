import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    buttons: {
        marginTop: theme.spacing(3)
    }
}));

export default useStyles;
