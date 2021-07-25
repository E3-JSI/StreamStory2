import React from 'react';

import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MuiTab, { TabProps as MuiTabProps } from '@material-ui/core/Tab';

export interface TabProps extends MuiTabProps<React.ElementType> {
    iconAlignment?: 'vertical' | 'horizontal';
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(1, 2),
        minHeight: theme.spacing(6),
        '& > .MuiTab-wrapper': {
            flexDirection: 'row',
            '& > *:first-child': {
                marginBottom: 0,
                marginRight: theme.spacing(1)
            }
        }
    }
}));

function Tab(
    { className, iconAlignment = 'horizontal', ...other }: TabProps,
    ref: React.ForwardedRef<HTMLDivElement>
): JSX.Element {
    const classes = useStyles();

    return (
        <MuiTab
            ref={ref}
            className={clsx(className, {
                [classes.root]: iconAlignment === 'horizontal'
            })}
            {...other}
        />
    );
}

export default React.forwardRef(Tab);
