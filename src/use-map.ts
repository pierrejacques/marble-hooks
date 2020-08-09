/**
 * map the source to mapped value
 * like the map operator in rxjs
 */

import { useMemo } from 'react';

export const useMap = <T, U>(source: T, map: (source: T) => U) => useMemo(() => map(source), [source]);
