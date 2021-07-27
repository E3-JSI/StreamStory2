import React from 'react';

import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

import Logo from './Logo';

interface PageProgressProps {
    open: boolean;
}

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

function PageProgress({ open }: PageProgressProps): JSX.Element {
    const classes = useStyles();

    return (
        <div
            className={clsx(classes.root, {
                [classes.open]: open
            })}
        >
            <div className={classes.container}>
                <p className={classes.content}>
                    <Logo />
                </p>
                <LinearProgress className={classes.progress} color="primary" />
            </div>
        </div>
    );
}

export default PageProgress;
