import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import Copyright from './Copyright';

import useStyles from './Footer.styles';

function Footer(): JSX.Element {
    const classes = useStyles();

    return (
        <Box component="footer" className={classes.root}>
            <Container maxWidth="lg">
                <Copyright />
            </Container>
        </Box>
    );
}

export default Footer;
