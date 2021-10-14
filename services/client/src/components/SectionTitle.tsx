import React from 'react';

import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import useStyles from './SectionTitle.styles';

export type SectionTitleProps = BoxProps & TypographyProps<React.ElementType>;

function SectionTitle({
    children,
    className,
    component = 'h2',
    variant = 'h2',
    ...other
}: SectionTitleProps): JSX.Element {
    const classes = useStyles();

    return (
        <Box clone {...other}>
            <Typography
                component={component}
                variant={variant}
                className={clsx(className, {
                    [classes.root]: variant === 'h2',
                })}
            >
                {children}
            </Typography>
        </Box>
    );
}

export default SectionTitle;
