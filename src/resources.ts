import Resource, { isResource } from './resource.js';
import { register } from './registry.js';
import type Store from './store.js';
import StoreActions from './store-actions.js';
import { createCollection } from './collection.js';
import { isPhone, Point } from './utils.js';
import type { AdapterLike, Identifier, RequestOptions, ResourceAttributes, ResourceOptions } from './types.js';

type ActionStore = Store & Record<string, unknown>;

function callAction(store: Store, name: string, ...args: unknown[]): Promise<unknown> {
    const candidate = (store as ActionStore)[name];
    if (typeof candidate !== 'function') {
        throw new Error(`Store action '${name}' is not available.`);
    }
    return Promise.resolve((candidate as (...values: unknown[]) => unknown).apply(store, args));
}

function resourceId(value: unknown): unknown {
    return isResource(value) ? value.id : value;
}

export class Contact extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'contact', options);
    }
}

export class Entity extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'entity', options);
    }
}

export class Fleet extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'fleet', options);
    }
}

export class Vendor extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'vendor', options);
    }
}

export class Vehicle extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'vehicle', options);
    }
}

export class Zone extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'zone', options);
    }
}

export class ServiceArea extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'service-area', options);
    }
}

export class ServiceRate extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'service-rate', options);
    }
}

export class TrackingStatus extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'tracking-status', options);
    }
}

export class Place extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}, resource = 'place') {
        super(attributes, adapter, resource, options);
    }

    static fromGoogleAddress(googleAddress: { getAttribute(name: string): unknown; get(name: string): unknown }, adapter?: AdapterLike | null, options: ResourceOptions = {}): Place {
        const coordinates = googleAddress.getAttribute('coordinates');
        const latitude = Array.isArray(coordinates) ? Number(coordinates[0]) : 0;
        const longitude = Array.isArray(coordinates) ? Number(coordinates[1]) : 0;
        return new Place(
            {
                name: null,
                address: googleAddress.getAttribute('address'),
                location: new Point(latitude, longitude),
                street1: googleAddress.getAttribute('address'),
                street2: null,
                city: googleAddress.getAttribute('city'),
                province: googleAddress.getAttribute('stateLong'),
                postal_code: googleAddress.getAttribute('postalCode'),
                neighborhood: googleAddress.get('neighborhood'),
                district: googleAddress.getAttribute('county'),
                building: googleAddress.get('building'),
                country: googleAddress.getAttribute('countryShort'),
                phone: null,
                security_access_code: null,
            },
            adapter,
            options
        );
    }

    get latitude(): number {
        return this.location.coordinates[1];
    }
    get longitude(): number {
        return this.location.coordinates[0];
    }
    get coordinates(): [number, number] {
        return [this.latitude, this.longitude];
    }

    protected get location(): Point {
        const value = this.getAttribute('location');
        if (value instanceof Point) {
            return value;
        }
        if (value && typeof value === 'object' && 'coordinates' in value) {
            const coordinates = (value as { coordinates?: unknown }).coordinates;
            if (Array.isArray(coordinates)) {
                return Point.fromGeoJson({ coordinates: [Number(coordinates[0]), Number(coordinates[1])] });
            }
        }
        return new Point();
    }

    setOwner(owner: Resource | string): this {
        const id = resourceId(owner);
        if (typeof id === 'string') {
            this.setAttribute('owner', id);
        }
        return this;
    }
}

export class Waypoint extends Place {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, options, 'waypoint');
    }
}

export class Payload extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'payload', options);
    }

    attach(_entity: Entity): void {
        void _entity;
    }

    get entities(): ReturnType<typeof createCollection<Entity>> {
        const values = this.getAttribute('entities', []);
        return createCollection<Entity>((Array.isArray(values) ? values : []).map((value) => new Entity(value as ResourceAttributes, this.adapter)));
    }

    get dropoff(): Place | null {
        const value = this.getAttribute('dropoff');
        return value && typeof value === 'object' ? new Place(value as ResourceAttributes, this.adapter) : null;
    }

    get pickup(): Place | null {
        const value = this.getAttribute('pickup');
        return value && typeof value === 'object' ? new Place(value as ResourceAttributes, this.adapter) : null;
    }

    get waypoints(): ReturnType<typeof createCollection<Waypoint>> {
        const values = this.getAttribute('waypoints', []);
        return createCollection<Waypoint>((Array.isArray(values) ? values : []).map((value) => new Waypoint(value as ResourceAttributes, this.adapter)));
    }
}

export const organizationActions = new StoreActions({
    current(this: Store, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.get(`${this.namespace}/current`, params, options);
    },
});

export class Organization extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'organization', { actions: organizationActions, ...options });
    }
}

function serializeOrganizations(response: unknown, adapter: AdapterLike): Organization | Organization[] {
    return Array.isArray(response) ? response.map((attributes) => new Organization(attributes as ResourceAttributes, adapter)) : new Organization(response as ResourceAttributes, adapter);
}

export const driverActions = new StoreActions({
    login(this: Store, identity: string, password: string | null = null, attributes: ResourceAttributes = {}) {
        if (isPhone(identity)) {
            return this.adapter.post('drivers/login-with-sms', { phone: identity });
        }
        if (!password) {
            throw new Error('Login requires password!');
        }
        return this.adapter.post('drivers/login', { identity, password, ...attributes }).then((response) => this.afterFetch(response));
    },
    verifyCode(this: Store, identity: string, code: string, attributes: ResourceAttributes = {}) {
        return this.adapter.post('drivers/verify-code', { identity, code, ...attributes }).then((response) => this.afterFetch(response));
    },
    track(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`drivers/${String(id)}/track`, params, options).then((response) => this.afterFetch(response));
    },
    listOrganizations(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.get(`drivers/${String(id)}/organizations`, params, options).then((response) => serializeOrganizations(response, this.adapter));
    },
    switchOrganization(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`drivers/${String(id)}/switch-organization`, params, options).then((response) => serializeOrganizations(response, this.adapter));
    },
    currentOrganization(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.get(`drivers/${String(id)}/current-organization`, params, options).then((response) => serializeOrganizations(response, this.adapter));
    },
    retrieve(this: Store, id: Identifier) {
        return this.findRecord(id);
    },
    syncDevice(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`drivers/${String(id)}/register-device`, params, options);
    },
});

export class Driver extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'driver', { actions: driverActions, ...options });
    }
    get token(): unknown {
        return this.getAttribute('token');
    }
    get isOnline(): boolean {
        return this.getAttribute('online') === true;
    }
    get latitude(): number {
        return this.location.coordinates[1];
    }
    get longitude(): number {
        return this.location.coordinates[0];
    }
    get coordinates(): [number, number] {
        return [this.latitude, this.longitude];
    }
    private get location(): Point {
        const value = this.getAttribute('location');
        return value instanceof Point ? value : new Point();
    }
    track(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'track', this.id, params, options);
    }
    syncDevice(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'syncDevice', this.id, params, options);
    }
    listOrganizations(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'listOrganizations', this.id, params, options);
    }
    switchOrganization(organizationId: Identifier, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'switchOrganization', this.id, { next: organizationId }, options);
    }
    currentOrganization(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'currentOrganization', this.id, params, options);
    }
}

export const orderActions = new StoreActions({
    getDistanceAndTime(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.get(`${this.namespace}/${String(id)}/distance-and-time`, params, options);
    },
    getNextActivity(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.get(`${this.namespace}/${String(id)}/next-activity`, params, options);
    },
    dispatch(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`${this.namespace}/${String(id)}/dispatch`, params, options).then((response) => this.afterFetch(response));
    },
    start(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`${this.namespace}/${String(id)}/start`, params, options).then((response) => this.afterFetch(response));
    },
    updateActivity(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`${this.namespace}/${String(id)}/update-activity`, params, options).then((response) => this.afterFetch(response));
    },
    setDestination(this: Store, id: Identifier, destination: unknown, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`${this.namespace}/${String(id)}/set-destination/${String(resourceId(destination))}`, params, options).then((response) => this.afterFetch(response));
    },
    captureQrCode(this: Store, id: Identifier, subject: unknown = null, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        const subjectId = resourceId(subject);
        return this.adapter.post(`${this.namespace}/${String(id)}/capture-qr${subjectId ? `/${String(subjectId)}` : ''}`, params, options);
    },
    captureSignature(this: Store, id: Identifier, subject: unknown = null, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        const subjectId = resourceId(subject);
        return this.adapter.post(`${this.namespace}/${String(id)}/capture-signature${subjectId ? `/${String(subjectId)}` : ''}`, params, options);
    },
    complete(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.post(`${this.namespace}/${String(id)}/complete`, params, options).then((response) => this.afterFetch(response));
    },
    cancel(this: Store, id: Identifier, params: ResourceAttributes = {}, options: RequestOptions = {}) {
        return this.adapter.delete(`${this.namespace}/${String(id)}/cancel`, params as RequestOptions, options).then((response) => this.afterFetch(response));
    },
});

export class Order extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'order', { actions: orderActions, ...options });
    }
    getDistanceAndTime(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'getDistanceAndTime', this.id, params, options);
    }
    dispatch(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'dispatch', this.id, params, options);
    }
    start(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'start', this.id, params, options);
    }
    setDestination(destination: unknown, params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'setDestination', this.id, destination, params, options);
    }
    captureQrCode(subject: unknown = null, params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'captureQrCode', this.id, subject, params, options);
    }
    captureSignature(subject: unknown = null, params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'captureSignature', this.id, subject, params, options);
    }
    getNextActivity(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'getNextActivity', this.id, params, options);
    }
    updateActivity(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'updateActivity', this.id, params, options);
    }
    cancel(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'cancel', this.id, params, options);
    }
    complete(params: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return callAction(this.store, 'complete', this.id, params, options);
    }
    get isDispatched(): boolean {
        return this.getAttribute('dispatched_at') !== null;
    }
    get isNotDispatched(): boolean {
        return this.getAttribute('dispatched_at') === null;
    }
    get isStarted(): boolean {
        return this.getAttribute('started_at') !== null;
    }
    get isNotStarted(): boolean {
        return this.getAttribute('started_at') === null;
    }
    get isCompleted(): boolean {
        return this.getAttribute('status') === 'completed';
    }
    get isCanceled(): boolean {
        return this.getAttribute('status') === 'canceled';
    }
    get isEnroute(): boolean {
        return ['driver_enroute', 'enroute'].includes(String(this.getAttribute('status')));
    }
    get isInProgress(): boolean {
        return this.isStarted && !this.isCanceled && !this.isCompleted;
    }
    get scheduledAt(): Date | null {
        return this.dateAttribute('scheduled_at');
    }
    get startedAt(): Date | null {
        return this.dateAttribute('started_at');
    }
    get dispatchedAt(): Date | null {
        return this.dateAttribute('dispatched_at');
    }
    get status(): unknown {
        return this.getAttribute('status');
    }
    private dateAttribute(name: string): Date | null {
        return this.isAttributeFilled(name) ? new Date(String(this.getAttribute(name))) : null;
    }
}

export const serviceQuoteActions = new StoreActions({
    fromPayload(this: Store, payload: unknown, params: ResourceAttributes = {}) {
        return this.adapter.get(this.namespace, { payload: resourceId(payload), ...params }).then((response) => this.afterFetch(response));
    },
    fromPreliminary(this: Store, params: ResourceAttributes = {}) {
        return this.adapter.get(`${this.namespace}/preliminary`, params).then((response) => this.afterFetch(response));
    },
});

export class ServiceQuote extends Resource {
    constructor(attributes: ResourceAttributes = {}, adapter?: AdapterLike | null, options: ResourceOptions = {}) {
        super(attributes, adapter, 'service-quote', { actions: serviceQuoteActions, ...options });
    }
    fromPreliminary(params: ResourceAttributes = {}): Promise<unknown> {
        return callAction(this.store, 'fromPreliminary', params);
    }
    fromPayload(payload: Payload | Identifier, params: ResourceAttributes = {}): Promise<unknown> {
        return callAction(this.store, 'fromPayload', payload, params);
    }
}

for (const [name, constructor] of Object.entries({
    Contact,
    Driver,
    Entity,
    Fleet,
    Order,
    Organization,
    Payload,
    Place,
    ServiceArea,
    ServiceQuote,
    ServiceRate,
    TrackingStatus,
    Vehicle,
    Vendor,
    Waypoint,
    Zone,
})) {
    register('resource', name, constructor);
}
