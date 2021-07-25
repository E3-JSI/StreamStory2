import React from 'react';

import { PaletteType } from '@material-ui/core';

export type AppTheme = PaletteType | 'system';

export interface User {
    // id: number;
    email: string;
    firstName: string;
    lastName: string;
    settings: Record<string, unknown>;
}

export interface SessionProps {
    user?: User | null;
    theme?: AppTheme;
    sidebarOpen?: boolean;
    pageLoading?: boolean;
    currentModel?: string | null;
}

export type RequiredSessionProps = {
    [K in keyof SessionProps]-?: SessionProps[K];
};

export type UpdateSession = (props: SessionProps) => void;

export type Session = RequiredSessionProps & {
    update: null | UpdateSession;
};

export type SessionKey = keyof Session;

export function getUserSession(user: User): SessionProps {
    const session: SessionProps = {
        user
    };

    if (user.settings.theme) {
        session.theme = user.settings.theme as AppTheme;
    }

    return session;
}

const SessionContext = React.createContext<Session>({
    user: null,
    theme: 'system',
    sidebarOpen: false,
    pageLoading: true,
    currentModel: 'model-id',
    update: null
});

export default SessionContext;
