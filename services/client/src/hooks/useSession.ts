import { useContext } from 'react';

import SessionContext, {
    RequiredSessionProps,
    SessionProps,
    UpdateSession
} from '../contexts/SessionContext';

function useSession(): [RequiredSessionProps, UpdateSession] {
    const { update, ...sessionProps } = useContext(SessionContext);

    function setSession(props: SessionProps) {
        if (update !== null) {
            update(props);
        }
    }

    return [sessionProps, setSession];
}

export default useSession;
