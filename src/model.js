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
		this.store = new Store(resource, adapter);
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
		this.attributes = [...this.attributes, ...attributes];
		
		return this.store.create(this.attributes);
	}

	/**
	 * Creates a new model on the server
	 * 
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
	update(attributes = {}) {
		this.attributes = [...this.attributes, ...attributes];
		
		return this.store.update(this.attributes.id, this.attributes);
	}

	/**
	 * Deletes the model instance on the server
	 * 
	 * @return {[type]} [description]
	 */
	destroy() {
		return this.store.delete(this.this.attributes.id);
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
		this.attributes = [...this.attributes, ...attributes];
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
};

export default Model;