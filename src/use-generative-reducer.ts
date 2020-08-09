/**
 * 基于 generator 能进行异步多阶段 reduce 的钩子
 */
import { useState, useMemo, useEffect } from 'react';
import { Initiator, Mutator } from './typings';
import { applyInitiator, applyMutator, isPromise } from './utils';
import { useCountMemo } from './use-count-memo';

export interface QueryObject<S> {
    ready: boolean;
    loading: boolean;
    data: S;
    error: any;
}

export interface ReducerOptions {
    immediate: boolean; // 是否在组件挂载后立即执行 reducer
    mode: 'first' | 'latest' | 'order' | 'multi';
}

const DEFAULT_REDUCER_OPTIONS: ReducerOptions = {
    immediate: true,
    mode: 'latest',
};

// 状态管理器
const createStateManager = <S>(setState: (mutator: Mutator<QueryObject<S>>) => void, mode: ReducerOptions['mode']) => {
    let alive = true; // 组件是否仍然存活
    let doneId: number = -1; // 已完成的记录
    let latestId = 0; // 最新的记录

    const mutators: Record<number, Mutator<S>[]> = {};
    // 执行 mutator
    const safeSetState = (mutator: Mutator<QueryObject<S>>) => {
        if (alive) {
            setState(mutator);
        }
    };
    const runMutator = (mutator: Mutator<S>) => {
        safeSetState(prev => ({
            ...prev,
            data: applyMutator(mutator, prev.data),
        }));
    };
    const commitComplete = (id: number) => {
        doneId = latestId;

        if (id === latestId) {
            // 如果是最新的 flow 可以设置为 done
            safeSetState(prev => ({
                ready: true,
                loading: false,
                data: prev.data,
                error: null,
            }));
        }
    };
    const commitError = (id: number, error: any) => {
        doneId = id;
        if (id === latestId) {
            // 如果是最新的 flow，可以结束
            safeSetState(prev => ({
                ...prev,
                loading: false,
                error,
            }));
        }
    };
    const commitNext = (id: number, mutator: Mutator<S>) => {
        // 组件失活
        if (!alive) return;

        // latest 模式下非当前 count
        if (mode === 'latest' && id !== latestId) return;

        // 除了保序模式，能到这里的 mutator 都立即执行变更
        if (mode !== 'order') {
            runMutator(mutator);
            return;
        }

        (mutators[id] || []).push(mutator);

        Object.keys(mutators)
            .filter(key => Number(key) <= doneId + 1)
            .sort()
            .forEach(key => {
                const mutatorQueue = mutators[Number(key)];
                mutatorQueue.forEach(runMutator);
                delete mutators[key]; // 执行完毕的删除
            });
    };

    return {
        kill: () => (alive = false),
        generateId: () => ++latestId,
        getLatestId: () => latestId,
        commitComplete,
        commitNext,
        commitError,
    };
};

type YieldType<S> = Promise<any> | Mutator<S>;

export function useGenerativeReducer<S, Q>(
    initialState: Initiator<S>,
    actionSource: Q,
    reduce: (queryState: Q, prevState: S, count: number) => Generator<YieldType<S>, Mutator<S>, any>,
    options: Partial<ReducerOptions> = {}
) {
    const { immediate, mode } = useMemo(() => ({ ...DEFAULT_REDUCER_OPTIONS, ...options }), []);

    // 状态
    const [state, setState] = useState<QueryObject<S>>({
        ready: false,
        loading: false,
        data: applyInitiator(initialState),
        error: null,
    });

    // 对状态的修改的关系器
    const stateManager = useMemo(() => createStateManager(setState, mode), []);

    // 组件销毁前置为不可触达
    useEffect(() => () => stateManager.kill(), []);

    useCountMemo(
        async count => {
            if (!count && !immediate) {
                return;
            }

            // 首个模式从源头上就保证竞争者不会进入
            if (state.loading && mode === 'first') return;

            // 请求标记
            const requestId = stateManager.generateId();

            // 初始请求状态
            setState(prev => ({ ...prev, loading: true, error: null, ready: false }));

            // 发起请求
            try {
                const generator = reduce(actionSource, state.data, count);
                const run = (nextValue?: any) => {
                    // 流程层面的控制，独占模式下如执行一半中断了，则不继续执行流程
                    if (mode === 'latest' && requestId !== stateManager.getLatestId()) return;

                    const yieldValue = generator.next(nextValue);

                    if (isPromise(yieldValue.value)) {
                        yieldValue.value.then(run);
                        return;
                    }

                    const mutator = yieldValue.value;

                    stateManager.commitNext(requestId, mutator);

                    if (yieldValue.done) {
                        stateManager.commitComplete(requestId);
                    } else {
                        run();
                    }
                };
                run();
            } catch (error) {
                stateManager.commitError(requestId, error);
            }
        },
        [actionSource]
    );

    return state;
}
