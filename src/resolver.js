

import { Place, Payload, Order } from './resources';
import { BrowserAdapter, NodeAdapter, EmberJsAdapter } from './adapters';
import { pluralize, singularize } from './utils/string';

const models = {
    Place,
    Payload,
    Order
};

const adapters = {
    BrowserAdapter,
    NodeAdapter,
    EmberJsAdapter
};

class Resolver {
    constructor () {
        this.models = models;
        this.adapters = adapters;

        return this.lookup(...arguments);
    }

    lookup(type, className, options = {}) {
        const key = pluralize(type);

        if (!this[key]) {
            throw new Error('Attempted to resolve invalid type');
        }

        if (!this[key][className]) {
            throw new Error(`No ${singularize(type)} named ${className} to resolve`);
        }

        return new this[key][className](options);
    }
}

const lookup = (type, className, options = {}) => new Resolver(type, className, options);

export {
    Resolver,
    lookup
};
