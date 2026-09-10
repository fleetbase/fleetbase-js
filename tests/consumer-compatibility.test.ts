import { BrowserAdapter, Driver, Point, Store } from '../src/index.js';
import type { RequestOptions } from '../src/index.js';

describe('first-party consumer contracts', () => {
    it('routes every verb through the legacy request envelope without losing JSON data', async () => {
        class ConsumerAdapter extends BrowserAdapter {
            calls: unknown[][] = [];
            override request(path: string, method = 'GET', data: { body?: string } = {}, options: RequestOptions = {}): Promise<unknown> {
                this.calls.push([path, method, data, options]);
                return Promise.resolve(data.body ? (JSON.parse(data.body) as unknown) : null);
            }
        }
        const adapter = new ConsumerAdapter();
        const payload = { body: 'hello', type: 'text', nested: { enabled: true } };
        for (const method of ['post', 'put', 'patch'] as const) {
            await expect(adapter[method]('messages', payload)).resolves.toEqual(payload);
        }
        await adapter.get('orders?active=true', { page: 2, ids: [1, 2] });
        await adapter.get('orders', { page: 3 }, { url: 'https://other.test/orders?active=true' });
        await adapter.delete('orders/1', { cache: 'reload' });
        await adapter.delete('orders/2', {}, { cache: 'no-store' });
        expect(adapter.calls).toEqual([
            ...['POST', 'PUT', 'PATCH'].map((method) => ['messages', method, { body: JSON.stringify(payload) }, {}]),
            ['orders?active=true&page=2&ids=1&ids=2', 'GET', {}, {}],
            ['orders?page=3', 'GET', {}, { url: 'https://other.test/orders?active=true&page=3' }],
            ['orders/1', 'DELETE', {}, { cache: 'reload' }],
            ['orders/2', 'DELETE', {}, { cache: 'no-store' }],
        ]);
        await adapter.request('orders');
    });

    it('keeps headers spreadable and lets a subclass replace credentials for GET and mutations', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(Response.json({ ok: true })));
        class ConsumerAdapter extends BrowserAdapter {
            token = 'driver';
            override request(path: string, method = 'GET', data: { body?: string } = {}, options: RequestOptions = {}): Promise<unknown> {
                return super.request(path, method, data, { ...options, headers: { ...this.headers, Authorization: `Bearer ${this.token}` } });
            }
        }
        const adapter = new ConsumerAdapter({ host: 'https://api.test', publicKey: 'platform', fetch: fetchMock });
        adapter.setHeaders(new Headers({ 'accept-language': 'mn' })).setHeaders();
        expect(adapter.headers).toEqual({ Authorization: 'Bearer platform', 'Content-Type': 'application/json', 'Accept-Language': 'mn' });
        await adapter.get('orders');
        await adapter.post('messages', { body: 'hello', type: 'text' });
        for (const [, init] of fetchMock.mock.calls) {
            expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer driver');
            expect(new Headers(init?.headers).get('Accept-Language')).toBe('mn');
        }
        expect(fetchMock.mock.calls[1]?.[1]?.body).toBe('{"body":"hello","type":"text"}');
        adapter.token = 'replacement';
        fetchMock.mockResolvedValueOnce(Response.json({ error: 'Unauthorized' }, { status: 401 }));
        await expect(adapter.get('orders')).rejects.toMatchObject({ status: 401 });
        expect(new Headers(fetchMock.mock.calls[2]?.[1]?.headers).get('Authorization')).toBe('Bearer replacement');
        await adapter.request('orders');
    });

    it('uses the current public configuration and supports direct request envelopes', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(Response.json({ ok: true })));
        const adapter = new BrowserAdapter({ fetch: fetchMock });
        adapter.host = 'https://api.test';
        adapter.namespace = 'v2';
        adapter.headers['Customer-Token'] = 'customer';
        await adapter.request('orders');
        expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.test/v2/orders');
        expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Customer-Token')).toBe('customer');
        await adapter.request('upload', 'POST', { body: new URLSearchParams({ value: 'x' }), cache: 'reload' });
        expect(fetchMock.mock.calls[1]?.[1]?.body).toBeInstanceOf(URLSearchParams);
        expect(fetchMock.mock.calls[1]?.[1]?.cache).toBe('reload');
        await adapter.get('orders', { page: 1 }, { url: 'https://override.test/orders' });
        expect(fetchMock.mock.calls[2]?.[0]).toBe('https://override.test/orders?page=1');
    });

    it('reads plain API GeoJSON for fetched and restored drivers without changing coordinate order', async () => {
        const adapter = new BrowserAdapter({ fetch: vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: 'driver_1', location: { type: 'Point', coordinates: [106.9, 47.9] } })) });
        const driver = await new Store<Driver>('driver', adapter).findRecord('driver_1');
        expect(driver.latitude).toBe(47.9);
        expect(driver.longitude).toBe(106.9);
        expect(driver.coordinates).toEqual([47.9, 106.9]);
        expect(new Driver(JSON.parse(JSON.stringify(driver.serialize())) as Record<string, unknown>).coordinates).toEqual(driver.coordinates);
        expect(new Driver({ location: new Point(47.9, 106.9) }).coordinates).toEqual(driver.coordinates);
        for (const location of [null, 'invalid', {}, { coordinates: 'invalid' }, { coordinates: [] }, { coordinates: [181, 10] }, { coordinates: [10, 91] }]) {
            expect(new Driver({ location }).coordinates).toEqual([0, 0]);
        }
    });
});
