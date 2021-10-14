import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            '&.gutterBottom': {
                marginBottom: theme.spacing(2),
                [theme.breakpoints.up('sm')]: {
                    marginBottom: theme.spacing(3),
                },
            },
        },
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        title: {
            flex: '1 1 100%',
        },
        descriptionIcon: {
            marginLeft: theme.spacing(0.5),
            // color: theme.palette.primary.light
        },
        descriptionPopover: {
            pointerEvents: 'none',
        },
        descriptionPaper: {
            width: 400,
            padding: theme.spacing(2),
        },
        searchControlRoot: {
            flex: '1 1 100%',
        },
        searchControlInput: {
            padding: 0,
            fontSize: theme.typography.h6.fontSize,
            fontWeight: theme.typography.h6.fontWeight,
        },
        buttons: {
            display: 'flex',
            '& > button': {
                marginLeft: theme.spacing(1),
            },
        },
        searchButton: {
            '& + button': {
                marginLeft: theme.spacing(1),
            },
        },
        table: {
            tableLayout: 'fixed',
        },
        colHeadName: {},
        colHeadUser: {
            [theme.breakpoints.up('sm')]: {
                width: '40%',
            },
            [theme.breakpoints.up('md')]: {
                width: '30%',
            },
            [theme.breakpoints.up('lg')]: {
                width: '20%',
            },
        },
        colHeadDate: {
            [theme.breakpoints.up('sm')]: {
                width: 170,
            },
        },
        colHeadActions: {
            width: 92,
            [theme.breakpoints.up('sm')]: {
                width: 92,
            },
        },
    }),
);

export default useStyles;
