import React, { useContext, useState } from 'react';

import SessionContext, { Session, SessionKey, SessionProps } from '../contexts/SessionContext';

export interface SessionProviderProps {
    children: React.ReactNode;
}

const storageSessionKey = 'streamstory.session';
const storageSessionProps = ['theme', 'sidebarOpen'];

function loadFromStorage(sessionState: Session): Session {
    if (localStorage) {
        const storedSessionJson = localStorage.getItem(storageSessionKey);

        if (storedSessionJson) {
            try {
                return {
                    ...sessionState,
                    ...JSON.parse(storedSessionJson)
                };
            } catch {
                // Failed to load session from local storage.
            }
        }
    }

    return sessionState;
}

function saveToStorage(sessionState: Session) {
    if (localStorage) {
        const storedSession: Record<string, unknown> = {};

        storageSessionProps.forEach((key) => {
            storedSession[key] = sessionState[key as SessionKey];
        });

        localStorage.setItem(storageSessionKey, JSON.stringify(storedSession));
    }
}

function SessionProvider({ children }: SessionProviderProps): JSX.Element {
    const [session, setSession] = useState(loadFromStorage(useContext(SessionContext)));

    // Pass `update` function to SessionContext.Provider
    session.update = (props: SessionProps) => {
        setSession((prevSession) => {
            const newSession = {
                ...prevSession,
                ...props
            };

            // Synchronize updated session with local storage.
            saveToStorage(newSession);

            return newSession;
        });
    };

    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export default SessionProvider;
