import { Mutator, Initiator } from './typings';

export type Func = (...params: any[]) => any;

export const isFunction = (input: unknown): input is Func => typeof input === 'function';
export const isString = (input: unknown): input is string => typeof input === 'string';
export const isObject = (input: unknown): input is object => typeof input === 'object';
export const isPromise = (input: unknown): input is Promise<any> => input instanceof Promise;

export const bypass = (): void => {};

export const identity = <T>(value: T, ...other: any[]) => value;

export const omit = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]) => {
    const partial: Partial<T> = { ...object };
    keys.forEach(key => {
        Reflect.deleteProperty(partial, key);
    });
    return partial as Omit<T, K>;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]) => {
    const partial: Partial<T> = {};
    keys.forEach(key => {
        if (key in object) {
            partial[key] = object[key];
        }
    });
    return partial as Pick<T, K>;
};

export const applyInitiator = <S>(initiator: Initiator<S>): S => (isFunction(initiator) ? initiator() : initiator);
export const applyMutator = <S>(mutatior: Mutator<S>, prev: S): S => (isFunction(mutatior) ? mutatior(prev) : mutatior);
