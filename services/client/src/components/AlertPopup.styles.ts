import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        icon: {
            color: 'inherit',
            fontSize: 'inherit',
        },
        iconError: {
            color: theme.palette.error.main,
        },
        iconInfo: {
            color: theme.palette.info.main,
        },
        iconSuccess: {
            color: theme.palette.success.main,
        },
        iconWarning: {
            color: theme.palette.warning.main,
        },
        iconStart: {
            marginRight: theme.spacing(0.5),
        },
        iconEnd: {
            marginLeft: theme.spacing(0.5),
        },
        popover: {
            pointerEvents: 'none',
        },
        popoverPaper: {},
        popoverPaperAuto: {
            width: 'auto',
        },
        popoverPaperXs: {
            width: 400,
        },
        popoverPaperSm: {
            width: theme.breakpoints.values.sm,
        },
        popoverPaperMd: {
            width: theme.breakpoints.values.md,
        },
        popoverPaperLg: {
            width: theme.breakpoints.values.lg,
        },
        popoverPaperXl: {
            width: theme.breakpoints.values.xl,
        },
        alertContent: {
            '& :first-child': {
                marginTop: 0,
            },
            '& :last-child': {
                marginBottom: 0,
            },
        },
    }),
);

export default useStyles;
