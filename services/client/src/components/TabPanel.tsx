import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

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
                <Box p={2} mt={0.5} clone>
                    <Paper elevation={0} square>
                        {children}
                    </Paper>
                </Box>
            )}
        </div>
    );
}

export default TabPanel;
