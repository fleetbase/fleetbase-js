'use strict';

import { Place, Payload, Order } from './resources';

const models = {
    Place,
    Payload,
    Order
};

class Resolver {
    constructor () {
        this.models = models;

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