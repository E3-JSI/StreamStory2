import { useCallback, useState } from 'react';

function useClientRect(): [DOMRect | null, (node: HTMLElement) => void] {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useCallback((node: HTMLElement) => {
        if (node !== null) {
            setRect(node.getBoundingClientRect());
        }
    }, []);
    return [rect, ref];
}

export default useClientRect;
