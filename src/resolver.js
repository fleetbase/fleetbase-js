

import { Place, Payload, Order } from './resources';
import { BrowserAdapter, NodeAdapter, EmberJsAdapter } from './adapters';
import { pluralize, singularize } from './utils/string';

const resources = {
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
        this.resources = resources;
        this.adapters = adapters;

        return this.lookup(...arguments);
    }

    lookup(type, className) {
        const key = pluralize(type);
        const params = [ ...arguments ].slice(2);

        if (!this[key]) {
            throw new Error('Attempted to resolve invalid type');
        }

        if (!this[key][className]) {
            throw new Error(`No ${singularize(type)} named ${className} to resolve`);
        }

        return new this[key][className](...params);
    }
}

const lookup = function() {
    return new Resolver(...arguments);
};

export {
    Resolver,
    lookup
};
