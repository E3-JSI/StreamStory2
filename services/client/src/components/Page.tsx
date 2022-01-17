import React, { useState, useEffect } from 'react';

import clsx from 'clsx';
import { Theme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import Box from '@material-ui/core/Box';

import Header from './Header';
import SideNav from './SideNav';
import useSession from '../hooks/useSession';

import useStyles from './Page.styles';

export type PageVariant = 'application' | 'content' | 'simple';

export interface PageProps {
    variant?: PageVariant;
    children?: React.ReactNode;
}

function Page({ variant = 'application', children = null }: PageProps): JSX.Element {
    const classes = useStyles();
    const [{ user }] = useSession();
    const isUserLoggedIn = user !== null;
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    if (variant === 'application') {
        const className = 'overflowHidden';
        document.documentElement.className = className;
        document.body.className = className;
    } else {
        document.documentElement.className = '';
        document.body.className = '';
    }

    switch (variant) {
        case 'simple':
            return (
                <Box className={classes.root}>
                    <Header variant="simple" />
                    <main className={clsx(classes.main, classes.mainContent, classes.mainSimple)}>
                        <>{children}</>
                    </main>
                </Box>
            );
        case 'content':
            return (
                <Box className={classes.root}>
                    <Header variant="content" />
                    {isUserLoggedIn && <SideNav variant="temporary" />}
                    <main className={clsx(classes.main)}>{children}</main>
                </Box>
            );
        default:
            return (
                <Box className={classes.root}>
                    <Header variant="application" />
                    <SideNav variant={isScreenWidthGteMd ? 'permanent' : 'temporary'} />

                    <main className={clsx(classes.main, classes.mainApplication)}>
                        <div className={classes.mainContent}>{children}</div>
                    </main>
                </Box>
            );
    }
}

export default Page;
