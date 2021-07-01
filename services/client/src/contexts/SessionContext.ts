import React from 'react';

import { PaletteType } from '@material-ui/core';

export interface User {
    email: string;
}

export interface SessionProps {
    theme?: PaletteType;
    sidebarOpen?: boolean;
    isLoading?: boolean;
    user?: User | null;
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

const SessionContext = React.createContext<Session>({
    theme: 'light',
    sidebarOpen: false,
    isLoading: true,
    user: null,
    currentModel: 'model-id',
    update: null
});

export default SessionContext;
