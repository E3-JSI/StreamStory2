import React from 'react';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
// import moment from 'moment';

import MomentUtcUtils from '../lib/MomentUtcUtils';

type Props = {
    children: React.ReactNode;
};

function UtcWrapper({ children }: Props): JSX.Element {
    return (
        <MuiPickersUtilsProvider utils={MomentUtcUtils} locale="pt-br" /* moment={moment} */>
            {children}
        </MuiPickersUtilsProvider>
    );
}

export default UtcWrapper;
