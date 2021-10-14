import React from 'react';

import clsx from 'clsx';
import LinearProgress from '@material-ui/core/LinearProgress';

import Logo from './Logo';

import useStyles from './PageProgress.styles';

interface PageProgressProps {
    open: boolean;
}

function PageProgress({ open }: PageProgressProps): JSX.Element {
    const classes = useStyles();

    return (
        <div
            className={clsx(classes.root, {
                [classes.open]: open,
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
