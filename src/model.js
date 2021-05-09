'use strict';

class Model {
	/**
	 * The base model for all resources

	 * @return {[type]} [description]
	 */
	constructor(resource, attributes = {}, version = 'v1') {
		this.resource = resource;
		this.attributes = attributes;
		this.version = version;
	}

	/**
	 * Creates a new model on the server
	 * 
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
	create(attributes = {}) {
		this.attributes = [...this.attributes, ...attributes];
	}

	/**
	 * Deletes the model instance on the server
	 * 
	 * @return {[type]} [description]
	 */
	destroy() {

	}

	/**
	 * Saves the model instance on the server
	 * 
	 * @return {[type]} [description]
	 */
	save() {
		
	}

	/**
	 * Set an instance property locally
	 * 
	 * @param {[type]} proprty [description]
	 * @param {[type]} value   [description]
	 */
	set(proprty, value = null) {

	}

	/**
	 * Set multiple instance properties locally
	 * 
	 * @param {Object} properties [description]
	 */
	setProperties(properties = {}) {

	}
	
};

export default Model;