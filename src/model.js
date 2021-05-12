'use strict';

import Store from './Store';
import { isEmpty } from './utils';

class Model {
	/**
	 * The base model for all resources

	 * @return {[type]} [description]
	 */
	constructor(attributes = {}, version = 'v1', resource, adapter) {
		this.attributes = attributes;
		this.version = version;
		this.resource = resource;
		this.store = new Store(resource, adapter, {
			onAfterFetch: this.syncAttributes.bind(this)
		});
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
	 * Creates a new model on the server
	 * 
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
	create(attributes = {}) {
		const data = this.mergeAttributes(attributes);
		
		return this.store.create(data);
	}

	/**
	 * Creates a new model on the server
	 * 
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
	update(attributes = {}) {
		
		return this.store.update(this.attributes.id, attributes);
	}

	/**
	 * Deletes the model instance on the server
	 * 
	 * @return {[type]} [description]
	 */
	destroy() {
		return this.store.destroy(this.attributes.id);
	}

	/**
	 * Saves the model instance on the server
	 * 
	 * @return {[type]} [description]
	 */
	save() {
		const attributes = this.attributes;

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
	 * Merge and return attributes on the model instance.
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
	 * Merge and return attributes on the model instance.
	 * 
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
	 syncAttributes(json = {}) {
		this.attributes = json;
	}
};

export default Model;