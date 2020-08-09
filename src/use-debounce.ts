/**
 * debounce the change of source
 * like the debounce operator in rxjs
 */

import { useMemo, useState, useEffect } from 'react';
import useRenderlessState from './use-renderless-state';

export const useDebounce = <T>(value: T, time = 250) => {
    const [state, setState] = useState(null);

    const timer = useRenderlessState<number>(null);

    useMemo(() => {
        clearTimeout(timer.get());
        timer.set((setTimeout(() => {
            setState(value);
        }, time) as unknown) as number);
    }, [value]);

    useEffect(
        () => () => {
            clearTimeout(timer.get());
        },
        []
    );

    return state;
};
