import React, { useState, useEffect } from 'react';

import clsx from 'clsx';
import { Theme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import Box from '@material-ui/core/Box';

import useStyles from './PageIframe.styles';

export type PageVariant = 'application' | 'content' | 'simple';

export interface PageProps {
    variant?: PageVariant;
    children?: React.ReactNode;
}

function Page({ children = null }: PageProps): JSX.Element {
    const classes = useStyles();
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
    }, []);

    return (
        <Box className={classes.root}>
            <main className={clsx(classes.mainNoMargin, classes.mainApplication)}>
                <div className={classes.mainContent}>{children}</div>
            </main>
        </Box>
    );
}

export default Page;
