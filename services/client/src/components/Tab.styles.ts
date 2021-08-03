import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(1, 2),
        minHeight: theme.spacing(6),
        '& > .MuiTab-wrapper': {
            flexDirection: 'row',
            '& > *:first-child': {
                marginBottom: 0,
                marginRight: theme.spacing(1)
            }
        }
    }
}));

export default useStyles;
