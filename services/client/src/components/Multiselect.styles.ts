import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        cardHeader: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        cardHeaderContent: {
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
        },
        cardContent: {
            padding: 0,
            overflow: 'auto',
        },
        cardContentNoStatus: {
            '&:last-child': {
                paddingBottom: 0,
            },
        },
        avatar: {
            marginRight: theme.spacing(1),
        },
        title: {
            flex: '1 1 100%',
            fontWeight: theme.typography.fontWeightMedium,
        },
        textDisabled: {
            color: theme.palette.text.disabled,
            cursor: 'default',
        },
        searchButton: {
            marginLeft: theme.spacing(1),
        },
        searchControlRoot: {
            flex: '1 1 100%',
        },
        searchControlInput: {
            padding: 0,
            fontSize: theme.typography.body2.fontSize,
            fontWeight: theme.typography.body2.fontWeight,
            lineHeight: theme.typography.body2.lineHeight,
        },
        list: {
            height: 38 * 5,
            paddingTop: 0,
            paddingBottom: 0,
        },
        listItem: {
            '&:not(:hover):not(:focus) label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            },
        },
        listItemIcon: {
            alignSelf: 'flex-start',
            minWidth: 0,
            marginRight: theme.spacing(1),
        },
        listItemIconEnd: {
            alignSelf: 'flex-start',
            minWidth: 0,
            marginTop: theme.spacing(0.375),
            marginBottom: theme.spacing(0.375),
        },
        listItemText: {
            marginTop: theme.spacing(0.625),
            marginBottom: theme.spacing(0.625),
        },
        listItemlabel: {
            cursor: 'pointer',
        },
        checkbox: {
            padding: theme.spacing(0.625),
            marginLeft: -theme.spacing(0.625),
        },
        switch: {},
        listItemTextContent: {},
    }),
);

export default useStyles;
