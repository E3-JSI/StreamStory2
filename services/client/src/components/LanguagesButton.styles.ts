import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        listItemIcon: {
            fontSize: '1.25rem',
        },
        listItemIconSelected: {
            minWidth: 0,
            marginLeft: theme.spacing(2),
        },
        listItemIconEmpty: {
            minWidth: theme.spacing(4.5),
        },
        listItemText: {
            flexGrow: 1,
        },
    }),
);

export default useStyles;
