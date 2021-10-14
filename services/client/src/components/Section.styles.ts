import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'relative',
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
            [theme.breakpoints.up('sm')]: {
                paddingTop: theme.spacing(6),
                paddingBottom: theme.spacing(6),
            },
            [theme.breakpoints.up('md')]: {
                paddingTop: theme.spacing(8),
                paddingBottom: theme.spacing(8),
            },
            '& > svg': {
                position: 'absolute',
                zIndex: -1,
                fill: theme.palette.background.secondary,
            },
        },
        rootSecondary: {
            backgroundColor: theme.palette.background.secondary,
        },
        rootBorderTop: {
            borderTop: `1px solid ${theme.palette.divider}`,
        },
        rootBorderBottom: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    }),
);

export default useStyles;
