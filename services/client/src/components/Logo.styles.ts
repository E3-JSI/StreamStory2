import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        bold: {
            fontWeight: theme.typography.fontWeightMedium,
        },
        italic: {
            fontWeight: theme.typography.fontWeightLight,
        },
    }),
);

export default useStyles;
