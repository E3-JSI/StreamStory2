import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        closeButton: {
            height: theme.spacing(6),
            marginTop: -theme.spacing(1),
            marginLeft: theme.spacing(1),
            // marginLeft: 'auto',
        },
        details: {
            height: '100%',
        },
    }),
);

export default useStyles;
