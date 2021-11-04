import React from 'react';

import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import TransHtml from './TransHtml';

function Copyright(props: TypographyProps): JSX.Element {
    return (
        <Typography variant="body2" color="textSecondary" align="center" {...props}>
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
