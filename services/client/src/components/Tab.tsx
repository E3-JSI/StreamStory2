import React from 'react';

import clsx from 'clsx';
import MuiTab, { TabProps as MuiTabProps } from '@material-ui/core/Tab';

import useStyles from './Tab.styles';

export interface TabProps extends MuiTabProps<React.ElementType> {
    iconAlignment?: 'vertical' | 'horizontal';
}

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
