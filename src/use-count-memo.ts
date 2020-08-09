/**
 * useMemo with self-increased calling count
 */

import { useMemo } from 'react';
import useRenderlessState from './use-renderless-state';

export const useCountMemo = <T>(callback: (count: number) => T, deps: any[]): T => {
    const count = useRenderlessState(0);

    return useMemo(() => {
        const returnValue = callback(count.get());
        count.set(prev => prev + 1);
        return returnValue;
    }, deps);
};
