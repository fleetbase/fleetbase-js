import { pluralize, singularize } from './utils/string.js';

export const registry = {
    resources: {},
    adapters: {},
    storse: {},
    actions: {},
};

export function register(type, className, cls) {
    const key = pluralize(type);
    if (!registry[key]) {
        registry[key] = {};
    }
    registry[key][className] = cls;
}

export function create(type, className, ...params) {
    const key = pluralize(type);
    if (!registry[key]) {
        throw new Error(`Unknown type: ${singularize(type)}`);
    }
    if (!registry[key][className]) {
        throw new Error(`No ${singularize(type)} named '${className}' registered.`);
    }
    const ResourceClass = registry[key][className];
    return new ResourceClass(...params);
}

export function createStore() {
    return create('store', 'Store', ...arguments);
}

export function createAdapter() {
    return create('adapter', 'Adapter', ...arguments);
}

export function createResource() {
    return create('resource', 'Resource', ...arguments);
}
