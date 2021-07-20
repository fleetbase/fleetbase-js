import { lookup } from './resolver';
import { pluralize, classify } from './utils/string';
import { isArray } from './utils/array';
import { Collection, detectAdapter, isResource, StoreActions } from './utils';
import { set, isCallable, invoke } from './utils/object';

const extendStoreActions = (store, actions = []) => {
    store.actions = isArray(actions) ? actions : [actions];

    if (isArray(actions)) {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            this.extendActions(action);
        }
        return;
    }

    if (actions instanceof StoreActions) {
        actions.extend(store);
    }

    return store;
};

const afterFetch = (store, json) => {
    if (typeof store.options.onAfterFetch === 'function') {
        store.options.onAfterFetch(json);
    }

    if (isArray(json)) {
        const serialized = [];

        for (let i = 0; i < json.length; i++) {
            serialized.push(store.afterFetch(json[i]));
        }

        return new Collection(...serialized);
    }

    const resourceInstance = store.serialize(json);
    return store.deposit(resourceInstance);
};

class Store {
    constructor(resource, adapter, options = {}) {
        this.resource = resource;
        this.adapter = adapter || detectAdapter();
        this.namespace = pluralize(resource);
        this.storage = new Collection();
        this.options = options;
        this.extendActions(options.actions);
    }

    extendActions(actions = []) {
        return extendStoreActions(this, actions);
    }

    deposit(resourceInstance) {
        // this.storage[this.namespace].pushObject(resourceInstance);

        return resourceInstance;
    }

    serialize(json) {
        return lookup('resource', classify(this.resource), json, this.adapter);
    }

    afterFetch(json) {
        return afterFetch(this, json);
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
        const id = isResource(record) ? record.getAttribute('id') : record;

        return new Promise(async (resolve, reject) => {
            const response = await this.adapter.delete(`${this.namespace}/${id}`, {}, options).then(this.afterFetch.bind(this)).catch(reject);

            resolve(response);
        });
    }
}

export default Store;

export { extendStoreActions, afterFetch };
