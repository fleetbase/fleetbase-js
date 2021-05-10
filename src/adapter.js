'use strict';

class Adapter {
	/**
	 * New instance of the Fleetbase adapter
	 * 
	 * @param  {String} version [description]
	 * @return {[type]}         [description]
	 */
	constructor(version = 'v1') {
		this.version = version;
	}
};

export default Adapter;