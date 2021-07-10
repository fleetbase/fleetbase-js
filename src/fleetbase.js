import Store from './store';
import Resource from './resource';
import { isNodeEnvironment, detectAdapter } from './utils';
import { Contact, Driver, Entity, Order, Payload, Place, TrackingStatus, Vehicle, Vendor, Waypoint } from './resources';
import { BrowserAdapter, NodeAdapter, EmberJsAdapter, Adapter } from './adapters';
import { isLatitude, isLongitude, GoogleAddress } from './utils';
import { pluralize, singularize, classify, dasherize, camelize } from './utils/string';

/**
 * // instance
 * const fleetbase = new Fleetbase();
 *
 * const contact = fleetbase.contacts.create({
 * 		name: 'Ron',
 * 		phone: '+65 9999 8888'
 * });
 *
 * constact.update({ name: 'Hollywood Ron' });
 *
 * // export
 * import { Contact } from '@fleetbase/sdk';
 *
 * const contact = new Contact({
 * 		name: 'Ron',
 * 		phone: '+65 9999 8888'
 * });
 *
 * contact.save();
 */

export default class Fleetbase {
    /**
     * Builds an instance of the Fleetbase SDK
     *
     * @param  {String}  publicKey  The public key issued
     * @param  {Object}  config     The version of resource to access
     * @param  {Boolean} debug      Debug mode for SDK
     * @return {Fleetbase}          Instance
     */
    constructor(publicKey, config = {}, debug = false) {
        this.version = config.version || 'v1';
        this.options = {
            version: this.version,
            host: config.host || 'https://api.fleetbase.io',
            namespace: this.version || config.namespace,
            debug,
            publicKey,
        };

        if (typeof publicKey !== 'string' || publicKey.length === 0) {
            throw new Error('⚠️ Invalid public key given to Fleetbase SDK');
        }

        if (!isNodeEnvironment() && publicKey.toLowerCase().startsWith('$')) {
            throw new Error('Secret key provided. You must use a public key with Fleetbase Javascript SDK!');
        }

        this.adapter = config.adapter || detectAdapter(this.options);

        this.orders = new Store('order', this.adapter);
        this.entities = new Store('entity', this.adapter);
        this.places = new Store('place', this.adapter);
        this.drivers = new Store('driver', this.adapter);
        this.vehicles = new Store('vehicle', this.adapter);
        this.vendors = new Store('vendor', this.adapter);
        this.contacts = new Store('contact', this.adapter);
    }

    static newInstance() {
        return new Fleetbase(...arguments);
    }

    setAdapter(adapter) {
        this.adapter = adapter;
    }

    getAdapter() {
        return this.adapter;
    }
}

export {
    Store,
    Resource,
    Contact,
    Driver,
    Entity,
    Order,
    Payload,
    Place,
    TrackingStatus,
    Vehicle,
    Vendor,
    Waypoint,
    BrowserAdapter,
    NodeAdapter,
    EmberJsAdapter,
    Adapter,
    isNodeEnvironment,
    isLatitude,
    isLongitude,
    GoogleAddress,
    pluralize,
    singularize,
    classify,
    dasherize,
    camelize,
};
