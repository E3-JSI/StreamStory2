import React from 'react';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';

export interface ElevationScrollProps {
    children: React.ReactElement;
}

function ElevationScroll(props: ElevationScrollProps): JSX.Element {
    const { children } = props;
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0
    });

    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0
    });
}

export default ElevationScroll;
