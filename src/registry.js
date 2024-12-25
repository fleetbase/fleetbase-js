import { pluralize, singularize } from './utils/string.js';

export const registry = {
    resource: {},
    adapter: {},
    store: {},
};

export function register(type, className, cls) {
    if (!registry[type]) {
        registry[type] = {};
    }
    registry[type][className] = cls;
}

export function create(type, className, ...params) {
    if (!registry[type]) {
        throw new Error(`Unknown type: ${type}`);
    }
    if (!registry[type][className]) {
        throw new Error(`No ${singularize(type)} named '${className}' registered.`);
    }
    const ResourceClass = registry[type][className];
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
