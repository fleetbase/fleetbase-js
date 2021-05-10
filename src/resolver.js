'use strict';

import { Place, Payload, Order } from './resources';
import { BrowserAdapter } from './adapters';

const models = {
    Place,
    Payload,
    Order
};

const adapters = {
    BrowserAdapter
};

class Resolver {
    constructor () {
        this.models = models;
        this.adapters = adapters;

        return this.resolve(...arguments);
    }

    resolve(type, className, options = {}) {
        return this[type][className](options);
    }
}

const resolve = (type, className, options = {}) => {
    return new Resolver(type, className, options);
}

export {
    Resolver,
    resolve
}