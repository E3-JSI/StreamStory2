import React, { useEffect } from 'react';

function useMountEffect(effect: React.EffectCallback): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, []);
}

export default useMountEffect;
