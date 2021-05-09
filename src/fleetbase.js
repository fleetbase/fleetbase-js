'use strict';

import {
	Place,
	Payload
} from 'resources/v1';

class Fleetbase {
	/**
	 * Builds an instance of the Fleetbase SDK
	 * 
	 * @param  {String} publicKey The public key issued
	 * @param  {String} secretKey The secret key issued
	 * @param  {String} version   The version of resource to access
	 * @return {Fletbase}        Instance
	 */
	constructor(publicKey, secretKey, version = 'v1') {
		this.publicKey = publicKey;
		this.secretKey = secretKey;
		this.version = version;
		// set resources
		this.setResources(version);
		// return self
		return this;
	}

	get resources() {
		return {
			v1: {
				place: new Place,
				payload: new Payload,
			},
			v2: {
				opsMile: {

				}
			}
		};
	}

	setResources(version = 'v1') {
		for(let resource in this.resources[version]) {
			this[resource] = this.resource[version][resource];
		}
	}
};

export default Fleetbase;