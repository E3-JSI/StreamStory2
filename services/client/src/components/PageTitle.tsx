import React from 'react';

import Typography, { TypographyProps } from '@material-ui/core/Typography';

function PageTitle({
    children,
    variant = 'h5',
    gutterBottom = true,
    ...other
}: TypographyProps<'h1'>): JSX.Element {
    return (
        <Typography component="h1" variant={variant} gutterBottom={gutterBottom} {...other}>
            {children}
        </Typography>
    );
}

export default PageTitle;
