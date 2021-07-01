import React from 'react';

import Typography from '@material-ui/core/Typography';

function Model(): JSX.Element {
    const modelName = 'Model';

    return (
        <Typography component="h1" variant="h4">
            {modelName}
        </Typography>
    );
}

export default Model;
