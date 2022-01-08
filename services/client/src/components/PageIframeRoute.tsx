import React from 'react';

import { Route, RouteProps } from 'react-router-dom';
import Page, { PageVariant } from './PageIframe';

export type RouteType = 'public' | 'restricted' | 'private';

export interface PageRouteProps extends Omit<RouteProps, 'children' | 'render'> {
    type: RouteType;
    component: React.FC;
}

function PageIframeRoute({ component: Component, type, ...rest }: PageRouteProps): JSX.Element {
    return (
        <Route
            {...rest}
            render={() => {
                const page = <Page>{Component && <Component />}</Page>;
                return page;
                }
            }
        />
    );
}

export default PageIframeRoute;
