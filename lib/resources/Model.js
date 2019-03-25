'use strict';

class Model {
	/**
	 * The base model for all resources

	 * @return {[type]} [description]
	 */
	constructor(resource, version = 'v1') {
		this.resource = resource;
		this.version = version;
	}

	/**
	 * Creates a new model on the server
	 * @param  {Object} payload [description]
	 * @return {[type]}         [description]
	 */
	create(payload = {}) {

	}
};

export default Model;