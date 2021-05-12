'use strict';

import { lookup } from './resolver';
import { pluralize, classify } from './utils/string';
import { isArray } from './utils/array';
import { Collection } from './utils';
import Model from './model';

class Store {
    constructor(resource, adapter, options = {}) {
        this.resource = resource;
        this.adapter = adapter || lookup('adapter', 'BrowserAdapter');
        this.namespace = pluralize(resource);
        this.storage = new Collection();
        this.options = options;
    }

    deposit(resourceInstance) {
        // this.storage[this.namespace].pushObject(resourceInstance);

        return resourceInstance;
    }

    serialize(options) {
        return lookup('model', classify(this.resource), options);
    }

    afterFetch(json) {
        if (typeof this.options.onAfterFetch === 'function') {
            this.options.onAfterFetch(json);
        }

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

    create(attributes = {}, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.post(`${this.namespace}`, attributes).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    update(id, attributes = {}, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.put(`${this.namespace}/${id}`, attributes).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    findRecord(id, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}/${id}`).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    findAll() {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    query(query = {}, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`, query).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    queryRecord(query = {}, options = {}) {
        query.single = true;

        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`, query).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    destroy(record, options = {}) {
        const id = record instanceof Model ? record.getAttribute('id') : record;

        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.delete(`${this.namespace}/${id}`).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }
}

export default Store;