'use strict';

import Store from './store';
import { resolve } from './resolve';

/**
 * // instancr
 * const fleetbase = new Fleetbase();
 * 
 * const contact = fleetbase.contacts.create({
 * 		name: 'Ron',
 * 		phone: '+65 9999 8888'
 * });
 * 
 * // export
 * import { Contact } from '@fleetbase/sdk/resources';
 * 
 * const contact = new Contact({
 * 		name: 'Ron',
 * 		phone: '+65 9999 8888'
 * });
 * 
 * contact.save();
 */

class Fleetbase {
	/**
	 * Builds an instance of the Fleetbase SDK
	 * 
	 * @param  {String} publicKey The public key issued
	 * @param  {String} version   The version of resource to access
	 * @param  {Adapter} adapter   The adapter to use
	 * @return {Fletbase}        Instance
	 */
	constructor(publicKey, version = 'v1', adapter = null) {
		this.publicKey = publicKey;
		this.version = version;
		this.adapter = adapter || resolve('adapter', 'BrowserAdapter');
		
		if (typeof publicKey !== 'string' || publicKey.length === 0) {
			throw new Error('⚠️ Invalid public key given to Fleetbase SDK');
		}

		if (publicKey.toLowerCase().startsWith('sk_')) {
			throw new Error('Secret key provided. You must use a public key with Fleetbase Javascript SDK!');
		  }

		this.orders = new Store('order', this.adapter);
		this.entities = new Store('entity', this.adapter);
		this.places = new Store('place', this.adapter);
		this.drivers = new Store('driver', this.adapter);
		this.vehicles = new Store('vehicle', this.adapter);
		this.vendors = new Store('vendor', this.adapter);
		this.contacts = new Store('contact', this.adapter);

		return this;
	}

	static newInstance(publicKey, version = 'v1') {
		return new Fleetbase(publicKey, version);
	}

	setAdapter(adapter) {
		this.adapter = adapter;
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
			this[pluralize(resource)] = new Store()
		}
	}
};

export default Fleetbase;