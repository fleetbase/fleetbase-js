'use strict';

class Adapter {
	/**
	 * New instance of the Fleetbase adapter
	 * @param  {String} version [description]
	 * @return {[type]}         [description]
	 */
	constructor(version = 'v1') {
		this.version = version;
	}

	/**
	 * Get the current namespace
	 * @return {[type]} [description]
	 */
	get namespace() {
		return this.version;
	}
};

export default Adapter;