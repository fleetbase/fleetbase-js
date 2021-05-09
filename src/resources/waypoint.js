'use strict';

import Place from './place';

class Waypoint extends Place {
	/**
	 * The base model for all resources

	 * @return {Fleetbase} fleetbase
	 */
	constructor(attributes = []) {
		super.constructor(...arguments);

		this.attributes = attributes;
	}
};

export default Place;