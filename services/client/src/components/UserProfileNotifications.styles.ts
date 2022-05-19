import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: -theme.spacing(2),
        },
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        title: {
            flex: '1 1 100%',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
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
        colHeadTitle: {},
        colHeadType: {
            width: '30%',
        },
        colHeadTime: {
            width: '30%',
            [theme.breakpoints.up('md')]: {
                width: '20%',
            },
        },
        colHeadActions: {
            width: 92,
            [theme.breakpoints.up('sm')]: {
                width: 92,
            },
        },
        row: {
            textDecoration: 'none',
            '&:focus': {
                backgroundColor: theme.palette.action.selected,
            },
        },
        rowRead: {
            backgroundColor: theme.palette.action.selected,
        },
        rowMainContent: {
            display: 'block',
            width: '100%',
        },
        footerGrid: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
        },
        notificationContent: {
            padding: theme.spacing(2),
            '& pre:first-child': {
                marginTop: 0,
            },
            '& pre:last-child': {
                marginBottom: 0,
            },
        },
        userAutocompleteGridItem: {
            flexGrow: 1,
            width: '100%',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: theme.palette.divider,
            [theme.breakpoints.up('md')]: {
                maxWidth: 300,
                borderBottomWidth: 0,
            },
        },
        paginationGridItem: {
            marginLeft: 'auto',
        },
        pagination: {
            marginRight: -5,
        },
    }),
);

export default useStyles;
