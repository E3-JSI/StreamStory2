import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { setColorOpacity } from '../utils/misc';

const useStyles = makeStyles((theme: Theme) => {
    const selectedRowBgColor = setColorOpacity(
        theme.palette.info.main,
        theme.palette.action.selectedOpacity,
    );
    return createStyles({
        row: {
            '&:focus': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                },
            },
            '&.Mui-selected': {
                '&, &:hover': {
                    backgroundColor: selectedRowBgColor,
                    '&:focus': {
                        backgroundColor: selectedRowBgColor,
                    },
                },
            },
        },
        rowMain: {
            cursor: 'pointer',
            '&:focus + .MuiTableRow-root': {
                backgroundColor: theme.palette.action.selected,
                '&.Mui-selected': {
                    backgroundColor: selectedRowBgColor,
                },
            },
            '& > .MuiTableCell-root': {
                borderWidth: 0,
            },
            '& > th > p': {
                position: 'relative',
                paddingLeft: theme.spacing(3),
            },
        },
        rowMainContent: {
            display: 'block',
            width: '100%',
        },
        rowDetails: {
            '& > .MuiTableCell-root': {
                padding: 0,
            },
        },
        toggleRowButton: {
            position: 'absolute',
            left: 0,
            top: 0,
            padding: theme.spacing(0.75 / 2),
            marginTop: -theme.spacing(0.75 / 2),
            marginLeft: -theme.spacing(0.75),
            '& svg': {
                transition: theme.transitions.create('transform'),
            },
            '&.open svg': {
                transform: 'rotate(90deg)',
            },
        },
        detailsContainer: {
            paddingTop: theme.spacing(1),
            paddingRight: theme.spacing(2),
            paddingBottom: theme.spacing(1),
            paddingLeft: theme.spacing(2),
            borderTop: `1px dashed ${theme.palette.divider}`,
        },
        details: {
            maxWidth: theme.breakpoints.values.md,
            marginTop: theme.spacing(1),
            marginBottom: 0,
            [theme.breakpoints.up('sm')]: {
                display: 'table',
            },
            '& > div': {
                [theme.breakpoints.up('sm')]: {
                    display: 'table-row',
                },
            },
            '& dt': {
                position: 'relative',
                fontWeight: theme.typography.fontWeightMedium,
                [theme.breakpoints.up('sm')]: {
                    display: 'table-cell',
                    width: 1,
                    paddingRight: theme.spacing(2),
                    whiteSpace: 'nowrap',
                },
                '& > svg': {
                    marginRight: theme.spacing(1),
                    fontSize: theme.typography.body1.fontSize,
                    verticalAlign: 'middle',
                },
            },
            '& dd': {
                marginLeft: 0,
                paddingBottom: theme.spacing(1),
                paddingLeft: theme.spacing(3),
                [theme.breakpoints.up('sm')]: {
                    display: 'table-cell',
                    width: '100%',
                    paddingLeft: theme.spacing(4),
                },
            },
        },
        description: {
            whiteSpace: 'pre-wrap',
        },
        editButton: {
            padding: theme.spacing(0.5),
            marginTop: -theme.spacing(0.5),
            marginBottom: -theme.spacing(0.5),
            '& svg': {
                fontSize: theme.typography.body1.fontSize,
            },
            'span + &': {
                marginLeft: theme.spacing(0.5),
            },
        },
        form: {},
        textInput: {
            paddingTop: '0 !important',
            lineHeight: theme.typography.body2.lineHeight,
            fontSize: theme.typography.body2.fontSize,
        },
        formButtons: {
            marginTop: theme.spacing(0.5),
        },
    });
});

export default useStyles;
