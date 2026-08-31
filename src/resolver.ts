import { create } from './registry.js';
import { classify } from './string.js';

export default class Resolver {
    constructor(type: string, className: string, ...params: unknown[]) {
        return create(type, className, ...params);
    }

    lookup<T>(type: string, className: string, ...params: unknown[]): T {
        return create<T>(type, className, ...params);
    }
}

export function lookup<T>(type: string, className: string, ...params: unknown[]): T {
    return create<T>(type, classify(className), ...params);
}
export function resolve<T>(type: string, className: string, ...params: unknown[]): T {
    return lookup<T>(type, className, ...params);
}
export function resolveResource<T>(className: string, ...params: unknown[]): T {
    return lookup<T>('resource', className, ...params);
}
export function resolveAdapter<T>(className: string, ...params: unknown[]): T {
    return lookup<T>('adapter', className, ...params);
}
