/**
 * 为 source 添加一个起始值
 */
import { useCountMemo } from './use-count-memo';
import { Initiator } from './typings';
import { applyInitiator } from './utils';

export const useStartWith = <T>(source: T, startValue: Initiator<T>) =>
    useCountMemo(count => (count ? source : applyInitiator(startValue)), [source]);
