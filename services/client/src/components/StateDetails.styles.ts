import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingRight: theme.spacing(2),
            paddingLeft: theme.spacing(2),
        },
        title: {
            flex: '1 1 100%',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        formButtons: {
            marginTop: theme.spacing(0.5),
        },
        attributesTitle: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            fontSize: theme.typography.pxToRem(18),
        },
    }),
);

export default useStyles;
