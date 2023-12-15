export default Resource;
declare class Resource {
    /**
     * The base resource for all resources

     * @return {[type]} [description]
     */
    constructor(attributes: {}, adapter: any, resource: any, options?: {});
    attributes: {};
    dirtyAttributes: {};
    /**
     * Gets all changes
     *
     * @return {Object}
     */
    changes(): any;
    isLoading: boolean;
    isSaving: boolean;
    isDestroying: boolean;
    isReloading: boolean;
    resource: any;
    options: {};
    version: any;
    /**
     * Set a new adapter to the resource instance, this will update the Store instance
     *
     * @param {Adapter} adapter
     * @return {Resource} this
     */
    setAdapter(adapter: Adapter): Resource;
    adapter: Adapter;
    store: Store;
    /**
     * Getter for id attribute
     *
     * @var {String}
     */
    get id(): any;
    /**
     * Creates a new resource on the server
     *
     * @param  {Object} payload [description]
     * @return {[type]}         [description]
     */
    create(attributes?: {}): [type];
    /**
     * Creates a new resource on the server
     *
     * @param  {Object} payload [description]
     * @return {[type]}         [description]
     */
    update(attributes?: {}): [type];
    /**
     * Deletes the resource instance on the server
     *
     * @return {[type]} [description]
     */
    destroy(): [type];
    /**
     * Reloads the resource from the server.
     *
     * @return {[type]} [description]
     */
    reload(): [type];
    /**
     * Sets flag properties.
     *
     * @return this
     */
    setFlags(flags?: any[], state?: boolean): this;
    /**
     * Resets tracked properties
     *
     * @return this
     */
    reset(): this;
    /**
     * Emptys resource.
     *
     * @return this
     */
    empty(): this;
    attribues: {};
    /**
     * Saves the resource instance on the server
     *
     * @return {[type]} [description]
     */
    save(options?: {}): [type];
    /**
     * Saves only dirtied attributes.
     *
     * @return {[type]} [description]
     */
    saveDirty(): [type];
    /**
     * Returns the resource meta if exists.
     *
     * @return {Object}
     */
    get meta(): any;
    /**
     * Returns the date instance resource was created.
     *
     * @return {Date}
     */
    get createdAt(): Date;
    /**
     * Returns the date instance resource was created.
     *
     * @return {Date}
     */
    get updatedAt(): Date;
    /**
     * Checks if resource is loaded from the server.
     *
     * @return {Boolean}
     */
    get isLoaded(): boolean;
    /**
     * Checks if resource ihas no attributes
     *
     * @return {Boolean}
     */
    get isEmpty(): boolean;
    /**
     * Checks if resource is not saved to server.
     *
     * @return {Boolean}
     */
    get isNew(): boolean;
    /**
     * Checks if resource is not saved to server.
     *
     * @return {Boolean}
     */
    get isSaved(): boolean;
    /**
     * Checks if resource is deleted on server.
     *
     * @return {Boolean}
     */
    get isDeleted(): boolean;
    /**
     * Iterates over each attribute value and property executing a user supplied callback.
     *
     * @return {Object}
     */
    eachAttribute(callback: any): any;
    /**
     * Gets all dirty attributes.
     *
     * @return {Object}
     */
    getDirtyAttributes(): any;
    /**
     * Checks if property is dirty.
     *
     * @param {String} property [description]
     * @return {Boolean}
     */
    isDirty(property: string): boolean;
    /**
     * Checks if any properties is dirty.
     *
     * @return {Boolean}
     */
    hasDirtyAttributes(): boolean;
    /**
     * Updates a instance property without tracking changes or dirtying attribute.
     *
     * @param {String} property [description]
     * @param {mixed} value   [description]
     */
    mutate(property: string, value: mixed): void;
    /**
     * Set an instance property locally
     *
     * @param {String} property [description]
     * @param {mixed} value   [description]
     */
    setAttribute(property: string, value?: mixed): this;
    /**
     * Set multiple instance properties locally
     *
     * @param {Object} properties [description]
     */
    setAttributes(attributes?: {}): this;
    /**
     * Get an attribute
     *
     * @param {String} attribute     The attribute key to get
     * @param {mixed}  defaultValue  The default value if no attribute value
     */
    getAttribute(attribute: string, defaultValue?: mixed): any;
    /**
     * Checks if attribute exists.
     *
     * @param {String} property [description]
     * @return {Boolean}
     */
    hasAttribute(property: string): boolean;
    /**
     * Alias for checking if has multiple attributes.
     *
     * @param {Array} properties
     * @return {Boolean}
     */
    hasAttributes(properties?: any[]): boolean;
    /**
     * Returns true if attribute has value.
     *
     * @param {Array} properties
     * @return {Boolean}
     */
    isAttributeFilled(property: any): boolean;
    /**
     * Get multiple attributes.
     *
     * @param {Array} properties [description]
     * @param {[type]} value   [description]
     */
    getAttributes(properties: any[], ...args: any[]): any;
    /**
     * Serialize resource to a POJO
     *
     * @returns {Object}
     */
    serialize(): any;
    /**
     * Merge and return attributes on the resource instance.
     *
     * @param {[type]} property [description]
     * @param {[type]} value   [description]
     */
    mergeAttributes(attributes?: {}): {};
    /**
     * Merge and return attributes on the resource instance.
     *
     * @param {[type]} property [description]
     * @param {[type]} value   [description]
     */
    syncAttributes(json?: {}): void;
}
import Store from './store';
