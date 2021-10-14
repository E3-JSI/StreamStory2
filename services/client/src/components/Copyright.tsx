import React from 'react';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import TransHtml from './TransHtml';

function Copyright(): JSX.Element {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <TransHtml
                i18nKey="copyright"
                values={{
                    year: new Date().getFullYear(),
                }}
                components={{
                    a: <Link color="inherit" href="https://www.ijs.si/ijsw" target="_blank" />,
                }}
            />
        </Typography>
    );
}

export default Copyright;
