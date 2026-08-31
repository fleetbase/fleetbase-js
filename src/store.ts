import { createCollection } from './collection.js';
import type Collection from './collection.js';
import { detectAdapter } from './adapters/detect.js';
import { lookup } from './resolver.js';
import { register } from './registry.js';
import { classify, pluralize } from './string.js';
import { extendStoreActions } from './store-actions.js';
import { isResourceLike } from './utils.js';
import type { AdapterLike, Identifier, ResourceAttributes, ResourceOptions, StoreActionsLike } from './types.js';

export interface StoreOptions extends ResourceOptions {
    actions?: StoreActionsLike | StoreActionsLike[];
}

export function afterFetch(store: Store, json: unknown): unknown {
    store.options.onAfterFetch?.(json);
    if (Array.isArray(json)) {
        return createCollection(json.map((item) => store.afterFetch(item)));
    }
    return store.deposit(store.serialize(json));
}

export default class Store<T = unknown> {
    [action: string]: unknown;

    resource: string;
    adapter: AdapterLike;
    namespace: string;
    storage: Collection<T>;
    options: StoreOptions;

    constructor(resource: string, adapter?: AdapterLike | null, options: StoreOptions = {}) {
        this.resource = resource;
        this.adapter = adapter ?? detectAdapter();
        this.namespace = pluralize(resource);
        this.storage = createCollection<T>();
        this.options = options;
        this.extendActions(options.actions);
    }

    extendActions(actions: StoreActionsLike | StoreActionsLike[] = []): this {
        extendStoreActions(this, actions);
        return this;
    }

    deposit(resourceInstance: T): T {
        return resourceInstance;
    }

    serialize(json: unknown): T {
        return lookup<T>('resource', classify(this.resource), json, this.adapter);
    }

    afterFetch(json: unknown): T | Collection<T> {
        return afterFetch(this, json) as T | Collection<T>;
    }

    async create(attributes: ResourceAttributes = {}, options = {}): Promise<T> {
        return this.afterFetch(await this.adapter.post(this.namespace, attributes, options)) as T;
    }

    async update(id: Identifier, attributes: ResourceAttributes = {}, options = {}): Promise<T> {
        return this.afterFetch(await this.adapter.put(`${this.namespace}/${String(id)}`, attributes, options)) as T;
    }

    async findRecord(id: Identifier, options = {}): Promise<T> {
        return this.afterFetch(await this.adapter.get(`${this.namespace}/${String(id)}`, {}, options)) as T;
    }

    async findAll(options = {}): Promise<T | Collection<T>> {
        return this.afterFetch(await this.adapter.get(this.namespace, {}, options));
    }

    async query(query: ResourceAttributes = {}, options = {}): Promise<T | Collection<T>> {
        return this.afterFetch(await this.adapter.get(this.namespace, query, options));
    }

    async queryRecord(query: ResourceAttributes = {}, options = {}): Promise<T> {
        return this.afterFetch(await this.adapter.get(this.namespace, { ...query, single: true }, options)) as T;
    }

    async destroy(record: Identifier | { id?: unknown; getAttribute(name: string): unknown }, options = {}): Promise<T> {
        const id = isResourceLike(record) && typeof record.getAttribute === 'function' ? record.getAttribute('id') : record;
        return this.afterFetch(await this.adapter.delete(`${this.namespace}/${String(id)}`, {}, options)) as T;
    }
}

export function createStore<T = unknown>(...params: ConstructorParameters<typeof Store<T>>): Store<T> {
    return new Store<T>(...params);
}

register('store', 'Store', Store);
