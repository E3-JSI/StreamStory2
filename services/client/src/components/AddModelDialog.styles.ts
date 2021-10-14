import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            display: 'flex',
            alignItems: 'center',
            '& > h2': {
                marginRight: 'auto',
            },
        },
        closeButton: {
            marginTop: -theme.spacing(1.5),
            marginBottom: -theme.spacing(1.5),
        },
        content: {
            // padding: 0
        },
        buttons: {
            // marginTop: theme.spacing(1)
        },
        config: {
            maxWidth: theme.breakpoints.values.sm,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    }),
);

export default useStyles;
