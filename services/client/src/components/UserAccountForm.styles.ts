import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            width: '100%',
            maxWidth: 400,
            marginTop: 'auto',
            marginBottom: 'auto',
        },
        header: {
            flexDirection: 'column',
            [theme.breakpoints.up(375)]: {
                paddingRight: theme.spacing(3),
                paddingLeft: theme.spacing(3),
            },
        },
        headerAvatar: {
            margin: theme.spacing(2),
            '& > svg': {
                display: 'block',
                width: theme.spacing(6),
                height: theme.spacing(6),
                color: theme.palette.secondary.main,
            },
        },
        title: {
            textAlign: 'center',
        },
        description: {
            marginTop: theme.spacing(2),
        },
        content: {
            paddingTop: 0,
            [theme.breakpoints.up(375)]: {
                paddingRight: theme.spacing(3),
                paddingLeft: theme.spacing(3),
            },
        },
        form: {
            width: '100%', // Fix IE 11 issue.
        },
        oauthText: {
            position: 'relative',
            top: -6,
            marginTop: -20,
            textAlign: 'center',
            textTransform: 'uppercase',
            '& > span': {
                display: 'inline-block',
                paddingRight: theme.spacing(1),
                paddingLeft: theme.spacing(1),
                backgroundColor: theme.palette.background.paper,
            },
        },
        oauth: {
            paddingTop: theme.spacing(2),
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(2),
            borderTop: `1px solid ${theme.palette.divider}`,
            '& > a': {
                marginTop: theme.spacing(1),
                textTransform: 'none',
                '& i': {
                    width: '100%',
                    paddingRight: theme.spacing(3.5),
                    fontStyle: 'normal',
                    textAlign: 'center',
                },
            },
        },
        copyright: {
            marginTop: theme.spacing(4),
        },
    }),
);

export default useStyles;
