/**
 * create a interval source, generating counting value each interval
 */

import { useEffect } from 'react';
import { useSource } from './use-source';

export const useInterval = (time: number) => {
    const [intervalSource, pushInterval] = useSource<number>(null);

    useEffect(() => {
        let count = 0;
        const interval = setInterval(() => {
            pushInterval(count);
            count++;
        }, time);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return intervalSource;
};
