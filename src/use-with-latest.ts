import { useMemo } from 'react';

export const useWithLatest = <S, V, M = [S, V]>(source: S, withValue: V, merge?: (source: S, withValue: V) => M): M => useMemo(() =>
  (merge || ((s: S, v: V)=> [s, v] as unknown as M))(source, withValue),
  [source]
);
