'use strict';

import { Place, Payload } from 'resources';

class Fleetbase {
	/**
	 * Builds an instance of the Fleetbase SDK
	 * 
	 * @param  {String} publicKey The public key issued
	 * @param  {String} secretKey The secret key issued
	 * @param  {String} version   The version of resource to access
	 * @return {Fletbase}        Instance
	 */
	constructor(publicKey, version = 'v1') {
		this.publicKey = publicKey;
		this.version = version;
		this.setResources(version);

		return this;
	}

	static newInstance(publicKey, version = 'v1') {
		return new Fleetbase(publicKey, version);
	}

	get resources() {
		return {
			v1: {
				place: new Place,
				payload: new Payload,
			},
			v2: {
				fleetOps: {

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