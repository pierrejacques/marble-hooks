/**
 * 基于 useGenerativeReducer 的简单封装以支持更常规的基于 Promise 的单次请求场景
 * 可以用过抛出特定的错误来跳过一次请求
 */

import { Initiator, Mutator } from './typings';
import { ReducerOptions, useGenerativeReducer } from './use-generative-reducer';

export function useQuery<S, Q>(
    initialState: Initiator<S>,
    querySource: Q,
    query: (querySource: Q, prevState: S, count: number) => Promise<Mutator<S>>,
    options: Partial<ReducerOptions> = {}
) {
    return useGenerativeReducer(
        initialState,
        querySource,
        function*(...params) {
            const mutator = yield query(...params);
            return mutator;
        },
        options
    );
}
