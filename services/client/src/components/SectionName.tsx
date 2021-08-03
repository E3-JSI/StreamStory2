import React from 'react';

import clsx from 'clsx';
import Box, { BoxProps } from '@material-ui/core/Box';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import useStyles from './SectionName.styles';

export type SectionNameProps = BoxProps & TypographyProps<React.ElementType>;

function SectionName({ children, className, ...other }: SectionNameProps): JSX.Element {
    const classes = useStyles();

    return (
        <Box clone {...other}>
            <Typography className={clsx(className, classes.root)}>{children}</Typography>
        </Box>
    );
}

export default SectionName;
