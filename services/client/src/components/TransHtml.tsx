/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/heading-has-content */
import React from 'react';

import { Trans, TransProps, TFuncKey, Namespace, DefaultNamespace } from 'react-i18next';

function TransHtml<
    K extends TFuncKey<N> extends infer A ? A : never,
    N extends Namespace = DefaultNamespace,
    E extends Element = HTMLDivElement,
>({ components, ...other }: TransProps<K, N, E>): React.ReactElement {
    const htmlComponents = {
        a: <a />,
        b: <b />,
        i: <i />,
        u: <u />,
        s: <s />,
        q: <q />,
        strong: <strong />,
        em: <em />,
        pre: <pre />,
        code: <code />,
        var: <var />,
        cite: <cite />,
        mark: <mark />,
        small: <small />,
        sub: <sub />,
        sup: <sup />,
        br: <br />,
        h1: <h1 />,
        h2: <h2 />,
        h3: <h3 />,
        h4: <h4 />,
        h5: <h5 />,
        h6: <h6 />,
        p: <p />,
        ul: <ul />,
        ol: <ol />,
        li: <li />,
        dl: <dl />,
        dt: <dt />,
        dd: <dd />,
        blockquote: <blockquote />,
    };

    return <Trans<K, N, E> components={{ ...htmlComponents, ...components }} {...other} />;
}

export default TransHtml;
