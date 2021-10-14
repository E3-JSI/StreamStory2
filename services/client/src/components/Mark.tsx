import React from 'react';

import useStyles from './Mark.styles';

export interface MarkProps {
    children: string;
    term: string;
}

function Mark({ children, term }: MarkProps): JSX.Element {
    const classes = useStyles();
    const idx = children.search(new RegExp(term, 'i'));

    if (idx < 0) {
        return <>{children}</>;
    }

    const start = children.substring(0, idx);
    const middle = children.substring(idx, idx + term.length);
    const end = children.substring(idx + term.length, children.length);

    return (
        <>
            {start}
            <i className={classes.marked}>{middle}</i>
            {end}
        </>
    );
}

export default Mark;
