import { detectAdapter } from './adapters/detect.js';
import Store from './store.js';
import { driverActions, orderActions, organizationActions, serviceQuoteActions } from './resources.js';
import type { Contact, Driver, Entity, Fleet, Order, Organization, Place, ServiceArea, ServiceQuote, Vehicle, Vendor, Zone } from './resources.js';
import { isNodeEnvironment } from './utils.js';
import type { AdapterLike, FleetbaseConfig, Identifier, RequestOptions, ResourceAttributes } from './types.js';

export type OrderStore = Store<Order> & {
    getDistanceAndTime(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    dispatch(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    start(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

export type DriverStore = Store<Driver> & {
    login(identity: string, password?: string | null, attributes?: ResourceAttributes): Promise<unknown>;
    verifyCode(identity: string, code: string, attributes?: ResourceAttributes): Promise<unknown>;
    retrieve(id: Identifier): Promise<unknown>;
};

export type OrganizationStore = Store<Organization> & {
    current(params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

export type ServiceQuoteStore = Store<ServiceQuote> & {
    fromPreliminary(params?: ResourceAttributes): Promise<unknown>;
    fromPayload(payload: unknown, params?: ResourceAttributes): Promise<unknown>;
};

export default class Fleetbase {
    version: string;
    options: FleetbaseConfig & { debug: boolean; publicKey: string };
    adapter: AdapterLike;
    orders: OrderStore;
    entities: Store<Entity>;
    places: Store<Place>;
    drivers: DriverStore;
    vehicles: Store<Vehicle>;
    vendors: Store<Vendor>;
    contacts: Store<Contact>;
    serviceAreas: Store<ServiceArea>;
    serviceQuotes: ServiceQuoteStore;
    zones: Store<Zone>;
    fleets: Store<Fleet>;
    organizations: OrganizationStore;

    constructor(publicKey: string, config: FleetbaseConfig = {}, debug = false) {
        if (typeof publicKey !== 'string' || publicKey.length === 0) {
            throw new Error('⚠️ Invalid public key given to Fleetbase SDK');
        }
        if (!isNodeEnvironment() && publicKey.toLowerCase().startsWith('$')) {
            throw new Error('Secret key provided. You must use a public key with Fleetbase Javascript SDK!');
        }

        this.version = config.version ?? 'v1';
        this.options = {
            ...config,
            version: this.version,
            host: config.host ?? 'https://api.fleetbase.io',
            namespace: config.namespace ?? this.version,
            debug,
            publicKey,
        };
        this.adapter = config.adapter ?? detectAdapter(this.options);
        this.orders = new Store<Order>('order', this.adapter).extendActions(orderActions) as OrderStore;
        this.entities = new Store<Entity>('entity', this.adapter);
        this.places = new Store<Place>('place', this.adapter);
        this.drivers = new Store<Driver>('driver', this.adapter).extendActions(driverActions) as DriverStore;
        this.vehicles = new Store<Vehicle>('vehicle', this.adapter);
        this.vendors = new Store<Vendor>('vendor', this.adapter);
        this.contacts = new Store<Contact>('contact', this.adapter);
        this.serviceAreas = new Store<ServiceArea>('service-area', this.adapter);
        this.serviceQuotes = new Store<ServiceQuote>('service-quote', this.adapter).extendActions(serviceQuoteActions) as ServiceQuoteStore;
        this.zones = new Store<Zone>('zone', this.adapter);
        this.fleets = new Store<Fleet>('fleet', this.adapter);
        this.organizations = new Store<Organization>('organization', this.adapter).extendActions(organizationActions) as OrganizationStore;
    }

    static newInstance(...params: ConstructorParameters<typeof Fleetbase>): Fleetbase {
        return new Fleetbase(...params);
    }

    setAdapter(adapter: AdapterLike): void {
        this.adapter = adapter;
        for (const store of this.stores()) {
            store.adapter = adapter;
        }
    }

    getAdapter(): AdapterLike {
        return this.adapter;
    }

    private stores(): Store[] {
        return [
            this.orders,
            this.entities,
            this.places,
            this.drivers,
            this.vehicles,
            this.vendors,
            this.contacts,
            this.serviceAreas,
            this.serviceQuotes,
            this.zones,
            this.fleets,
            this.organizations,
        ];
    }
}
