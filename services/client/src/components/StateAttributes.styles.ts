import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        attributesTitle: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            fontSize: theme.typography.pxToRem(18),
        },
        histogramBox: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
            textAlign: 'center',
        }
    }),
);

export default useStyles;
