'use strict';

import { resolve } from './resolver';
import { pluralize, classify } from './utils/string';
import { isArray } from './utils/array';

class Store {
    constructor(resource, adapter) {
        this.resource = resource;
        this.adapter = adapter || resolve('adapter', 'BrowserAdapter');
        this.namespace = pluralize(resource);
    }

    deposit(resourceInstance) {
        this.storage[pluralize(this.resource)].pushObject(resourceInstance);

        return resourceInstance;
    }

    serialize(options) {
        return resolve('model', classify(this.resource), options);
    }

    afterFetch(json) {
        if (isArray(json)) {
            let serialized = [];

            for (let i = 0; i < json.length; i++) {
                serialized.push(this.afterFetch(json[i]));
            }

            return serialized;
        }

        const resourceInstance = this.serialize(json);

        return this.deposit(resourceInstance);
    }

    create(attributes = {}) {
        return this.adapter.post(`${this.namespace}`, attributes).then(this.afterFetch);
    }

    findRecord(id) {
        return this.adapter.get(`${this.namespace}/id`).then(this.afterFetch);
    }

    findAll() {
        return this.adapter.get(`${this.namespace}`).then(this.afterFetch);
    }

    query() {

    }

    queryRecord() {

    }

    destroy([]) {

    }
}

export default Store;