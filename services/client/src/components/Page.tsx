import React from 'react';

import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import Header from './Header';
import SideNav from './SideNav';
import useSession from '../hooks/useSession';

export type PageVariant = 'content' | 'dashboard' | 'simple';

export interface PageProps {
    variant?: PageVariant;
    children?: React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        display: 'flex',
        minHeight: '100vh'
    },
    toolbarPlaceholder: {
        ...theme.mixins.toolbar
    },
    main: {
        flexGrow: 1,
        padding: theme.spacing(2),
        overflow: 'auto',
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(3)
        }
    },
    mainSimple: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));

function Page({ variant = 'dashboard', children = null }: PageProps): JSX.Element {
    const classes = useStyles();
    const [{ user }] = useSession();
    const isUserLoggedIn = user !== null;
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    switch (variant) {
        case 'simple':
            return (
                <Box className={classes.root}>
                    <Header variant="simple" />
                    <Container
                        component="main"
                        className={clsx(classes.main, classes.mainSimple)}
                        maxWidth="xs"
                    >
                        <div className={classes.toolbarPlaceholder} />
                        {children}
                    </Container>
                </Box>
            );
        case 'content':
            return (
                <Box className={classes.root}>
                    <Header variant="content" />
                    {isUserLoggedIn && <SideNav variant="temporary" />}
                    <Container component="main" className={classes.main}>
                        <div className={classes.toolbarPlaceholder} />
                        {children}
                    </Container>
                </Box>
            );
        default:
            return (
                <Box className={classes.root}>
                    <Header variant="dashboard" />
                    <SideNav variant={isScreenWidthGteMd ? 'permanent' : 'temporary'} />
                    <main className={classes.main}>
                        <div className={classes.toolbarPlaceholder} />
                        {children}
                    </main>
                </Box>
            );
    }
}

export default Page;
