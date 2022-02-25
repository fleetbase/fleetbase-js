import Store from './store';
import Resource from './resource';
import { Contact, Driver, Entity, Order, Payload, Place, TrackingStatus, Vehicle, Vendor, Waypoint, Zone, ServiceArea, ServiceRate, ServiceQuote } from './resources';
import { BrowserAdapter, NodeAdapter, EmberJsAdapter, Adapter } from './adapters';
import { isNodeEnvironment, detectAdapter, isLatitude, isLongitude, Point, isResource, GoogleAddress, Collection, StoreActions } from './utils';
import { pluralize, singularize, classify, dasherize, camelize } from './utils/string';
import { extendStoreActions } from './store';
import { orderActions } from './resources/order';
import { driverActions } from './resources/driver';

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
        this.version = config.version ?? 'v1';
        this.options = {
            version: this.version,
            host: config.host ?? 'https://api.fleetbase.io',
            namespace: config.namespace ?? this.version,
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

        this.orders = new Store('order', this.adapter).extendActions(orderActions);
        this.entities = new Store('entity', this.adapter);
        this.places = new Store('place', this.adapter);
        this.drivers = new Store('driver', this.adapter).extendActions(driverActions);
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
    Zone,
    ServiceArea,
    ServiceRate,
    ServiceQuote,
    BrowserAdapter,
    NodeAdapter,
    EmberJsAdapter,
    Adapter,
    isNodeEnvironment,
    isLatitude,
    isLongitude,
    Point,
    isResource,
    GoogleAddress,
    Collection,
    StoreActions,
    extendStoreActions,
    pluralize,
    singularize,
    classify,
    dasherize,
    camelize,
};
