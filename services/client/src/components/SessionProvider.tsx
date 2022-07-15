import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SessionContext, { AppTheme, Session, SessionProps } from '../contexts/SessionContext';

export interface SessionProviderProps {
    children: React.ReactNode;
}

const storageSessionKey = 'streamstory.session';
const storageSessionProps = ['language', 'theme', 'isSideNavExpanded', 'modelsPerPage'];
let loaderState = -1;

export function loadFromStorage(sessionState: Session): Session {
    if (localStorage) {
        const storedSessionJson = localStorage.getItem(storageSessionKey);

        if (storedSessionJson) {
            try {
                return {
                    ...sessionState,
                    ...JSON.parse(storedSessionJson),
                };
            } catch {
                // Failed to load session from local storage.
            }
        }
    }

    return sessionState;
}

export function saveToStorage(sessionState: Session): void {
    if (localStorage) {
        const storedSession: Record<string, unknown> = {};

        storageSessionProps.forEach((key) => {
            storedSession[key] = sessionState[key as keyof Session];
        });

        localStorage.setItem(storageSessionKey, JSON.stringify(storedSession));
    }
}

function SessionProvider({ children }: SessionProviderProps): JSX.Element {
    const { i18n } = useTranslation();
    const [session, setSession] = useState(loadFromStorage(useContext(SessionContext)));

    if (loaderState < 0) {
        loaderState = Number(session.isPageLoading);
    }

    // Pass `update` function to SessionContext.Provider
    session.update = (props: SessionProps) => {
        if (props.isPageLoading !== undefined) {
            // Resolve nested calls for isPageLoading state change.
            loaderState += props.isPageLoading ? 1 : -1;
            loaderState = Math.max(0, loaderState);
        }

        setSession((prevState) => {
            const newSession = {
                ...prevState,
                ...props,
            };

            if (props.user?.settings.theme) {
                // Sync theme.
                newSession.theme = props.user.settings.theme as AppTheme;
            }

            if (props.user?.settings.language) {
                // Sync language.
                newSession.language = props.user.settings.language as string;
                i18n.changeLanguage(newSession.language);
            }

            newSession.isPageLoading = !!loaderState;

            // Synchronize updated session with local storage.
            saveToStorage(newSession);

            return newSession;
        });
    };

    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export default SessionProvider;
