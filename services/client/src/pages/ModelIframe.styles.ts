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
        toolbar: {
            paddingRight: theme.spacing(2),
            paddingLeft: theme.spacing(2),
        },
        title: {
            flex: '1 1 100%',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
    }),
);

export default useStyles;
