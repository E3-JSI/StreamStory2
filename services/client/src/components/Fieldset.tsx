import React from 'react';

import clsx from 'clsx';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import AlertPopup, { AlertPopupProps } from './AlertPopup';

import useStyles from './Fieldset.styles';

export interface FieldsetProps {
    children: React.ReactNode;
    legend?: string;
    description?: React.ReactNode;
    legendProps?: TypographyProps;
    descriptionProps?: AlertPopupProps;
    divider?: boolean;
    gutterTop?: boolean;
    gutterBottom?: boolean;
}

function Fieldset({
    children,
    legend,
    description,
    legendProps,
    descriptionProps,
    divider = true,
    gutterTop,
    gutterBottom,
}: FieldsetProps): JSX.Element {
    const classes = useStyles();

    return (
        <fieldset
            className={clsx(classes.root, {
                [classes.rootDivider]: divider,
                [classes.rootGutterTop]: gutterTop,
                [classes.rootGutterBottom]: gutterBottom,
            })}
        >
            {legend && (
                <legend
                    className={clsx(classes.legend, {
                        [classes.legendDivider]: divider,
                    })}
                >
                    <Typography component="span" variant="body1" color="secondary" {...legendProps}>
                        {legend}
                        {!!description && (
                            <AlertPopup severity="info" placement="end" {...descriptionProps}>
                                {description}
                            </AlertPopup>
                        )}
                    </Typography>
                </legend>
            )}
            {children}
        </fieldset>
    );
}

export default Fieldset;
