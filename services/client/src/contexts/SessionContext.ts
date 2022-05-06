import React from 'react';

import { PaletteType } from '@material-ui/core';

import { Model } from '../api/models';
import { Notification } from '../api/notifications';
import { User } from '../api/users';

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
    commonStateDataArr: any[];
    notifications: Notification[];
    update: null | UpdateSession;
}

export type SessionProps = Partial<Omit<Session, 'update'>>;

export const defaultProps: Required<SessionProps> = {
    user: null,
    theme: 'system',
    isSideNavOpen: false,
    isSideNavExpanded: false,
    isPageLoading: true,
    modelsPerPage: {},
    currentModel: [],
    commonStateDataArr: [],
    notifications: [],
};

const SessionContext = React.createContext<Session>({
    ...defaultProps,
    update: null,
});

export default SessionContext;
