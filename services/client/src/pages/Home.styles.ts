import { createStyles, makeStyles, Theme } from '@material-ui/core';

import { setColorOpacity } from '../utils/misc';

const useStyles = makeStyles((theme: Theme) => createStyles({
    buttons: {
        marginTop: theme.spacing(2),
        '& .MuiButton-root': {
            width: '100%',
            textTransform: 'none'
        }
    },
    bgPattern: {
        position: 'absolute',
        bottom: 0,
        zIndex: -1,
        width: '100%',
        height: 0,
        paddingTop: '10%',
        '& > svg': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        }
    },

    /* Banner Section */
    bannerSection: {
        textAlign: 'center',
        [theme.breakpoints.up('md')]: {
            textAlign: 'left'
        }
    },
    bannerGrid: {
        alignItems: 'center',
        justifyContent: 'center',
        [theme.breakpoints.up('md')]: {
            justifyContent: 'flex-start'
        }
    },
    pageTitle: {
        marginBottom: theme.spacing(2),
        '& > b': {
            color: theme.palette.primary.main
        },
        '& > i': {
            fontWeight: theme.typography.fontWeightRegular
        }
    },
    pageSubtitle: {
        fontSize: '1.25rem',
        [theme.breakpoints.up('md')]: {
            fontSize: '1.5rem'
        }
    },
    bannerButtons: {
        marginTop: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            justifyContent: 'flex-start'
        }
    },
    video: {
        maxWidth: '100%',
        backgroundColor: '#000'
    },
    screenFrame: {
        maxWidth: '100%',
        borderWidth: 0,
        borderRadius: theme.spacing(1.5),
        '& > div': {
            padding: 0,
            '&:last-child': {
                paddingBottom: 0
            }
        },
        '& img': {
            display: 'block',
            maxWidth: '100%'
        },
        [theme.breakpoints.up('md')]: {
            maxWidth: '110%',
            marginLeft: '-10%'
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '120%',
            marginLeft: '-20%'
        }
    },

    /* Features Section */
    featuresSection: {
        textAlign: 'center'
    },
    features: {
        marginTop: theme.spacing(4)
    },
    feature: {
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            textAlign: 'left'
        }
    },
    featureAvatarItem: {
        marginTop: 0,
        marginBottom: theme.spacing(1),
        [theme.breakpoints.up('md')]: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(2),
            marginBottom: 0
        }
    },
    featureAvatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        color: theme.palette.primary.main,
        backgroundColor: setColorOpacity(theme.palette.primary.main, 0.1),
        '& > svg': {
            width: theme.spacing(4),
            height: theme.spacing(4),
            fill: theme.palette.primary.main
        }
    },

    /* Examples Section */
    examplesSection: {
        textAlign: 'center'
    },
    examples: {
        marginTop: theme.spacing(3),
        '& > div': {
            display: 'flex',
            justifyContent: 'center'
        }
    },
    example: {
        height: '100%',
        maxWidth: 600,
        textAlign: 'left',
        '& a': {
            height: '100%'
        },
        '& img': {
            maxWidth: '100%'
        }
    },

    /* Contact Section */
    contactSection: {
        textAlign: 'center'
    }
}));

export default useStyles;
