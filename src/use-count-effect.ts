/**
 * useEffect with self-increased calling count
 */

import { useEffect } from 'react';
import useRenderlessState from './use-renderless-state';

export const useCountEffect = (cb: (index: number) => any, deps?: any[]) => {
    const count = useRenderlessState(0);

    useEffect(() => {
        cb(count.get());
        count.set(prev => prev + 1);
    }, deps);
};
