import React from 'react';

import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';

import useStyles from './Section.styles';

export interface SectionProps extends BoxProps {
    bgColor?: 'primary' | 'secondary';
    border?: 'top' | 'bottom' | 'both' | 'none';
}

function Section({
    bgColor,
    border = 'none',
    children,
    className,
    component = 'section',
    ...other
}: SectionProps): JSX.Element {
    const classes = useStyles();

    return (
        <Box
            component={component}
            className={clsx(className, classes.root, {
                [classes.rootSecondary]: bgColor === 'secondary',
                [classes.rootBorderTop]: border === 'top' || border === 'both',
                [classes.rootBorderBottom]: border === 'bottom' || border === 'both'
            })}
            {...other}
        >
            {children}
        </Box>
    );
}

export default Section;
