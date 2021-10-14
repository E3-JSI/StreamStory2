import React from 'react';

import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import useStyles from './SectionDescription.styles';

export type SectionDescriptionProps = BoxProps & TypographyProps<React.ElementType>;

function SectionDescription({
    children,
    className,
    color = 'textSecondary',
    ...other
}: SectionDescriptionProps): JSX.Element {
    const classes = useStyles();

    return (
        <Box clone {...other}>
            <Typography color={color} className={clsx(className, classes.root)}>
                {children}
            </Typography>
        </Box>
    );
}

export default SectionDescription;
