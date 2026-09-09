import { detectAdapter } from './adapters/detect.js';
import Store from './store.js';
import {
    driverActions,
    manifestActions,
    manifestStopActions,
    orderActions,
    organizationActions,
    serviceQuoteActions,
    trailerActions,
    vehicleActions,
    workOrderActions,
} from './resources.js';
import type {
    Contact,
    Driver,
    Entity,
    Fleet,
    FuelReport,
    Inspection,
    InspectionForm,
    Issue,
    Manifest,
    ManifestStop,
    Order,
    Organization,
    Place,
    ServiceArea,
    ServiceQuote,
    Trailer,
    Vehicle,
    Vendor,
    WorkOrder,
    Zone,
} from './resources.js';
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
    /** `GET drivers/{id}/manifests` */
    manifests(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `POST drivers/{id}/change-password` */
    changePassword(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `POST drivers/forgot-password` */
    forgotPassword(params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `POST drivers/reset-password` */
    resetPassword(params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

export type VehicleStore = Store<Vehicle> & {
    /** `GET vehicles/{id}/trailers` */
    trailers(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `GET vehicles/{id}/inspections` — available from the FleetOps release that ships the driver inspection API. */
    inspections(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

export type TrailerStore = Store<Trailer> & {
    /** `POST trailers/{id}/attach` */
    attach(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `POST trailers/{id}/detach` */
    detach(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `GET trailers/{id}/connections` */
    connections(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    /** `PATCH trailers/{id}/track` */
    track(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

export type ManifestStore = Store<Manifest> & {
    /** `POST manifests/{id}/optimize` */
    optimize(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
};

/** `update(id, { status, meta? })` issues `PATCH manifest-stops/{id}` instead of the default `PUT`. */
export type ManifestStopStore = Store<ManifestStop>;

export type WorkOrderStore = Store<WorkOrder> & {
    /** `POST work-orders/{id}/send` */
    send(id: Identifier, params?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
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
    vehicles: VehicleStore;
    vendors: Store<Vendor>;
    contacts: Store<Contact>;
    serviceAreas: Store<ServiceArea>;
    serviceQuotes: ServiceQuoteStore;
    zones: Store<Zone>;
    fleets: Store<Fleet>;
    organizations: OrganizationStore;
    manifests: ManifestStore;
    manifestStops: ManifestStopStore;
    trailers: TrailerStore;
    fuelReports: Store<FuelReport>;
    issues: Store<Issue>;
    workOrders: WorkOrderStore;
    /** Available from the FleetOps release that ships the driver inspection API. */
    inspectionForms: Store<InspectionForm>;
    /** Available from the FleetOps release that ships the driver inspection API. */
    inspections: Store<Inspection>;

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
        this.vehicles = new Store<Vehicle>('vehicle', this.adapter).extendActions(vehicleActions) as VehicleStore;
        this.vendors = new Store<Vendor>('vendor', this.adapter);
        this.contacts = new Store<Contact>('contact', this.adapter);
        this.serviceAreas = new Store<ServiceArea>('service-area', this.adapter);
        this.serviceQuotes = new Store<ServiceQuote>('service-quote', this.adapter).extendActions(serviceQuoteActions) as ServiceQuoteStore;
        this.zones = new Store<Zone>('zone', this.adapter);
        this.fleets = new Store<Fleet>('fleet', this.adapter);
        this.organizations = new Store<Organization>('organization', this.adapter).extendActions(organizationActions) as OrganizationStore;
        this.manifests = new Store<Manifest>('manifest', this.adapter).extendActions(manifestActions) as ManifestStore;
        this.manifestStops = new Store<ManifestStop>('manifest-stop', this.adapter).extendActions(manifestStopActions);
        this.trailers = new Store<Trailer>('trailer', this.adapter).extendActions(trailerActions) as TrailerStore;
        this.fuelReports = new Store<FuelReport>('fuel-report', this.adapter);
        this.issues = new Store<Issue>('issue', this.adapter);
        this.workOrders = new Store<WorkOrder>('work-order', this.adapter).extendActions(workOrderActions) as WorkOrderStore;
        this.inspectionForms = new Store<InspectionForm>('inspection-form', this.adapter);
        this.inspections = new Store<Inspection>('inspection', this.adapter);
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
            this.manifests,
            this.manifestStops,
            this.trailers,
            this.fuelReports,
            this.issues,
            this.workOrders,
            this.inspectionForms,
            this.inspections,
        ];
    }
}
