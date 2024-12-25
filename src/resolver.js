import { create } from './registry.js';
import { classify } from './utils/string.js';

export default class Resolver {
    constructor() {
        return this.lookup(...arguments);
    }

    lookup(type, className, ...params) {
        return create(type, className, ...params);
    }
}

export function lookup(type, className, ...params) {
    return create(type, classify(className), ...params);
}

// alias for lookup
export function resolve(type, className, ...params) {
    return create(type, classify(className), ...params);
}

export function resolveResource(className, ...params) {
    return lookup('resource', classify(className), ...params);
}

export function resolveAdapter(className, ...params) {
    return lookup('adapter', classify(className), ...params);
}
