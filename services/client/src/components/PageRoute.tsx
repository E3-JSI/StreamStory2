import React from 'react';

import { Redirect, Route, RouteProps } from 'react-router-dom';

import useSession from '../hooks/useSession';
import Page, { PageVariant } from './Page';

export type RouteType = 'public' | 'restricted' | 'private';

export interface PageRouteProps extends Omit<RouteProps, 'children' | 'render'> {
    type: RouteType;
    variant: PageVariant;
    component: React.FC;
}

function PageRoute({ component: Component, variant, type, ...rest }: PageRouteProps): JSX.Element {
    const [{ user }] = useSession();
    const isUserLoggedIn = user !== null;

    return (
        <Route
            {...rest}
            render={() => {
                const page = <Page variant={variant}>{Component && <Component />}</Page>;

                switch (type) {
                    case 'private':
                        return isUserLoggedIn ? page : <Redirect to="/login" />;
                    case 'restricted':
                        return isUserLoggedIn ? <Redirect to="/dashboard/offline-models" /> : page;
                    default:
                        return page;
                }
            }}
        />
    );
}

export default PageRoute;
