import { pluralize, singularize } from './string.js';
import type { Constructor } from './types.js';

export const registry: Record<string, Record<string, Constructor<unknown>>> = {
    resources: {},
    adapters: {},
    stores: {},
    actions: {},
};

export function register(type: string, className: string, constructor: Constructor<unknown>): void {
    const key = pluralize(type);
    registry[key] ??= {};
    registry[key][className] = constructor;
}

export function create<T>(type: string, className: string, ...params: unknown[]): T {
    const key = pluralize(type);
    const bucket = registry[key];
    if (!bucket) {
        throw new Error(`Unknown type: ${singularize(type)}`);
    }
    const Constructor = bucket[className];
    if (!Constructor) {
        throw new Error(`No ${singularize(type)} named '${className}' registered.`);
    }
    const Factory = Constructor as unknown as new (...args: unknown[]) => unknown;
    return new Factory(...params) as T;
}

export function createStore<T>(...params: unknown[]): T {
    return create<T>('store', 'Store', ...params);
}
export function createAdapter<T>(...params: unknown[]): T {
    return create<T>('adapter', 'Adapter', ...params);
}
export function createResource<T>(...params: unknown[]): T {
    return create<T>('resource', 'Resource', ...params);
}
