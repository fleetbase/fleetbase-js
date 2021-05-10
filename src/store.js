'use strict';

import { lookup } from './resolver';
import { pluralize, classify } from './utils/string';
import { isArray } from './utils/array';
import { Collection } from './utils';
import Model from './model';

class Store {
    constructor(resource, adapter) {
        this.resource = resource;
        this.adapter = adapter || lookup('adapter', 'BrowserAdapter');
        this.namespace = pluralize(resource);
        this.storage = new Collection();
    }

    deposit(resourceInstance) {
        // this.storage[this.namespace].pushObject(resourceInstance);

        return resourceInstance;
    }

    serialize(options) {
        return lookup('model', classify(this.resource), options);
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
        return this.adapter.post(`${this.namespace}`, attributes).then(this.afterFetch.bind(this));
    }

    update(id, attributes = {}) {
        return this.adapter.put(`${this.namespace}/${id}`, attributes).then(this.afterFetch);
    }

    findRecord(id) {
        return this.adapter.get(`${this.namespace}/${id}`).then(this.afterFetch);
    }

    findAll() {
        return this.adapter.get(`${this.namespace}`).then(this.afterFetch);
    }

    query(query = {}) {
        return this.adapter.get(`${this.namespace}`, query).then(this.afterFetch);
    }

    queryRecord(query = {}) {
        query.single = true;

        return this.adapter.get(`${this.namespace}`, query).then(this.afterFetch);
    }

    destroy(record) {
        if (typeof record === 'string') {
            return this.adapter.delete(`${this.namespace}/${record}`).then(this.afterFetch);
        }

        if (record instanceof Model) {
            return this.adapter.delete(`${this.namespace}/${record.getAttribute('id')}`).then(this.afterFetch);
        }
    }
}

export default Store;