import React from 'react';

import clsx from 'clsx';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import Header from './Header';
import SideNav from './SideNav';
import useSession from '../hooks/useSession';

export type PageLayout = 'content' | 'dashboard' | 'simple';

export interface PageProps {
    layout?: PageLayout;
    children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => createStyles({
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

function Page({ layout = 'dashboard', children = null }: PageProps): JSX.Element {
    const classes = useStyles();
    const [{ user }] = useSession();
    const loggedIn = user !== null;

    switch (layout) {
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
                    <Header />
                    {loggedIn && <SideNav />}
                    <Container component="main" className={classes.main}>
                        <div className={classes.toolbarPlaceholder} />
                        {children}
                    </Container>
                </Box>
            );
        default:
            return (
                <Box className={classes.root}>
                    <Header />
                    <SideNav />
                    <main className={classes.main}>
                        <div className={classes.toolbarPlaceholder} />
                        {children}
                    </main>
                </Box>
            );
    }
}

export default Page;
