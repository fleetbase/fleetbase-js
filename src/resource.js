import Store from './Store';
import { isEmpty } from './utils';

class Resource {
    /**
	 * The base resource for all resources

	 * @return {[type]} [description]
	 */
    constructor(attributes = {}, adapter, resource, options = {}) {
        this.attributes = attributes;
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
        this.store = new Store(this.resource, adapter, {
            onAfterFetch: this.syncAttributes.bind(this)
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

        return this.store.create(data);
    }

    /**
	 * Creates a new resource on the server
	 *
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
    update(attributes = {}) {

        return this.store.update(this.attributes.id, attributes);
    }

    /**
	 * Deletes the resource instance on the server
	 *
	 * @return {[type]} [description]
	 */
    destroy() {
        return this.store.destroy(this.attributes.id);
    }

    /**
	 * Saves the resource instance on the server
	 *
	 * @return {[type]} [description]
	 */
    save() {
        const { attributes } = this;

        if (isEmpty(this.attributes.id)) {
            return this.create(attributes);
        }

        return this.update(attributes);
    }

    /**
	 * Set an instance property locally
	 *
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
    set(proprty, value = null) {
        this.attributes[property] = value;
    }

    /**
	 * Set multiple instance properties locally
	 *
	 * @param {Object} properties [description]
	 */
    setAttributes(attributes = {}) {
        this.attributes =  { ...this.attributes, ...attributes };
    }

    /**
	 * Get an attribute
	 *
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
	 getAttribute(attribute) {
        return this.attributes[attribute];
    }

    /**
	 * Merge and return attributes on the resource instance.
	 *
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
	 mergeAttributes(attributes = {}) {
        const modelAttributes = this.attributes || {};
        this.attributes =  { ...modelAttributes, ...attributes };

        return this.attributes;
    }

    /**
	 * Merge and return attributes on the resource instance.
	 *
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
	 syncAttributes(json = {}) {
        this.attributes = json;
    }
}

export default Resource;
