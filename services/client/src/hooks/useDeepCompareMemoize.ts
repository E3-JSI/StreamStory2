import { useRef } from "react";

import { isEqual } from '../utils/misc';

function useDeepCompareMemoize<T>(value: T): T {
    const ref = useRef<T>();

    if (!isEqual(value, ref.current)) {
        ref.current = value;        
    }

    return ref.current || value;
}

export default useDeepCompareMemoize;
