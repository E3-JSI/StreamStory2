import React, { useEffect } from 'react';

import useDeepCompareMemoize from './useDeepCompareMemoize';

function useDeepCompareEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps?.map(useDeepCompareMemoize));
}

export default useDeepCompareEffect;
