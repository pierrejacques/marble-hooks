/**
 * merge several sources together into one source
 * only returns the latest changed one
 */
import { useMemo } from 'react';
import useRenderlessState from './use-renderless-state';

export const useMerge = <T extends any[]>(...sources: T): T[number] => {
    const prevSourcesHolder = useRenderlessState(sources);

    return useMemo(() => {
        const prevSources = prevSourcesHolder.get();
        if (sources === prevSources) return sources[0]; // use first first for start
        const firstModifiedSource = sources.find((source, index) => !Object.is(source, prevSources[index]));
        prevSourcesHolder.set(sources);
        return firstModifiedSource;
    }, sources);
};
