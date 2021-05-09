'use strict';

import Model from './model';

class Place extends Model {
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