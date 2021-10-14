import React from 'react';

import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import Button, { ButtonClassKey, ButtonProps } from '@material-ui/core/Button';
import CircularProgress, { CircularProgressClassKey } from '@material-ui/core/CircularProgress';

import useStyles from './LoadingButton.styles';

export type LoadingButtonClassKey = ButtonClassKey | 'progress';

export interface LoadingButtonProps extends ButtonProps {
    classes?: Partial<ClassNameMap<ButtonClassKey>> & {
        progress: Partial<ClassNameMap<CircularProgressClassKey>>;
    };
    loading?: boolean;
}

function LoadingButton(
    {
        children,
        classes: styleClasses,
        disabled,
        loading = false,
        size,
        ...other
    }: LoadingButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
): JSX.Element {
    const classes = useStyles();
    const { progress = {}, ...otherClasses } = styleClasses || {};

    let progressSize = 24;
    switch (size) {
        case 'small':
            progressSize = 20;
            break;

        case 'large':
            progressSize = 32;
            break;

        default:
            break;
    }

    return (
        <Button
            ref={ref}
            classes={otherClasses}
            disabled={loading || disabled}
            size={size}
            {...other}
        >
            {loading && (
                <CircularProgress
                    size={progressSize}
                    className={classes.progress}
                    classes={progress}
                    style={{
                        marginTop: -progressSize / 2,
                        marginLeft: -progressSize / 2,
                    }}
                />
            )}
            {children}
        </Button>
    );
}

export default React.forwardRef(LoadingButton);
