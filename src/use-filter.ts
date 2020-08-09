/**
 * filter the change of source, start with null
 * like the filter operator of rxjs
 */

import { useMemo } from 'react';
import useRenderlessState from './use-renderless-state';

export const useFilter = <T>(source: T, filter: (state: T) => boolean): T => {
    const prevState = useRenderlessState<T>(null);

    return useMemo(() => {
        if (filter(source)) {
            prevState.set(source);
            return source;
        }
        return prevState.get();
    }, [source]);
};
