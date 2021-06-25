

import { lookup } from './resolver';
import { pluralize, classify } from './utils/string';
import { isArray } from './utils/array';
import { Collection, detectAdapter } from './utils';
import Resource from './resource';

class Store {
    constructor(resource, adapter, options = {}) {
        this.resource = resource;
        this.adapter = adapter || detectAdapter();
        this.namespace = pluralize(resource);
        this.storage = new Collection();
        this.options = options;
    }

    deposit(resourceInstance) {
        // this.storage[this.namespace].pushObject(resourceInstance);

        return resourceInstance;
    }

    serialize(json) {
        return lookup('resource', classify(this.resource), json, this.adapter);
    }

    afterFetch(json) {
        if (typeof this.options.onAfterFetch === 'function') {
            this.options.onAfterFetch(json);
        }

        if (isArray(json)) {
            const serialized = [];

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
            const response = await this.adapter.post(`${this.namespace}`, attributes, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    update(id, attributes = {}, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.put(`${this.namespace}/${id}`, attributes, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    findRecord(id, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}/${id}`, {}, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    findAll(options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`, {}, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    query(query = {}, options = {}) {
        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`, query, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    queryRecord(query = {}, options = {}) {
        query.single = true;

        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.get(`${this.namespace}`, query, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }

    destroy(record, options = {}) {
        const id = record instanceof Resource ? record.getAttribute('id') : record;

        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.delete(`${this.namespace}/${id}`, {}, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }
}

export default Store;
