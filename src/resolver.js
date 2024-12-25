import { create } from './registry.js';

export default class Resolver {
    constructor() {
        return this.lookup(...arguments);
    }

    lookup(type, className, ...params) {
        return create(type, className, ...params);
    }
}

export function lookup(type, className, ...params) {
    return create(type, className, ...params);
}

export function resolveResource(className, ...params) {
    return lookup('resource', className, ...params);
}

export function resolveAdapter(className, ...params) {
    return lookup('adapter', className, ...params);
}
