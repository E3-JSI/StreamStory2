import React from 'react';

import { Trans } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

function Copyright(): JSX.Element {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <Trans
                i18nKey="common:copyright"
                values={{
                    year: new Date().getFullYear()
                }}
                components={{
                    a: <Link color="inherit" href="https://www.ijs.si/ijsw" target="_blank" />
                }}
            />
        </Typography>
    );
}

export default Copyright;
