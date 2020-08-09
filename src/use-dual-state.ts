import { useMemo, useReducer } from 'react';
import { bypass, applyInitiator, isFunction, isObject } from './utils';
import { Initiator } from './typings';
import { useCountMemo } from './use-count-memo';

/**
 * @param initialState
 * @param query
 */

type DualMutationType = 'sync' | 'set' | 'both';

interface DualMutation<S> {
  type: DualMutationType;
  payload?: Partial<S>;
}

export interface Persistor<S> {
  get(): Partial<S>;
  set(current: S): void;
}

const BYPASS_PERSISTOR: Persistor<any> = {
  get: () => ({}),
  set: bypass,
}

// util function
export function dualMutation(type: DualMutationType): () => DualMutation<any>;
export function dualMutation<S>(type: DualMutationType, map: () => S): <O extends S>() => DualMutation<O>;
export function dualMutation<S, T>(type: DualMutationType, map: (input: T) => S): <O extends S>(input: T) => DualMutation<O>;
export function dualMutation<S>(type: DualMutationType, key: keyof S): <O extends S>() => DualMutation<O>;
export function dualMutation<S>(type: DualMutationType, overrides: S): <O extends S>() => DualMutation<O>;
export function dualMutation(type, map?) {
  return (source?) => {
    const payload = (() => {
      if (!map) {
        return undefined;
      }
      if (isFunction(map)) {
        return map(source);
      }
      if (isObject(map)) {
        return map;
      }
      return { [map]: source };
    })();
    return { type, payload };
  }
}

function merge<S>(base: S, overrides?: Partial<S>) {
  if (
    !overrides ||
    !Object.keys(overrides).length ||
    Object.keys(overrides).every(key => Object.is(overrides[key], base[key]))
  ) {
    return base;
  }
  return Object.assign(Array.isArray(base) ? [] : {}, base, overrides);
}

function copyIfMutated<S extends object>(current: S, prev: S) {
  return Object.is(current, prev) ? { ...current } : current;
}

export function useDualState<S extends Record<string, any>>(
  initiator: Initiator<S>, // 初始查询状态
  mutation: DualMutation<Partial<S>>,
  persistor: Persistor<S> = BYPASS_PERSISTOR, // 状态的持久化寄存器，可以通过 url 或 localStorage 来同步状态
) {
  const initialState = useMemo(() => {
    const mergedInitialState = merge(applyInitiator(initiator), persistor.get());

    return [mergedInitialState, mergedInitialState] as [S, S];
  }, []);

  /**
   * 查询表单所依赖的状态
   */
  const [state, dispatch] = useReducer((prev: [S, S], { type, payload }: DualMutation<S>) => {
    const nextDisplay = merge(prev[1], payload);
    if (type === 'set') {
      // 修改显示状态，典型场景：普通输入
      return merge(prev, [prev[0], nextDisplay]);
    }
    if (type === 'sync') {
      // 在显示状态的基础上进行修改后提交，典型场景：提交
      persistor.set(prev[0]);
      return merge(prev, [copyIfMutated(nextDisplay, prev[1]), nextDisplay]);
    }
    if (type === 'both') {
      // 在上一次的状态基础上作修改后查询，典型场景：翻页
      persistor.set(prev[0]);
      return merge(prev, [copyIfMutated(merge(prev[0], payload), prev[0]), nextDisplay]);
    }
    return prev;
  }, initialState);

  useCountMemo(count => count && dispatch(mutation), [mutation]);

  /**
   * 输出
   */
  return state;
}
