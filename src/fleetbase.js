import Store from './store.js';
import Resource, { isResource } from './resource.js';
import { Contact, Driver, Entity, Order, Payload, Place, TrackingStatus, Vehicle, Vendor, Waypoint, Zone, ServiceArea, ServiceRate, ServiceQuote, Organization, Fleet } from './resources.js';
import { BrowserAdapter, NodeAdapter, EmberJsAdapter, Adapter } from './adapters.js';
import { isNodeEnvironment, detectAdapter, isLatitude, isLongitude, Point, GoogleAddress, StoreActions } from './utils/index.js';
import Collection, { createCollection } from './utils/collection.js';
import { pluralize, singularize, classify, dasherize, camelize } from './utils/string.js';
import { extendStoreActions, createStoreActions } from './utils/store-actions.js';
import { orderActions } from './resources/order.js';
import { driverActions } from './resources/driver.js';
import { organizationActions } from './resources/organization.js';
import Resolver, { lookup, resolve, resolveResource } from './resolver.js';
import { register, createResource, createStore } from './registry.js';

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
        this.serviceAreas = new Store('service-area', this.adapter);
        this.zones = new Store('zone', this.adapter);
        this.fleets = new Store('fleet', this.adapter);
        this.organizations = new Store('organization', this.adapter).extendActions(organizationActions);
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
    Organization,
    Fleet,
    BrowserAdapter,
    NodeAdapter,
    EmberJsAdapter,
    Adapter,
    detectAdapter,
    isNodeEnvironment,
    isLatitude,
    isLongitude,
    Point,
    isResource,
    GoogleAddress,
    Collection,
    createCollection,
    StoreActions,
    extendStoreActions,
    createStoreActions,
    pluralize,
    singularize,
    classify,
    dasherize,
    camelize,
    lookup,
    register,
    createResource,
    Resolver,
    resolve,
    resolveResource,
    createStore,
};
