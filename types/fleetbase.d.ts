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
    static newInstance(...args: any[]): Fleetbase;
    /**
     * Builds an instance of the Fleetbase SDK
     *
     * @param  {String}  publicKey  The public key issued
     * @param  {Object}  config     The version of resource to access
     * @param  {Boolean} debug      Debug mode for SDK
     * @return {Fleetbase}          Instance
     */
    constructor(publicKey: string, config?: any, debug?: boolean);
    version: any;
    options: {
        version: any;
        host: any;
        namespace: any;
        debug: boolean;
        publicKey: string;
    };
    adapter: any;
    orders: any;
    entities: Store;
    places: Store;
    drivers: any;
    vehicles: Store;
    vendors: Store;
    contacts: Store;
    setAdapter(adapter: any): void;
    getAdapter(): any;
}
import Store from './store';
import Resource from './resource';
import { Contact } from './resources';
import { Driver } from './resources';
import { Entity } from './resources';
import { Order } from './resources';
import { Payload } from './resources';
import { Place } from './resources';
import { TrackingStatus } from './resources';
import { Vehicle } from './resources';
import { Vendor } from './resources';
import { Waypoint } from './resources';
import { Zone } from './resources';
import { ServiceArea } from './resources';
import { ServiceRate } from './resources';
import { ServiceQuote } from './resources';
import { BrowserAdapter } from './adapters';
import { NodeAdapter } from './adapters';
import { EmberJsAdapter } from './adapters';
import { Adapter } from './adapters';
import { isNodeEnvironment } from './utils';
import { isLatitude } from './utils';
import { isLongitude } from './utils';
import { Point } from './utils';
import { isResource } from './utils';
import { GoogleAddress } from './utils';
import { Collection } from './utils';
import { StoreActions } from './utils';
import { extendStoreActions } from './store';
import { pluralize } from './utils/string';
import { singularize } from './utils/string';
import { classify } from './utils/string';
import { dasherize } from './utils/string';
import { camelize } from './utils/string';
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
