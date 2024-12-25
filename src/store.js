import { lookup } from './resolver.js';
import { isResource } from './resource.js';
import { createCollection } from './utils/collection.js';
import { detectAdapter } from './utils/detect-adapter.js';
import { isArray } from './utils/array.js';
import { classify, pluralize } from './utils/string.js';
import { extendStoreActions } from './utils/store-actions.js';
import { register } from './registry.js';

export function createStore() {
    return new Store(...arguments);
}

export function afterFetch(store, json) {
    if (typeof store.options.onAfterFetch === 'function') {
        store.options.onAfterFetch(json);
    }

    if (isArray(json)) {
        const serialized = [];

        for (const element of json) {
            serialized.push(store.afterFetch(element));
        }

        return createCollection(...serialized);
    }

    const resourceInstance = store.serialize(json);
    return store.deposit(resourceInstance);
}

export default class Store {
    constructor(resource, adapter, options = {}) {
        this.resource = resource;
        this.adapter = adapter || detectAdapter();
        this.namespace = pluralize(resource);
        this.storage = createCollection();
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

    /**
     * Creates a new record via POST
     *
     * @param {Object} attributes - The attributes to create the record with
     * @param {Object} options - Adapter options (headers, etc.)
     * @returns {Promise<any>}
     */
    async create(attributes = {}, options = {}) {
        const response = await this.adapter.post(`${this.namespace}`, attributes, options);
        return this.afterFetch(response);
    }

    /**
     * Updates an existing record via PUT
     *
     * @param {string|number} id - ID of the record to update
     * @param {Object} attributes - The attributes to update
     * @param {Object} options - Adapter options (headers, etc.)
     * @returns {Promise<any>}
     */
    async update(id, attributes = {}, options = {}) {
        const response = await this.adapter.put(`${this.namespace}/${id}`, attributes, options);
        return this.afterFetch(response);
    }

    /**
     * Finds a single record by ID
     *
     * @param {string|number} id - ID of the record to fetch
     * @param {Object} options - Adapter options
     * @returns {Promise<any>}
     */
    async findRecord(id, options = {}) {
        const response = await this.adapter.get(`${this.namespace}/${id}`, {}, options);
        return this.afterFetch(response);
    }

    /**
     * Fetches all records from the resource
     *
     * @param {Object} options - Adapter options
     * @returns {Promise<Collection|any>}
     */
    async findAll(options = {}) {
        const response = await this.adapter.get(`${this.namespace}`, {}, options);
        return this.afterFetch(response);
    }

    /**
     * Queries the resource using the given query params
     *
     * @param {Object} query - Query parameters
     * @param {Object} options - Adapter options
     * @returns {Promise<Collection|any>}
     */
    async query(query = {}, options = {}) {
        const response = await this.adapter.get(`${this.namespace}`, query, options);
        return this.afterFetch(response);
    }

    /**
     * Queries the resource, but returns a single record
     *
     * @param {Object} query - Query parameters (with `query.single = true`)
     * @param {Object} options - Adapter options
     * @returns {Promise<any>}
     */
    async queryRecord(query = {}, options = {}) {
        query.single = true;

        const response = await this.adapter.get(`${this.namespace}`, query, options);
        return this.afterFetch(response);
    }

    /**
     * Deletes/destroys a record by ID
     *
     * @param {any} record - Resource or ID
     * @param {Object} options - Adapter options
     * @returns {Promise<any>}
     */
    async destroy(record, options = {}) {
        const id = isResource(record) ? record.getAttribute('id') : record;
        const response = await this.adapter.delete(`${this.namespace}/${id}`, {}, options);
        return this.afterFetch(response);
    }
}

register('store', 'Store', Store);
