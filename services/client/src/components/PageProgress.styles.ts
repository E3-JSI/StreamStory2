import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: theme.zIndex.modal - 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        fontSize: 40,
        visibility: 'hidden',
        opacity: 0,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create(['opacity', 'visibility'], {
            duration: theme.transitions.duration.leavingScreen,
            easing: theme.transitions.easing.sharp
        })
    },
    open: {
        visibility: 'visible',
        opacity: 1,
        transitionDuration: '0s'
    },
    container: {
        flexGrow: 0
    },
    content: {
        margin: 0,
        '& > b': {
            color: theme.palette.primary.main
        }
    },
    progress: {
        marginTop: theme.spacing(1.5)
    }
}));

export default useStyles;
