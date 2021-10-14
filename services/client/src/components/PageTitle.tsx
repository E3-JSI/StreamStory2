import React from 'react';

import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import useStyles from './PageTitle.styles';

export type PageTitleProps = BoxProps & TypographyProps<'h1'>;

function PageTitle({ children, className, variant = 'h5', ...other }: PageTitleProps): JSX.Element {
    const classes = useStyles();

    return (
        <Box clone {...other}>
            <Typography
                component="h1"
                variant={variant}
                className={clsx(className, {
                    [classes.root]: variant === 'h1',
                })}
            >
                {children}
            </Typography>
        </Box>
    );
}

export default PageTitle;
