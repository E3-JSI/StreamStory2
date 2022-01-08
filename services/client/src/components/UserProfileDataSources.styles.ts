import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
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
        colHeadName: {},
        colHeadDescription: {
            width: '40%',
        },
        colHeadUrl: {
            width: '40%',
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
        rowMainContent: {
            display: 'block',
            width: '100%',
        },
        footerGrid: {
            marginBottom: -theme.spacing(2),
        },
        userAutocompleteGridItem: {
            flexGrow: 1,
            width: '100%',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            [theme.breakpoints.up('md')]: {
                maxWidth: 300,
            },
        },
        paginationGridItem: {
            marginLeft: 'auto',
        },
    }),
);

export default useStyles;
