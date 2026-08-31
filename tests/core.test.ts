import Fleetbase, {
    Adapter,
    BrowserAdapter,
    Collection,
    Contact,
    create,
    createAdapter,
    createCollection,
    createGoogleAddress,
    createResource,
    createStore,
    createStoreActions,
    createStoreInstance,
    Driver,
    EmberJsAdapter,
    Entity,
    Fleet,
    FleetbaseError,
    GoogleAddress,
    isResource,
    isCollection,
    objectAt,
    NodeAdapter,
    Order,
    Organization,
    Payload,
    Place,
    Point,
    register,
    replace,
    resolve,
    resolveAdapter,
    resolveResource,
    Resource,
    ServiceArea,
    ServiceQuote,
    ServiceRate,
    Store,
    StoreActions,
    TrackingStatus,
    uniqBy,
    Vehicle,
    Vendor,
    Waypoint,
    Zone,
} from '../src/index.js';
import Resolver from '../src/resolver.js';
import { detectAdapter } from '../src/adapters/detect.js';
import { appendQuery, buildUrl, requestWithFetch } from '../src/adapters/fetch.js';
import FleetbaseString, { camelize, capitalize, classify, dasherize, demodulize, foreignKey, humanize, normify, pluralize, singularize, tableize, underscore } from '../src/string.js';
import { extend, get, getProperties, invoke, isBlank, isCallable, isEmail, isEmpty, isLatitude, isLongitude, isNodeEnvironment, isPhone, set, setProperties, uuid } from '../src/utils.js';
import type { AdapterLike, RequestOptions, ResourceAttributes } from '../src/types.js';
import * as sdkExports from '../src/index.js';
import contract from '../contracts/v1.2.13.json' with { type: 'json' };

class RecordingAdapter implements AdapterLike {
    calls: Array<[string, string, unknown, RequestOptions | undefined]> = [];
    response: unknown = { id: 'place_1', created_at: '2026-01-01T00:00:00.000Z' };
    failure: Error | null = null;

    private send(method: string, path: string, data: unknown, options?: RequestOptions): Promise<unknown> {
        this.calls.push([method, path, data, options]);
        return this.failure ? Promise.reject(this.failure) : Promise.resolve(this.response);
    }

    get(path: string, query: ResourceAttributes = {}, options?: RequestOptions): Promise<unknown> {
        return this.send('GET', path, query, options);
    }
    post(path: string, data: unknown = {}, options?: RequestOptions): Promise<unknown> {
        return this.send('POST', path, data, options);
    }
    put(path: string, data: unknown = {}, options?: RequestOptions): Promise<unknown> {
        return this.send('PUT', path, data, options);
    }
    patch(path: string, data: unknown = {}, options?: RequestOptions): Promise<unknown> {
        return this.send('PATCH', path, data, options);
    }
    delete(path: string, options?: RequestOptions, legacyOptions?: RequestOptions): Promise<unknown> {
        return this.send('DELETE', path, {}, legacyOptions ?? options);
    }
}

describe('utility compatibility', () => {
    it('handles empty and blank values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty(new Set())).toBe(true);
        expect(isEmpty(() => undefined)).toBe(false);
        expect(isEmpty({})).toBe(false);
        expect(isBlank('  ')).toBe(true);
        expect(isBlank('x')).toBe(false);
    });

    it('validates coordinates and identities', () => {
        expect(isLatitude(90)).toBe(true);
        expect(isLatitude(-91)).toBe(false);
        expect(isLatitude(Symbol('x'))).toBe(false);
        expect(isLongitude(180)).toBe(true);
        expect(isLongitude(-181)).toBe(false);
        expect(isLongitude(Symbol('x'))).toBe(false);
        expect(isPhone('+1 (202) 555-0100')).toBe(true);
        expect(isPhone('hello')).toBe(false);
        expect(isEmail('sdk@fleetbase.io')).toBe(true);
        expect(isEmail('sdk')).toBe(false);
        expect(isNodeEnvironment()).toBe(true);
    });

    it('gets, sets, invokes, and extends nested values safely', () => {
        const target: ResourceAttributes = { nested: { value: 1 }, callable: () => 'ok' };
        expect(get(target, 'nested.value')).toBe(1);
        expect(get(target, ['callable'])).toBe('ok');
        expect(get(target, 'missing.value')).toBeNull();
        expect(set(target, 'nested.next', 2)).toBe(2);
        expect(() => set(target, '__proto__.polluted', true)).toThrow(TypeError);
        expect(getProperties(target, ['nested.value'])).toEqual({ 'nested.value': 1 });
        expect(setProperties(target, { 'nested.third': 3 })).toBe(target);
        expect(extend(target, { extra: true })).toMatchObject({ extra: true });
        expect(isCallable(target, 'callable')).toBe(true);
        expect(isCallable(target, 'missing')).toBe(false);
        expect(invoke(target, 'callable')?.()).toBe('ok');
        expect(invoke(target, 'missing')).toBeUndefined();
    });

    it('creates standards-compatible points, addresses, and UUIDs', () => {
        const point = new Point(1, 2);
        expect(point.latitude).toBe(1);
        expect(point.longitude).toBe(2);
        expect(point.lat()).toBe(1);
        expect(point.lng()).toBe(2);
        expect(point.serialize()).toEqual({ type: 'Point', coordinates: [2, 1] });
        expect(point.toJson()).toEqual(point.serialize());
        expect(point.toString()).toBe('(1, 2)');
        expect(Point.fromGeoJson({ coordinates: [4, 3] }).coordinates).toEqual([4, 3]);
        expect(uuid()).toMatch(/^[0-9a-f-]{36}$/i);

        const place = {
            address_components: [
                { long_name: '400', short_name: '400', types: ['street_number'] },
                { long_name: 'Broad Street', short_name: 'Broad St', types: ['route'] },
                { long_name: 'Seattle', short_name: 'Seattle', types: ['locality'] },
                { long_name: 'Washington', short_name: 'WA', types: ['administrative_area_level_1'] },
                { long_name: 'United States', short_name: 'US', types: ['country'] },
            ],
            geometry: { location: { lat: 47.6, lng: -122.3 } },
        };
        const address = createGoogleAddress(place);
        expect(address).toBeInstanceOf(GoogleAddress);
        expect(address.get('country', true)).toBe('US');
        expect(address.get('missing')).toBeNull();
        expect(address.has('locality')).toBe(true);
        expect(address.or(['missing', ['country', true]])).toBe('US');
        expect(address.all()).toMatchObject({ address: '400 Broad Street', city: 'Seattle' });
        expect(address.setAttribute('custom', 1).getAttribute('custom')).toBe(1);
        expect(address.setAttributes({ another: 2 }).getAttribute('another')).toBe(2);
        address.parse();
    });
});

describe('string and collection compatibility', () => {
    it('supports chaining and exported string transformations', () => {
        expect((new FleetbaseString('Hello World').dasherize() as FleetbaseString).get()).toBe('hello-world');
        expect(new FleetbaseString(null).get()).toBe('');
        expect(pluralize('entity')).toBe('entities');
        expect(pluralize('fish')).toBe('fish');
        expect(pluralize('person')).toBe('people');
        expect(singularize('entities')).toBe('entity');
        expect(humanize('driver_id')).toBe('Driver');
        expect(humanize('driver_id', true)).toBe('driver');
        expect(underscore('Fleetbase::ServiceQuote')).toBe('fleetbase/service_quote');
        expect(camelize('service_quote')).toBe('ServiceQuote');
        expect(camelize('service_quote', true)).toBe('serviceQuote');
        expect(capitalize('fLEETBASE')).toBe('Fleetbase');
        expect(dasherize('Fleet Base')).toBe('fleet-base');
        expect(normify('service_quote')).toBe('Service Quote');
        expect(normify('ServiceQuote', true)).toBe('Service Quote');
        expect(demodulize('Fleetbase::Order')).toBe('Order');
        expect(tableize('ServiceQuote')).toBe('service_quotes');
        expect(classify('service-quotes')).toBe('ServiceQuote');
        expect(foreignKey('Fleetbase::Order')).toBe('order_id');
        expect(foreignKey('Order', true)).toBe('orderid');
        expect((new FleetbaseString('1 2 3 4 11 12 13 21 word').ordinalize() as FleetbaseString).get()).toBe('1st 2nd 3rd 4th 11th 12th 13th 21st word');
        expect(FleetbaseString.invoke('dasherize', 'Hello World')).toBe('hello-world');
        expect(FleetbaseString.invoke('missing' as keyof FleetbaseString, 'x')).toBeNull();
    });

    it('implements the legacy collection helpers', () => {
        const collection = createCollection([
            { id: 2, active: false },
            { id: 1, active: true },
            { id: 1, active: true },
        ]);
        expect(collection).toBeInstanceOf(Collection);
        expect(collection.notEmpty).toBe(true);
        expect(collection.empty).toBe(false);
        expect(collection.first?.id).toBe(2);
        expect(collection.last?.id).toBe(1);
        expect(collection.objectAt(1)?.id).toBe(1);
        expect(collection.objectsAt([0, 9])).toEqual([collection[0], undefined]);
        expect(collection.findBy('id', 1)?.id).toBe(1);
        expect(collection.findIndexBy('active')).toBe(1);
        expect(collection.isAny('active')).toBe(true);
        expect(collection.isEvery('id')).toBe(true);
        expect(collection.invoke('id')).toEqual([2, 1, 1].map(() => undefined));
        expect(createCollection([{ run: () => 'ok' }]).invoke('run')).toEqual(['ok']);
        expect(collection.toArray()).not.toBe(collection);
        expect(collection.compact()).toHaveLength(3);
        expect(collection.sortBy('id').first?.id).toBe(1);
        expect(collection.uniqBy('id')).toHaveLength(2);
        expect(collection.without(collection[0]!)).toHaveLength(2);
        expect(collection.without({ id: 9, active: false })).toBe(collection);
        collection.insertAt(0, { id: 3, active: false }).replaceAt(0, { id: 4, active: true }).removeAt(0);
        collection.pushObject({ id: 5, active: true }).pushObjects([{ id: 6, active: true }]);
        expect(collection.popObject()?.id).toBe(6);
        expect(collection.shiftObject()).not.toBeNull();
        expect(collection.unshiftObject({ id: 7, active: true }).id).toBe(7);
        collection.unshiftObjects([{ id: 8, active: true }]).reverseObjects();
        const duplicate = collection[0]!;
        collection.push(duplicate);
        collection.removeObject(duplicate).removeObjects([]).addObject(duplicate).addObjects([duplicate]);
        expect(collection.includes(duplicate)).toBe(true);
        collection.setObjects([{ id: 9, active: true }]);
        expect(collection).toHaveLength(1);
        expect(collection.clear().empty).toBe(true);
        expect(collection.popObject()).toBeNull();
        expect(collection.shiftObject()).toBeNull();
    });
});

describe('fetch adapters', () => {
    it('constructs URLs and serializes query values', () => {
        expect(buildUrl({ host: 'https://api.test/', namespace: '/v1/' }, '/orders')).toBe('https://api.test/v1/orders');
        expect(buildUrl({}, 'orders', 'https://override.test')).toBe('https://override.test');
        const url = appendQuery('https://api.test/orders?first=1', { ids: [1, 2], at: new Date('2026-01-01T00:00:00.000Z'), filter: { active: true }, skip: null });
        expect(url).toContain('ids=1');
        expect(url).toContain('ids=2');
        expect(url).toContain('filter=%7B%22active%22%3Atrue%7D');
        expect(appendQuery('x', {})).toBe('x');
        expect(appendQuery('x', { skip: undefined })).toBe('x');
    });

    it('handles successful, empty, text, HTTP, and network responses', async () => {
        const make = (response: Response) => ({ host: 'https://api.test', namespace: 'v1', fetch: vi.fn().mockResolvedValue(response) });
        await expect(requestWithFetch(make(new Response(JSON.stringify({ ok: true }), { status: 200 })), { path: 'orders', method: 'POST', data: { a: 1 } })).resolves.toEqual({ ok: true });
        await expect(requestWithFetch(make(new Response(null, { status: 204 })), { path: 'orders', method: 'DELETE' })).resolves.toBeNull();
        await expect(requestWithFetch(make(new Response('plain', { status: 200 })), { path: 'orders', method: 'GET' })).resolves.toBe('plain');
        await expect(
            requestWithFetch(make(new Response(JSON.stringify({ errors: ['bad'] }), { status: 422, headers: { 'x-request-id': 'req_1' } })), { path: 'orders', method: 'GET' })
        ).rejects.toMatchObject({ message: 'bad', status: 422, requestId: 'req_1' });
        await expect(requestWithFetch({ fetch: vi.fn().mockRejectedValue(new Error('offline')) }, { path: 'orders', method: 'GET' })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
        const savedFetch = globalThis.fetch;
        vi.stubGlobal('fetch', undefined);
        await expect(requestWithFetch({}, { path: 'orders', method: 'GET' })).rejects.toMatchObject({ code: 'FETCH_UNAVAILABLE' });
        vi.stubGlobal('fetch', savedFetch);
    });

    it('supports browser, node, ember, and abstract adapters', async () => {
        const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response('{}', { status: 200 })));
        const browser = new BrowserAdapter({ host: 'https://api.test', namespace: 'v1', publicKey: 'pk', fetch: fetchMock });
        browser.setHeaders({ 'X-Test': 'yes' });
        await browser.get('orders', { page: 1 });
        await browser.post('orders', { id: 1 });
        await browser.put('orders/1', { id: 1 });
        await browser.patch('orders/1', { id: 1 });
        await browser.delete('orders/1');
        await expect(browser.parseJSON(new Response('{"ok":true}'))).resolves.toMatchObject({ ok: true, json: { ok: true } });
        await expect(browser.parseJSON(new Response('not-json'))).rejects.toThrow('Something went wrong');
        await browser.request('orders', 'POST', { body: JSON.stringify({ id: 1 }), headers: { 'X-Legacy': 'yes' } });
        expect(fetchMock).toHaveBeenCalledTimes(6);
        expect(new EmberJsAdapter({ fetch: fetchMock })).toBeInstanceOf(BrowserAdapter);
        const node = new NodeAdapter({ fetch: fetchMock });
        await node.get('orders');
        await node.post('orders', {});
        await node.put('orders/1', {});
        await node.patch('orders/1', {});
        await node.delete('orders/1');
        const abstract = new Adapter();
        await expect(abstract.get('x')).rejects.toThrow('implemented');
        await expect(abstract.post('x')).rejects.toThrow('implemented');
        await expect(abstract.put('x')).rejects.toThrow('implemented');
        await expect(abstract.patch('x')).rejects.toThrow('implemented');
        await expect(abstract.delete('x')).rejects.toThrow('implemented');
    });
});

describe('resources, stores, and SDK compatibility', () => {
    it('registers and resolves all public resource classes', () => {
        const classes = [Contact, Driver, Entity, Fleet, Order, Organization, Payload, Place, ServiceArea, ServiceQuote, ServiceRate, TrackingStatus, Vehicle, Vendor, Waypoint, Zone];
        for (const Constructor of classes) {
            const instance = resolveResource<Resource>(Constructor.name, {});
            expect(instance).toBeInstanceOf(Constructor);
            expect(isResource(instance)).toBe(true);
        }
        expect(createResource({}, new RecordingAdapter(), 'resource')).toBeInstanceOf(Resource);
        expect(resolveAdapter('BrowserAdapter', { fetch: vi.fn() })).toBeInstanceOf(BrowserAdapter);
        expect(() => resolveResource('Missing')).toThrow("No resource named 'Missing'");
        expect(() => createResource('missing')).not.toThrow();
        class CustomResource extends Resource {}
        register('resource', 'CustomResource', CustomResource);
        expect(resolveResource('CustomResource')).toBeInstanceOf(CustomResource);
    });

    it('tracks, serializes, saves, reloads, and destroys resources safely', async () => {
        const adapter = new RecordingAdapter();
        const resource = new Place({ name: 'Before', nested: { value: 1 } }, adapter);
        expect(resource.isNew).toBe(true);
        expect(resource.isEmpty).toBe(false);
        expect(resource.getAttribute('missing', 'fallback')).toBe('fallback');
        expect(resource.hasAttribute('name')).toBe(true);
        expect(resource.hasAttributes(['name', 'nested'])).toBe(true);
        expect(resource.isAttributeFilled('name')).toBe(true);
        resource.setAttribute('name', 'After').setAttributes({ phone: '1' });
        expect(resource.isDirty('name')).toBe(true);
        expect(resource.hasDirtyAttributes()).toBe(true);
        expect(resource.changes.name).toHaveLength(1);
        const legacyChanges = Object.getOwnPropertyDescriptor(Resource.prototype, 'changes')?.value as (this: Resource) => Record<string, unknown>;
        expect(legacyChanges.call(resource)).toBe(resource.changes);
        resource.mutate('nested.value', 2);
        expect(resource.getAttribute('nested.value')).toBe(2);
        expect(resource.getDirtyAttributes()).toMatchObject({ name: 'Before' });
        expect(resource.getAttributes('name')).toBe('After');
        expect(resource.serialize()).toMatchObject({ name: 'After' });
        expect(resource.mergeAttributes({ city: 'Seattle' })).toMatchObject({ city: 'Seattle' });
        let iterated = 0;
        resource.eachAttribute(() => {
            iterated += 1;
        });
        expect(iterated).toBeGreaterThan(0);
        expect(resource.eachAttribute()).toBe(resource);
        await resource.save();
        expect(resource.id).toBe('place_1');
        await resource.save();
        resource.setAttribute('name', 'Dirty');
        await resource.save({ onlyDirty: true });
        await resource.reload();
        await resource.destroy();
        expect(resource.isLoading).toBe(false);
        expect(resource.isDestroying).toBe(false);
        resource.empty();
        expect(resource.isEmpty).toBe(true);
        expect(() => resource.setFlags(['bad' as 'isLoading'])).toThrow('not a valid flag');

        adapter.failure = new Error('failed');
        await expect(resource.create()).rejects.toThrow('failed');
        expect(resource.isSaving).toBe(false);
    });

    it('serializes store responses and forwards CRUD options', async () => {
        const adapter = new RecordingAdapter();
        const store = new Store<Place>('place', adapter);
        expect(await store.create({ name: 'x' })).toBeInstanceOf(Place);
        expect(await store.update('place_1', { name: 'y' })).toBeInstanceOf(Place);
        expect(await store.findRecord('place_1')).toBeInstanceOf(Place);
        adapter.response = [{ id: 'place_1' }, { id: 'place_2' }];
        expect(await store.findAll()).toBeInstanceOf(Collection);
        expect(await store.query({ page: 1 })).toHaveLength(2);
        adapter.response = { id: 'place_1' };
        await store.queryRecord({ active: true });
        await store.destroy('place_1', { headers: { 'X-Test': 'yes' } });
        await store.destroy(new Place({ id: 'place_1' }, adapter));
        expect(adapter.calls.at(-1)?.[1]).toBe('places/place_1');
    });

    it('extends store actions and exercises specialized resource actions', async () => {
        const adapter = new RecordingAdapter();
        const actions = new StoreActions({
            custom(this: Store, value: string) {
                return `${this.namespace}:${value}`;
            },
            value: 1,
        });
        const store = new Store('place', adapter, { actions });
        expect((store.custom as (value: string) => string)('x')).toBe('places:x');
        expect(store.value).toBe(1);
        expect(actions.extend()).toBe(actions);

        const order = new Order({ id: 'order_1', status: 'driver_enroute', started_at: '2026-01-01', dispatched_at: '2026-01-01', scheduled_at: '2026-01-01' }, adapter);
        expect(order.isDispatched).toBe(true);
        expect(order.isNotDispatched).toBe(false);
        expect(order.isStarted).toBe(true);
        expect(order.isNotStarted).toBe(false);
        expect(order.isEnroute).toBe(true);
        expect(order.isInProgress).toBe(true);
        expect(order.scheduledAt).toBeInstanceOf(Date);
        expect(order.startedAt).toBeInstanceOf(Date);
        expect(order.dispatchedAt).toBeInstanceOf(Date);
        await order.getDistanceAndTime();
        await order.dispatch();
        await order.start();
        await order.setDestination(new Place({ id: 'place_1' }, adapter));
        await order.captureQrCode();
        await order.captureSignature('entity_1');
        await order.getNextActivity();
        await order.updateActivity();
        await order.cancel();
        await order.complete();

        const driver = new Driver({ id: 'driver_1', online: true, token: 'token', location: new Point(1, 2) }, adapter);
        expect(driver.isOnline).toBe(true);
        expect(driver.token).toBe('token');
        expect(driver.coordinates).toEqual([1, 2]);
        await driver.track();
        await driver.syncDevice();
        adapter.response = [{ id: 'org_1' }];
        await driver.listOrganizations();
        adapter.response = { id: 'org_1' };
        await driver.switchOrganization('org_1');
        await driver.currentOrganization();

        const quote = new ServiceQuote({ id: 'quote_1' }, adapter);
        await quote.fromPreliminary({ pickup: 'place_1' });
        await quote.fromPayload(new Payload({ id: 'payload_1' }, adapter));
    });

    it('constructs the SDK, validates keys, and propagates adapter changes', () => {
        const adapter = new RecordingAdapter();
        expect(() => new Fleetbase('')).toThrow('Invalid public key');
        const sdk = new Fleetbase('pk_test', { adapter, host: 'https://api.test' }, true);
        expect(sdk).toBeInstanceOf(Fleetbase);
        expect(Fleetbase.newInstance('pk_test', { adapter })).toBeInstanceOf(Fleetbase);
        expect(sdk.places).toBeInstanceOf(Store);
        expect(sdk.serviceQuotes).toBeInstanceOf(Store);
        expect(sdk.getAdapter()).toBe(adapter);
        const replacement = new RecordingAdapter();
        expect(sdk.setAdapter(replacement)).toBeUndefined();
        expect(sdk.orders.adapter).toBe(replacement);
        const error = new FleetbaseError('bad', { status: 400, code: 'BAD', requestId: 'req', response: {}, cause: new Error('cause') });
        expect(error).toBeInstanceOf(Error);
        expect(error).toMatchObject({ name: 'FleetbaseError', status: 400, code: 'BAD', requestId: 'req' });
    });
});

describe('published v1 compatibility snapshot', () => {
    it('preserves every published root export', () => {
        for (const name of contract.exports) {
            expect(name in sdkExports, `missing export ${name}`).toBe(true);
        }
    });

    it('preserves client stores and prototype methods', () => {
        const client = new Fleetbase('pk_test', { adapter: new RecordingAdapter() });
        for (const store of contract.stores) {
            expect(client[store as keyof Fleetbase], `missing store ${store}`).toBeInstanceOf(Store);
        }
        for (const [className, methods] of Object.entries(contract.prototypeMethods)) {
            const Constructor = className === 'Fleetbase' ? Fleetbase : sdkExports[className as keyof typeof sdkExports];
            expect(typeof Constructor).toBe('function');
            const prototype = (Constructor as { prototype: object }).prototype;
            for (const method of methods) {
                expect(method in prototype, `${className}.${method} is missing`).toBe(true);
            }
        }
    });
});

describe('edge and failure contracts', () => {
    it('covers collection functional and comparison edges', () => {
        expect(isCollection(createCollection())).toBe(true);
        expect(isCollection([])).toBe(false);
        expect(objectAt([1, 2], 1)).toBe(2);
        const raw = [1, 2];
        replace(raw, 0, 1, [3]);
        expect(raw).toEqual([3, 2]);
        expect(uniqBy([1, 1, 2])).toEqual([1, 2]);
        expect(uniqBy([{ id: 1 }, { id: 1 }], (item) => item.id)).toHaveLength(1);
        const values = createCollection([{ value: null }, { value: 1 }, { value: undefined }, { value: 1 }]);
        expect(values.sortBy('value').map((item) => item.value)).toEqual([undefined, null, 1, 1]);
        expect(values.findBy('value', 9)).toBeUndefined();
        expect(values.findIndexBy('value', 9)).toBe(-1);
        expect(values.isEvery('value', 1)).toBe(false);
        expect(values.isAny('value', 9)).toBe(false);
        expect(createCollection([null, 1, undefined]).compact()).toEqual([1]);
        expect(new Collection(1, 2)).toEqual([1, 2]);
        expect(
            createCollection([{ value: 2 }, { value: 1 }])
                .sortBy('value')
                .map((item) => item.value)
        ).toEqual([1, 2]);
        expect(
            createCollection([{ value: 1 }, { value: 2 }])
                .sortBy('value')
                .map((item) => item.value)
        ).toEqual([1, 2]);
        const removable = createCollection([1, 2]);
        removable.removeObjects([1]);
        expect(removable).toEqual([2]);
    });

    it('covers registry and resolver aliases and failures', () => {
        expect(createStore('place', new RecordingAdapter())).toBeInstanceOf(Store);
        expect(createStoreInstance('place', new RecordingAdapter())).toBeInstanceOf(Store);
        expect(createAdapter()).toBeInstanceOf(Adapter);
        expect(resolve<Resource>('resource', 'place', {})).toBeInstanceOf(Place);
        expect(new Resolver('resource', 'Place', {})).toBeInstanceOf(Place);
        const resolver = Object.create(Resolver.prototype) as Resolver;
        expect(resolver.lookup('resource', 'Place', {})).toBeInstanceOf(Place);
        expect(() => create('unknown-type', 'Missing')).toThrow('Unknown type');
        expect(createStoreActions('custom', { run: () => true })).toBeInstanceOf(StoreActions);
        const extended = new Store('place', new RecordingAdapter());
        expect(extended.extendActions([new StoreActions({ one: 1 }), { extend: () => undefined }])).toBe(extended);
    });

    it('covers resource state variants and all rejected operations', async () => {
        const adapter = new RecordingAdapter();
        const nested = new Place({ id: 'nested' }, adapter);
        const resource = new Resource({ id: 'resource_1', created_at: '2026-01-01', updated_at: '2026-01-02', deleted: true, time: 1, meta: { page: 1 }, nested }, adapter);
        expect(resource.meta).toEqual({ page: 1 });
        expect(resource.createdAt).toBeInstanceOf(Date);
        expect(resource.updatedAt).toBeInstanceOf(Date);
        expect(resource.isLoaded).toBe(true);
        expect(resource.isSaved).toBe(true);
        expect(resource.isDeleted).toBe(true);
        expect(resource.isAttributeFilled(['id', 'created_at'])).toBe(true);
        expect(resource.serialize().nested).toEqual({ id: 'nested' });
        resource.setAttribute({ name: 'object form' });
        resource.setAttribute('name', 'again');
        expect(resource.dirtyAttributes.name).toBeNull();
        resource.syncAttributes([]);
        expect(resource.id).toBe('resource_1');
        expect(resource.reset()).toBe(resource);
        expect(new Resource().createdAt).toBeNull();
        expect(new Resource().updatedAt).toBeNull();
        expect(new Resource().isDeleted).toBe(false);

        adapter.failure = new Error('failed');
        const failing = new Resource({ id: 'resource_1' }, adapter);
        await expect(failing.update()).rejects.toThrow('failed');
        expect(failing.isSaving).toBe(false);
        await expect(failing.reload()).rejects.toThrow('failed');
        expect(failing.isReloading).toBe(false);
        await expect(failing.destroy()).rejects.toThrow('failed');
        expect(failing.isDestroying).toBe(false);
    });

    it('covers specialized resource representations and branches', async () => {
        const adapter = new RecordingAdapter();
        const google = createGoogleAddress({ geometry: { location: { lat: 1, lng: 2 } } });
        const googlePlace = Place.fromGoogleAddress(google, adapter);
        expect(googlePlace).toBeInstanceOf(Place);
        expect(Place.fromGoogleAddress({ getAttribute: () => null, get: () => null }, adapter).coordinates).toEqual([0, 0]);
        expect(new Place({ location: { coordinates: [2, 1] } }, adapter).coordinates).toEqual([1, 2]);
        expect(new Place({}, adapter).coordinates).toEqual([0, 0]);
        expect(new Place({}, adapter).setOwner(new Contact({ id: 'contact_1' }, adapter)).getAttribute('owner')).toBe('contact_1');
        expect(new Place({}, adapter).setOwner('contact_2').getAttribute('owner')).toBe('contact_2');

        const payload = new Payload({ entities: [{ id: 'entity_1' }], dropoff: { id: 'place_2' }, pickup: { id: 'place_1' }, waypoints: [{ id: 'waypoint_1' }] }, adapter);
        payload.attach(new Entity({}, adapter));
        expect(payload.entities[0]).toBeInstanceOf(Entity);
        expect(payload.dropoff).toBeInstanceOf(Place);
        expect(payload.pickup).toBeInstanceOf(Place);
        expect(payload.waypoints[0]).toBeInstanceOf(Waypoint);
        const emptyPayload = new Payload({}, adapter);
        expect(emptyPayload.entities).toHaveLength(0);
        expect(emptyPayload.dropoff).toBeNull();
        expect(emptyPayload.pickup).toBeNull();
        expect(emptyPayload.waypoints).toHaveLength(0);
        expect(new Payload({ entities: 'invalid', waypoints: 'invalid' }, adapter).entities).toHaveLength(0);
        expect(new Payload({ entities: 'invalid', waypoints: 'invalid' }, adapter).waypoints).toHaveLength(0);
        expect(new Place({ location: { coordinates: 'invalid' } }, adapter).coordinates).toEqual([0, 0]);
        expect(new Place({}, adapter).setOwner(new Resource({ id: 1 }, adapter)).getAttribute('owner')).toBeNull();

        const organization = new Organization({}, adapter);
        await (organization.store.current as (params?: ResourceAttributes, options?: RequestOptions) => Promise<unknown>)();
        const driverStore = new Store('driver', adapter, { actions: new Driver({}, adapter).options.actions! });
        await (driverStore.login as (identity: string, password?: string | null) => Promise<unknown>)('+1 202 555 0100');
        expect(() => (driverStore.login as (identity: string, password?: string | null) => Promise<unknown>)('driver@example.com')).toThrow('requires password');
        await (driverStore.login as (identity: string, password?: string | null, attributes?: ResourceAttributes) => Promise<unknown>)('driver@example.com', 'secret', { device: 'ios' });
        await (driverStore.verifyCode as (identity: string, code: string) => Promise<unknown>)('+1', '1234');
        await (driverStore.retrieve as (id: string) => Promise<unknown>)('driver_1');
        expect(new Driver({}, adapter).coordinates).toEqual([0, 0]);

        const completed = new Order({ status: 'completed' }, adapter);
        expect(completed.isCompleted).toBe(true);
        expect(completed.isCanceled).toBe(false);
        expect(completed.isInProgress).toBe(false);
        expect(completed.status).toBe('completed');
        expect(completed.scheduledAt).toBeNull();
        const canceled = new Order({ status: 'canceled' }, adapter);
        expect(canceled.isCanceled).toBe(true);
        await canceled.setDestination('place_1');
        await canceled.captureQrCode(new Entity({ id: 'entity_1' }, adapter));
        await canceled.captureSignature();
        const quote = new ServiceQuote({}, adapter);
        await quote.fromPayload('payload_1');
        delete (quote.store as Store & Record<string, unknown>).fromPayload;
        expect(() => quote.fromPayload('payload_1')).toThrow('not available');
    });

    it('covers environment selection and browser secret protection', () => {
        const originalProcess = (globalThis as typeof globalThis & { process?: unknown }).process;
        vi.stubGlobal('process', undefined);
        vi.stubGlobal('navigator', { product: 'ReactNative' });
        expect(isNodeEnvironment()).toBe(false);
        expect(detectAdapter({ fetch: vi.fn() })).toBeInstanceOf(BrowserAdapter);
        expect(() => new Fleetbase('$secret', { adapter: new RecordingAdapter() })).toThrow('Secret key');
        vi.stubGlobal('process', originalProcess);
        vi.unstubAllGlobals();
        expect(detectAdapter({ fetch: vi.fn() })).toBeInstanceOf(NodeAdapter);
        expect(new Fleetbase('pk_test', { fetch: vi.fn() }).getAdapter()).toBeInstanceOf(NodeAdapter);
    });

    it('covers fetch body and error envelope variants', async () => {
        const responseConfig = (body: BodyInit | null, init: ResponseInit = {}) => ({ fetch: vi.fn().mockResolvedValue(new Response(body, init)) });
        await expect(requestWithFetch(responseConfig('', { status: 200 }), { path: 'x', method: 'GET' })).resolves.toBeNull();
        await expect(requestWithFetch(responseConfig(null, { status: 205 }), { path: 'x', method: 'GET' })).resolves.toBeNull();
        await expect(requestWithFetch(responseConfig(JSON.stringify({ error: 'error value' }), { status: 400 }), { path: 'x', method: 'GET' })).rejects.toThrow('error value');
        await expect(requestWithFetch(responseConfig(JSON.stringify({ message: 'message value' }), { status: 400 }), { path: 'x', method: 'GET' })).rejects.toThrow('message value');
        await expect(requestWithFetch(responseConfig(JSON.stringify({ message: 1, code: 'SPECIFIC' }), { status: 400 }), { path: 'x', method: 'GET' })).rejects.toMatchObject({
            code: 'SPECIFIC',
        });
        await expect(requestWithFetch(responseConfig('string error', { status: 400 }), { path: 'x', method: 'GET' })).rejects.toThrow('string error');
        await expect(requestWithFetch(responseConfig('', { status: 400, statusText: 'Bad Request' }), { path: 'x', method: 'GET' })).rejects.toThrow('Bad Request');
        await requestWithFetch(responseConfig('{}'), { path: 'x', method: 'POST', data: 'raw' });
        await requestWithFetch(responseConfig('{}'), { path: 'x', method: 'POST', data: new URLSearchParams({ a: '1' }) });
        await requestWithFetch(responseConfig('{}'), { path: 'x', method: 'POST', data: new FormData() });
        await requestWithFetch(responseConfig('{}'), { path: 'x', method: 'GET', options: { headers: { 'X-Test': 'yes' } } });
        const presetBrowser = new BrowserAdapter({ headers: { 'Content-Type': 'text/plain' }, fetch: vi.fn() });
        expect(new Headers(presetBrowser.headers).get('Content-Type')).toBe('text/plain');
        const presetNode = new NodeAdapter({ headers: { 'User-Agent': 'custom' }, fetch: vi.fn() });
        expect(new Headers(presetNode.headers).get('User-Agent')).toBe('custom');
    });

    it('covers UUID fallback and sparse address data', () => {
        const originalCrypto = globalThis.crypto;
        vi.stubGlobal('crypto', {});
        expect(uuid()).toMatch(/^[0-9a-f-]{36}$/i);
        vi.stubGlobal('crypto', originalCrypto);
        const empty = new GoogleAddress({});
        expect(empty.or()).toBeNull();
        expect(empty.all()).toMatchObject({ coordinates: [0, 0] });
        expect(get({ value: null }, 'value.next')).toBeNull();
        expect(get({ value: 1 }, 'value.next')).toBeNull();
        expect(get({ value: () => ({ next: 1 }) }, 'value.next')).toBe(1);
        expect(get(new Place({ name: 'x' }), 'name')).toBe('x');
        expect(set({}, '', 1)).toBe(1);
        expect(set({ value: 0 }, 'value.next', 1)).toBe(1);
        expect(normify('war_and_peace')).toBe('War and Peace');
    });
});
