import React from 'react';

import { ReactComponent as ModelTeaserSvg } from '../assets/images/model-teaser.svg';

import useStyles from './ModelTeaser.styles';

function ModelTeaser(): JSX.Element {
    const classes = useStyles();

    return (
        <ModelTeaserSvg
            className={classes.root}
            role="img"
            title="StreamStory model of a yearly weather cycle"
        />
    );
}

export default ModelTeaser;
