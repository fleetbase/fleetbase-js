import { register } from './registry.js';
import Store from './store.js';
import { get, isEmpty, isResourceLike, set } from './utils.js';
import type { AdapterLike, Identifier, ResourceAttributes, ResourceOptions } from './types.js';

export interface ResourceChange {
    property: string;
    previousValue: unknown;
    value: unknown;
    changedAt: Date;
}

export interface SaveOptions {
    onlyDirty?: boolean;
}

type ResourceFlag = 'isLoading' | 'isSaving' | 'isReloading' | 'isDestroying';

export function isResource(target: unknown): target is Resource {
    return target instanceof Resource;
}

export default class Resource<TAttributes extends ResourceAttributes = ResourceAttributes> {
    attributes: TAttributes;
    dirtyAttributes: ResourceAttributes = {};
    changes: Record<string, ResourceChange[]> = {};
    isLoading = false;
    isSaving = false;
    isDestroying = false;
    isReloading = false;
    resource: string;
    options: ResourceOptions;
    version: string;
    adapter!: AdapterLike;
    store!: Store<Resource<TAttributes>>;

    constructor(attributes = {} as TAttributes, adapter?: AdapterLike | null, resource = 'resource', options: ResourceOptions = {}) {
        this.attributes = attributes;
        this.resource = resource;
        this.options = options;
        this.version = options.version ?? 'v1';
        this.setAdapter(adapter);
    }

    setAdapter(adapter?: AdapterLike | null): this {
        this.store = new Store<Resource<TAttributes>>(this.resource, adapter, {
            onAfterFetch: (json) => this.syncAttributes(json),
            ...(this.options.actions ? { actions: this.options.actions } : {}),
        });
        this.adapter = this.store.adapter;
        return this;
    }

    get id(): unknown {
        return this.getAttribute('id');
    }

    async create(attributes: ResourceAttributes = {}): Promise<unknown> {
        this.setFlags(['isLoading', 'isSaving']);
        try {
            return await this.store.create(this.mergeAttributes(attributes));
        } finally {
            this.setFlags(['isLoading', 'isSaving'], false);
        }
    }

    async update(attributes: ResourceAttributes = {}): Promise<unknown> {
        this.setFlags(['isLoading', 'isSaving']);
        try {
            return await this.store.update(this.attributes.id as Identifier, attributes);
        } finally {
            this.setFlags(['isLoading', 'isSaving'], false);
        }
    }

    async destroy(): Promise<unknown> {
        this.setFlags(['isLoading', 'isDestroying']);
        try {
            return await this.store.destroy(this.attributes.id as Identifier);
        } finally {
            this.setFlags(['isLoading', 'isDestroying'], false);
        }
    }

    async reload(): Promise<unknown> {
        this.setFlags(['isLoading', 'isReloading']);
        try {
            return await this.store.findRecord(this.attributes.id as Identifier);
        } finally {
            this.setFlags(['isLoading', 'isReloading'], false);
        }
    }

    setFlags(flags: ResourceFlag[] = [], state = true): this {
        const validFlags: ResourceFlag[] = ['isLoading', 'isSaving', 'isReloading', 'isDestroying'];
        for (const flag of flags) {
            if (!validFlags.includes(flag)) {
                throw new Error(`${String(flag)} is not a valid flag!`);
            }
            this[flag] = state;
        }
        return this;
    }

    reset(): this {
        this.dirtyAttributes = {};
        this.changes = {};
        this.setFlags(['isLoading', 'isSaving', 'isReloading', 'isDestroying'], false);
        return this;
    }

    empty(): this {
        this.reset();
        this.attributes = {} as TAttributes;
        return this;
    }

    save(options: SaveOptions = {}): Promise<unknown> {
        if (isEmpty(this.id)) {
            return this.create(this.getAttributes() as ResourceAttributes);
        }
        return options.onlyDirty === true ? this.saveDirty() : this.update(this.getAttributes() as ResourceAttributes);
    }

    saveDirty(): Promise<unknown> {
        return this.update(this.getAttributes(Object.keys(this.dirtyAttributes)) as ResourceAttributes);
    }

    get meta(): unknown {
        return this.getAttribute('meta', {});
    }

    get createdAt(): Date | null {
        const value = this.getAttribute('created_at');
        return this.isAttributeFilled('created_at') ? new Date(String(value)) : null;
    }

    get updatedAt(): Date | null {
        const value = this.getAttribute('updated_at');
        return this.isAttributeFilled('updated_at') ? new Date(String(value)) : null;
    }

    get isLoaded(): boolean {
        return this.hasAttributes(['created_at', 'id']);
    }
    get isEmpty(): boolean {
        return Object.keys(this.attributes).length === 0;
    }
    get isNew(): boolean {
        return !this.id;
    }
    get isSaved(): boolean {
        return !this.isNew && this.isLoaded;
    }
    get isDeleted(): boolean {
        return this.hasAttributes(['deleted', 'time']);
    }

    eachAttribute(callback?: (this: this, value: unknown, property: string) => void): this {
        if (typeof callback !== 'function') {
            return this;
        }
        for (const property of Object.keys(this.attributes)) {
            callback.call(this, this.getAttribute(property), property);
        }
        return this;
    }

    getDirtyAttributes(): ResourceAttributes {
        return this.dirtyAttributes;
    }
    isDirty(property: string): boolean {
        return property in this.dirtyAttributes;
    }
    hasDirtyAttributes(): boolean {
        return Object.keys(this.dirtyAttributes).length > 0;
    }

    mutate(property: string, value: unknown): void {
        set(this.attributes, property, value);
    }

    setAttribute(property: string | ResourceAttributes, value: unknown = null): this {
        if (typeof property === 'object') {
            return this.setAttributes(property);
        }
        const name = property;
        const previousValue = this.getAttribute(name);
        set(this.attributes, name, value);
        if (!(name in this.dirtyAttributes)) {
            set(this.dirtyAttributes, name, previousValue);
        }
        this.changes[name] ??= [];
        this.changes[name].push({ property: name, previousValue, value, changedAt: new Date() });
        return this;
    }

    setAttributes(attributes: ResourceAttributes = {}): this {
        for (const [property, value] of Object.entries(attributes)) {
            this.setAttribute(property, value);
        }
        return this;
    }

    getAttribute(attribute: string, defaultValue: unknown = null): unknown {
        return get(this.attributes, attribute) ?? defaultValue;
    }

    hasAttribute(property: string | string[]): boolean {
        if (Array.isArray(property)) {
            return property.every((name) => name in this.attributes);
        }
        return property in this.attributes;
    }

    hasAttributes(properties: string[] = []): boolean {
        return this.hasAttribute(properties);
    }

    isAttributeFilled(property: string | string[]): boolean {
        if (Array.isArray(property)) {
            return this.hasAttribute(property) && property.every((name) => !isEmpty(this.getAttribute(name)));
        }
        return this.hasAttribute(property) && !isEmpty(this.getAttribute(property));
    }

    getAttributes(properties?: string[] | string): unknown {
        if (typeof properties === 'string') {
            return this.getAttribute(properties);
        }
        const names = properties ?? Object.keys(this.attributes);
        return Object.fromEntries(
            names
                .filter((name) => typeof name === 'string')
                .map((name) => {
                    const value = this.getAttribute(name);
                    return [name, isResourceLike(value) ? value.attributes : value];
                })
        );
    }

    serialize(): ResourceAttributes {
        return this.getAttributes() as ResourceAttributes;
    }

    mergeAttributes(attributes: ResourceAttributes = {}): TAttributes {
        this.attributes = { ...this.attributes, ...attributes };
        return this.attributes;
    }

    syncAttributes(json: unknown = {}): void {
        if (json && typeof json === 'object' && !Array.isArray(json)) {
            this.attributes = json as TAttributes;
        }
    }
}

register('resource', 'Resource', Resource);

Object.defineProperty(Resource.prototype, 'changes', {
    configurable: true,
    value(this: Resource): Record<string, ResourceChange[]> {
        return this.changes;
    },
});
