import React from 'react';

import { Redirect, Route, RouteProps } from 'react-router-dom';

import useSession from '../hooks/useSession';
import Page, { PageLayout } from './Page';

export type RouteType = 'public' | 'restricted' | 'private';

export interface PageRouteProps extends Omit<RouteProps, 'children' | 'render'> {
    type: RouteType;
    layout: PageLayout;
    component: React.FC;
}

function PageRoute({
    component: Component, layout, type, ...rest
}: PageRouteProps): JSX.Element {
    const [{ user }] = useSession();
    const loggedIn = user !== null;

    return (
        <Route
            {...rest}
            render={() => {
                const page = <Page layout={layout}>{Component && <Component />}</Page>;

                switch (type) {
                    case 'private':
                        return loggedIn ? page : <Redirect to="/login" />;
                    case 'restricted':
                        return loggedIn ? <Redirect to="/dashboard/offline-models" /> : page;
                    default:
                        return page;
                }
            }}
        />
    );
}

export default PageRoute;
