import Store from './store';
import { isEmpty } from './utils';
import { isArray } from './utils/array';
import { set, get } from './utils/object';

class Resource {
    /**
	 * The base resource for all resources

	 * @return {[type]} [description]
	 */
    constructor(attributes = {}, adapter, resource, options = {}) {
        this.attributes = attributes;
        this.dirtyAttributes = {};
        this.changes = {};
        this.isLoading = false;
        this.isSaving = false;
        this.isDestroying = false;
        this.isReloading = false;
        this.resource = resource;
        this.options = options;
        this.version = options.version || 'v1';
        this.setAdapter(adapter);
    }

    /**
     * Set a new adapter to the resource instance, this will update the Store instance
     *
     * @param {Adapter} adapter
     * @return {Resource} this
     */
    setAdapter(adapter) {
        this.adapter = adapter;
        this.store = new Store(this.resource, adapter, {
            onAfterFetch: this.syncAttributes.bind(this),
            actions: this.options?.actions,
        });

        return this;
    }

    /**
     * Getter for id attribute
     *
     * @var {String}
     */
    get id() {
        return this.getAttribute('id');
    }

    /**
     * Creates a new resource on the server
     *
     * @param  {Object} payload [description]
     * @return {[type]}         [description]
     */
    create(attributes = {}) {
        const data = this.mergeAttributes(attributes);
        this.setFlags(['isLoading', 'isSaving']);

        return this.store.create(data).then((response) => {
            this.setFlags(['isLoading', 'isSaving'], false);

            return response;
        });
    }

    /**
     * Creates a new resource on the server
     *
     * @param  {Object} payload [description]
     * @return {[type]}         [description]
     */
    update(attributes = {}) {
        this.setFlags(['isLoading', 'isSaving']);

        return this.store.update(this.attributes.id, attributes).then((response) => {
            this.setFlags(['isLoading', 'isSaving'], false);

            return response;
        });
    }

    /**
     * Deletes the resource instance on the server
     *
     * @return {[type]} [description]
     */
    destroy() {
        this.setFlags(['isLoading', 'isDestroying']);

        return this.store.destroy(this.attributes.id).then((response) => {
            this.setFlags(['isLoading', 'isDestroying'], false);

            return response;
        });
    }

    /**
     * Reloads the resource from the server.
     *
     * @return {[type]} [description]
     */
    reload() {
        this.setFlags(['isLoading', 'isReloading']);

        return this.store.findRecord(this.attributes.id).then((response) => {
            this.reset();

            return response;
        });
    }

    /**
     * Sets flag properties.
     *
     * @return this
     */
    setFlags(flags = [], state = true) {
        const validFlags = ['isLoading', 'isSaving', 'isReloading', 'isDestroying'];

        for (let i = 0; i < flags.length; i++) {
            const flag = flags[i];

            if (typeof flag !== 'string' || !validFlags.includes(flag)) {
                throw new Error(`${flag} is not a valid flag!`);
            }

            this[flag] = state;
        }

        return this;
    }

    /**
     * Resets tracked properties
     *
     * @return this
     */
    reset() {
        this.dirtyAttributes = {};
        this.changes = {};
        this.isLoading = false;
        this.isSaving = false;
        this.isReloading = false;

        return this;
    }

    /**
     * Emptys resource.
     *
     * @return this
     */
    empty() {
        this.reset();
        this.attribues = {};

        return this;
    }

    /**
     * Saves the resource instance on the server
     *
     * @return {[type]} [description]
     */
    save(options = {}) {
        const attributes = this.getAttributes();

        if (isEmpty(this.id)) {
            return this.create(attributes);
        }

        if (options.onlyDirty === true) {
            return this.savedirty();
        }

        return this.update(attributes);
    }

    /**
     * Saves only dirtied attributes.
     *
     * @return {[type]} [description]
     */
    saveDirty() {
        const dirtyAttributeKeys = Object.keys(this.dirtyAttributes);
        const dirtyAttributes = {};

        for (let i = 0; i < dirtyAttributeKeys.length; i++) {
            const key = dirtyAttributeKeys[i];
            dirtyAttributes[key] = this.getAttribute(key);
        }

        return this.update(dirtyAttributes);
    }

    /**
     * Returns the resource meta if exists.
     *
     * @return {Object}
     */
    get meta() {
        return this.getAttribute('meta', {});
    }

    /**
     * Returns the date instance resource was created.
     *
     * @return {Date}
     */
    get createdAt() {
        return this.isAttributeFilled('created_at') ? new Date(this.getAttribute('created_at')) : null;
    }

    /**
     * Returns the date instance resource was created.
     *
     * @return {Date}
     */
    get updatedAt() {
        return this.isAttributeFilled('updated_at') ? new Date(this.getAttribute('updated_at')) : null;
    }

    /**
     * Checks if resource is loaded from the server.
     *
     * @return {Boolean}
     */
    get isLoaded() {
        return this.hasAttributes(['created_at', 'id']);
    }

    /**
     * Checks if resource ihas no attributes
     *
     * @return {Boolean}
     */
    get isEmpty() {
        return Object.values(this?.attributes).length === 0;
    }

    /**
     * Checks if resource is not saved to server.
     *
     * @return {Boolean}
     */
    get isNew() {
        return !this.id;
    }

    /**
     * Checks if resource is not saved to server.
     *
     * @return {Boolean}
     */
    get isSaved() {
        return !this.isNew && this.isLoaded;
    }

    /**
     * Checks if resource is deleted on server.
     *
     * @return {Boolean}
     */
    get isDeleted() {
        return this.hasAttributes(['deleted', 'time']);
    }

    /**
     * Iterates over each attribute value and property executing a user supplied callback.
     *
     * @return {Object}
     */
    eachAttribute(callback) {
        if (typeof callback !== 'function') {
            return this;
        }

        Object.keys(this?.attributes ?? {}).forEach((property) => {
            const value = this.getAttribute(property);
            callback.call(this, value, property);
        });

        return this;
    }

    /**
     * Gets all changes
     *
     * @return {Object}
     */
    changes() {
        return this.changes;
    }

    /**
     * Gets all dirty attributes.
     *
     * @return {Object}
     */
    getDirtyAttributes() {
        return this.dirtyAttributes;
    }

    /**
     * Checks if property is dirty.
     *
     * @param {String} property [description]
     * @return {Boolean}
     */
    isDirty(property) {
        return property in this.dirtyAttributes;
    }

    /**
     * Checks if any properties is dirty.
     *
     * @return {Boolean}
     */
    hasDirtyAttributes() {
        return Object.keys(this?.dirtyAttributes ?? {}).length > 0;
    }

    /**
     * Updates a instance property without tracking changes or dirtying attribute.
     *
     * @param {String} property [description]
     * @param {mixed} value   [description]
     */
    mutate(property, value) {
        this.attributes[property] = value;
    }

    /**
     * Set an instance property locally
     *
     * @param {String} property [description]
     * @param {mixed} value   [description]
     */
    setAttribute(property, value = null) {
        if (value === null && typeof property === 'object') {
            return this.setAttributes(property);
        }

        const previousValue = this?.attributes[property] ?? null;

        // use object setter
        set(this.attributes, property, value);
        set(this.dirtyAttributes, property, previousValue);

        // track changes
        if (!isArray(this?.changes[property])) {
            this.changes[property] = [];
        }

        this.changes[property].push({
            property,
            previousValue,
            value,
            changedAt: new Date(),
        });

        return this;
    }

    /**
     * Set multiple instance properties locally
     *
     * @param {Object} properties [description]
     */
    setAttributes(attributes = {}) {
        for (let property in attributes) {
            this.setAttribute(property, attributes[property]);
        }

        return this;
    }

    /**
     * Get an attribute
     *
     * @param {String} attribute     The attribute key to get
     * @param {mixed}  defaultValue  The default value if no attribute value
     */
    getAttribute(attribute, defaultValue = null) {
        const value = get(this?.attributes ?? {}, attribute);

        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

    /**
     * Checks if attribute exists.
     *
     * @param {String} property [description]
     * @return {Boolean}
     */
    hasAttribute(property) {
        if (isArray(property)) {
            const properties = property;
            const attributeKeys = Object.keys(this.attributes ?? {});

            return properties.every((prop) => attributeKeys.includes(prop));
        }

        if (!this?.attributes) {
            return false;
        }

        return property in this.attributes;
    }

    /**
     * Alias for checking if has multiple attributes.
     *
     * @param {Array} properties
     * @return {Boolean}
     */
    hasAttributes(properties = []) {
        return this.hasAttribute(properties);
    }

    /**
     * Returns true if attribute has value.
     *
     * @param {Array} properties
     * @return {Boolean}
     */
    isAttributeFilled(property) {
        if (isArray(property)) {
            return this.hasAttribute(property) && property.every((prop) => !isEmpty(this.getAttribute(prop)));
        }

        return this.hasAttribute(property) && !isEmpty(this.getAttribute(property));
    }

    /**
     * Get multiple attributes.
     *
     * @param {Array} properties [description]
     * @param {[type]} value   [description]
     */
    getAttributes(properties) {
        const attributes = {};

        if (properties === null || properties === undefined) {
            return this.getAttributes(Object.keys(this.attributes));
        }

        if (typeof properties === 'string') {
            return this.getAttribute([...arguments]);
        }

        if (!isArray(properties)) {
            throw new Error('No attribute properties provided!');
        }

        for (const element of properties) {
            const property = element;

            if (typeof property !== 'string') {
                continue;
            }

            let value = this.getAttribute(property);

            if (typeof value?.attributes === 'object' && !isArray(value?.attributes)) {
                value = value.attributes;
            }

            attributes[property] = value;
        }

        return attributes;
    }

    /**
     * Serialize resource to a POJO
     *
     * @returns {Object}
     */
    serialize() {
        return this.getAttributes();
    }

    /**
     * Merge and return attributes on the resource instance.
     *
     * @param {[type]} property [description]
     * @param {[type]} value   [description]
     */
    mergeAttributes(attributes = {}) {
        const modelAttributes = this?.attributes ?? {};
        this.attributes = { ...modelAttributes, ...attributes };

        return this.attributes;
    }

    /**
     * Merge and return attributes on the resource instance.
     *
     * @param {[type]} property [description]
     * @param {[type]} value   [description]
     */
    syncAttributes(json = {}) {
        this.attributes = json;
    }
}

export default Resource;
