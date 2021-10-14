import React from 'react';

import Box from '@material-ui/core/Box';

export interface TabPanelProps {
    children?: React.ReactNode;
    prefix?: string;
    index: unknown;
    value: unknown;
}

export function getTabA11yProps(index: unknown, prefix = 'mui'): Record<string, string> {
    return {
        id: `${prefix}-tab-${index}`,
        'aria-controls': `${prefix}-tabpanel-${index}`,
    };
}

function TabPanel({
    children,
    prefix = 'mui',
    value,
    index,
    ...other
}: TabPanelProps): JSX.Element {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`${prefix}-tabpanel-${index}`}
            aria-labelledby={`${prefix}-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box px={0} py={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default TabPanel;
