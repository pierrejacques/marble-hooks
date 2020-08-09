/**
 * holds a renderless state
 */

import { useMemo } from 'react';
import { applyMutator, applyInitiator } from './utils';
import { Initiator, Mutator } from './typings';

const useRenderlessState = <T>(initialState: Initiator<T>) => {
    return useMemo(() => {
        let state = applyInitiator(initialState);
        return {
            get: () => state,
            set: (mutator: Mutator<T>) => {
                state = applyMutator(mutator, state);
            },
        };
    }, []);
};

export default useRenderlessState;
