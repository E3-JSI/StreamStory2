import React from 'react';

import { PaletteType } from '@material-ui/core';

import { Model, User } from '../types/api';

export type AppTheme = PaletteType | 'system';

export type UpdateSession = (props: SessionProps) => void;

export interface Session {
    user: User | null;
    theme: AppTheme;
    isSideNavOpen: boolean;
    isSideNavExpanded: boolean;
    isPageLoading: boolean;
    modelsPerPage: Record<string, number>;
    currentModel: Model[];
    update: null | UpdateSession;
}

export type SessionProps = Partial<Omit<Session, 'update'>>;

export function getUserSession(user: User): SessionProps {
    const session: SessionProps = {
        user,
    };

    if (user.settings.theme) {
        session.theme = user.settings.theme as AppTheme;
    }

    return session;
}

export const defaultProps: Required<SessionProps> = {
    user: null,
    theme: 'system',
    isSideNavOpen: false,
    isSideNavExpanded: false,
    isPageLoading: true,
    modelsPerPage: {},
    currentModel: [],
};

const SessionContext = React.createContext<Session>({
    ...defaultProps,
    update: null,
});

export default SessionContext;
