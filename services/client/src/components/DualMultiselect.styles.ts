import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridItem: {
            position: 'relative',
            paddingBottom: theme.spacing(2.375),
            '& + div': {
                paddingTop: theme.spacing(2.375),
                paddingBottom: 0,
            },
            [theme.breakpoints.up('sm')]: {
                paddingBottom: 0,
                paddingRight: theme.spacing(2.375),
                '& + div': {
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingLeft: theme.spacing(2.375),
                },
            },
        },
        multiselect: {
            height: '100%',
        },
        moveButton: {
            position: 'absolute',
            zIndex: 1,
            transform: 'rotateZ(90deg)',
            [theme.breakpoints.up('sm')]: {
                transform: 'none',
            },
        },
        moveAvailableButton: {
            bottom: -theme.spacing(2.125),
            right: '50%',
            marginRight: theme.spacing(0.5),
            [theme.breakpoints.up('sm')]: {
                bottom: '50%',
                right: -theme.spacing(2.125),
                marginBottom: theme.spacing(0.5),
                marginRight: 0,
            },
        },
        moveSelectedButton: {
            top: -theme.spacing(2.125),
            left: '50%',
            marginLeft: theme.spacing(0.5),
            [theme.breakpoints.up('sm')]: {
                top: '50%',
                left: -theme.spacing(2.125),
                marginTop: theme.spacing(0.5),
                marginLeft: 0,
            },
        },
        status: {
            marginTop: theme.spacing(0.5),
        },
    }),
);

export default useStyles;
