'use strict';

import Store from './store';
import { lookup } from './resolver';

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
	 * @param  {Object} config    Config to overwrite
	 * @return {Fletbase}        Instance
	 */
	constructor(publicKey, debug = false, config = {}) {
		this.version = config.version || 'v1';
		this.options = {
			version: this.version,
			host: 'https://api.fleetbase.io',
			namespace: this.version || config.namespace,
			debug,
			publicKey
		};
		this.adapter = config.adapter || lookup('adapter', 'BrowserAdapter', this.options);

		if (typeof publicKey !== 'string' || publicKey.length === 0) {
			throw new Error('⚠️ Invalid public key given to Fleetbase SDK');
		}

		if (publicKey.toLowerCase().startsWith('$')) {
			throw new Error('Secret key provided. You must use a public key with Fleetbase Javascript SDK!');
		  }

		this.orders = new Store('order', this.adapter);
		this.entities = new Store('entity', this.adapter);
		this.places = new Store('place', this.adapter);
		this.drivers = new Store('driver', this.adapter);
		this.vehicles = new Store('vehicle', this.adapter);
		this.vendors = new Store('vendor', this.adapter);
		this.contacts = new Store('contact', this.adapter);
	}

	static newInstance(publicKey, debug = false, config = {}) {
		return new Fleetbase(publicKey, debug, config);
	}

	setAdapter(adapter) {
		this.adapter = adapter;
	}

	getAdapter() {
		return this.adapter
	}
};

export default Fleetbase;