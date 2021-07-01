import { useEffect } from 'react';

function useMountEffect(f: () => void): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(f, []);
}

export default useMountEffect;
