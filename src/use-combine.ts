/**
 * combine several sources into one single source
 * like combineLatest operator in rxjs
 */

import { useMemo } from 'react';
import { identity } from './utils';

export const useCombine = <T extends any[], U = T>(sources: T, mapper?: (sources: T) => U) => {
    return useMemo(() => {
        (mapper || identity)(sources);
    }, sources);
};
