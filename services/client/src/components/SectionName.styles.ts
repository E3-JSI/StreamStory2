import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            fontWeight: theme.typography.fontWeightMedium,
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
        },
    }),
);

export default useStyles;
