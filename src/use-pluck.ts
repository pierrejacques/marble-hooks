/**
 * alias for useMap(source, ({ key }) => key) but safer
 */
import { useMap } from './use-map';

export const usePluck = <T, U extends keyof T>(source: T, key: U) => useMap(source, source => source && source[key]);
