import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minInlineSize: 0,
            margin: 0,
            padding: 0,
            borderWidth: 0,
        },
        rootDivider: {
            borderTopWidth: 1,
            borderTopStyle: 'dashed',
            borderTopColor: theme.palette.divider,
        },
        rootGutterTop: {
            marginTop: theme.spacing(2),
        },
        rootGutterBottom: {
            marginBottom: theme.spacing(1),
        },
        legend: {
            padding: 0,
            marginBottom: 0,
        },
        legendDivider: {
            paddingRight: theme.spacing(0.5),
        },
    }),
);

export default useStyles;
