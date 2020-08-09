/**
 *
 */

import { useState, useCallback } from 'react';
import { identity } from './utils';
import { useCountMemo } from './use-count-memo';

export const useSource = <T = any, U = T>(map?: (source: U) => T) => {
    const [source, pushSource] = useState<T>(null);

    const push = useCallback((input?: U) => pushSource((map || (identity as (input: U) => T))(input)), []);

    return useCountMemo(count => [count ? source : null, push] as const, [source]);
};
