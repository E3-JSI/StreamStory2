import { createStyles, makeStyles, Theme } from '@material-ui/core';

import { setColorOpacity } from '../utils/misc';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        info: {
            marginTop: theme.spacing(2),
            '& .MuiAlert-message': {
                '& :first-child': {
                    marginTop: 0,
                },
                '& :last-child': {
                    marginBottom: 0,
                },
            },
        },
        dataSourceSelectWrapper: {
            flexGrow: 1,
        },
        addButton: {
            padding: 8,
        },
        dataSourceInfoWrapper: {
            marginTop: theme.spacing(1.5),
        },
        dataSourceInfo: {
            maxWidth: theme.breakpoints.values.md,
            marginTop: 0,
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
        buttons: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        dropzone: {
            paddingTop: theme.spacing(3),
            paddingRight: theme.spacing(2),
            paddingBottom: theme.spacing(5),
            paddingLeft: theme.spacing(2),
            marginBottom: theme.spacing(1.5),
            textAlign: 'center',
            backgroundColor: theme.palette.background.default,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: theme.palette.divider,
            transition: theme.transitions.create(['border-color', 'background-color'], {
                duration: theme.transitions.duration.short,
                easing: theme.transitions.easing.sharp,
            }),
            '&:focus': {
                outline: 'none',
                borderColor: theme.palette.primary.light,
            },
        },
        dropzoneActive: {
            backgroundColor: setColorOpacity(theme.palette.primary.light, 0.1),
            borderColor: theme.palette.primary.light,
        },
        dropzoneIcon: {
            marginBottom: theme.spacing(1),
            fontSize: theme.spacing(8),
        },
        dropzoneText: {
            marginBottom: theme.spacing(1.25),
            '& > em': {
                display: 'block',
                marginTop: theme.spacing(0.5),
                fontSize: theme.typography.body2.fontSize,
                fontStyle: 'normal',
                color: theme.palette.text.secondary,
            },
        },
        progress: {
            position: 'relative',
            display: 'inline-flex',
            marginBottom: theme.spacing(1),
            '&::before': {
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                content: '""',
                borderWidth: 5,
                borderStyle: 'solid',
                borderColor: setColorOpacity(theme.palette.primary.light, 0.2),
                borderRadius: '50%',
            },
        },
        progressIndicator: {
            width: theme.spacing(8),
            height: theme.spacing(8),
        },
        progressText: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        uploadInfo: {
            // marginBottom: theme.spacing(1.5),
        },
        uploadInfoIcon: {
            maxWidth: theme.spacing(2.75),
        },
        uploadInfoContent: {
            flex: '1 1 100%',
            minWidth: 0,
        },
        uploadFileName: {
            marginBottom: theme.spacing(0.625),
        },
        uploadProgress: {
            marginBottom: theme.spacing(0.5),
        },
        uploadSpeed: {
            marginLeft: theme.spacing(1),
        },
        uploadProgressSuccess: {
            backgroundColor: setColorOpacity(theme.palette.success.main, 0.2),
            '& > div': {
                backgroundColor: theme.palette.success.main,
            },
        },
        uploadProgressError: {
            backgroundColor: setColorOpacity(theme.palette.error.main, 0.2),
            '& > div': {
                backgroundColor: theme.palette.error.main,
            },
        },
        uploadCancelButton: {
            marginTop: -theme.spacing(0.625),
            marginLeft: theme.spacing(0.5),
        },
        uploadMessage: {
            paddingTop: theme.spacing(1.5),
            marginTop: theme.spacing(1.5),
            borderTopWidth: 1,
            borderTopStyle: 'dashed',
            borderTopColor: theme.palette.divider,
        },
    }),
);

export default useStyles;
