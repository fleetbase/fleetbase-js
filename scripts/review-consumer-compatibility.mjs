import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
if (!process.argv[2] || !process.argv[3]) {
    throw new Error('Usage: node scripts/review-consumer-compatibility.mjs <SDK entry file> <navigator-app checkout>');
}
const nav = resolve(process.argv[3]);
const req = createRequire(nav + '/package.json');
const ts = req('typescript');
const SDK = await import(pathToFileURL(resolve(process.argv[2])).href);
const rows = [];
async function check(name, fn) {
    try {
        await fn();
        rows.push({ name, result: 'PASS' });
    } catch (e) {
        rows.push({ name, result: 'FAIL', detail: e.message });
    }
}
const modules = new Map();
const storage = new Map();
function load(name) {
    if (name === '@fleetbase/sdk') return SDK;
    if (name === './storage') return { readJSON: (k, fallback) => storage.get(k) ?? fallback, writeJSON: (k, v) => storage.set(k, structuredClone(v)) };
    if (modules.has(name)) return modules.get(name).exports;
    const filename = nav + '/src/v3/api/' + name.replace('./', '') + '.ts';
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const module = { exports: {} };
    modules.set(name, module);
    vm.runInThisContext('(function(require,module,exports){' + source + '\n})', { filename })(load, module, module.exports);
    return module.exports;
}
const { NavigatorAdapter } = load('./NavigatorAdapter');
const { MutationQueue } = load('./queue');
let calls = [];
let response = { id: 'place_1' };
globalThis.fetch = async (url, init) => {
    calls.push({ url, ...init });
    return Response.json(response);
};
function fresh() {
    storage.clear();
    calls = [];
    return new NavigatorAdapter({ host: 'https://api.test', platformToken: 'platform', queue: new MutationQueue() });
}
await check('Navigator: switched user token reaches GET', async () => {
    const a = fresh();
    a.setUserToken('driver-token');
    await a.get('orders', { limit: 30 });
    assert.equal(new Headers(calls.at(-1).headers).get('Authorization'), 'Bearer driver-token');
});
await check('Navigator: POST body survives actual request override', async () => {
    const a = fresh();
    await a.post('drivers/login', { identity: 'driver@example.test', password: 'fixture' });
    assert.equal(calls.at(-1).body, JSON.stringify({ identity: 'driver@example.test', password: 'fixture' }));
});
await check('Navigator: configured headers survive subclass spreading', async () => {
    const a = fresh();
    a.setHeaders({ 'Accept-Language': 'mn' });
    await a.post('issues', { title: 'flat tire' });
    assert.equal(new Headers(calls.at(-1).headers).get('Accept-Language'), 'mn');
});
await check('Navigator: offline queue preserves mutation body', async () => {
    const a = fresh();
    const online = globalThis.fetch;
    globalThis.fetch = async () => {
        throw new TypeError('offline');
    };
    try {
        await a.post('fuel-reports', { volume: 10 });
    } finally {
        globalThis.fetch = online;
    }
    const queued = [...storage.values()].flat().find((x) => x.path === 'fuel-reports');
    assert.deepEqual(queued?.body, { volume: 10 });
});
await check('Navigator: GET 401 reaches onUnauthorized', async () => {
    let count = 0;
    const online = globalThis.fetch;
    const a = new NavigatorAdapter({ host: 'https://api.test', queue: new MutationQueue(), onUnauthorized: () => count++ });
    globalThis.fetch = async () => Response.json({ error: 'Unauthenticated' }, { status: 401 });
    try {
        await a.get('orders').catch(() => {});
    } finally {
        globalThis.fetch = online;
    }
    assert.equal(count, 1);
});
await check('BrowserAdapter: ordinary JSON payload with body field stays intact', async () => {
    const a = new SDK.BrowserAdapter({ host: 'https://api.test', namespace: 'v1' });
    await a.post('chat-channels/chat_1/send-message', { body: 'hello', type: 'text' });
    assert.equal(calls.at(-1).body, JSON.stringify({ body: 'hello', type: 'text' }));
});
await check('Both apps: Driver reads API GeoJSON location', () => {
    assert.deepEqual(new SDK.Driver({ id: 'driver_1', location: { type: 'Point', coordinates: [106.9, 47.9] } }).coordinates, [47.9, 106.9]);
});
await check('Storefront: auth/language headers and saved Place CRUD', async () => {
    const a = new SDK.BrowserAdapter({ host: 'https://api.test', namespace: 'v1', publicKey: 'pk_test' });
    const sdk = new SDK.default('pk_test', { adapter: a });
    sdk.setAdapter(a.setHeaders({ 'Customer-Token': 'customer', 'Accept-Language': 'mn' }));
    response = { id: 'place_1', name: 'Home', location: { type: 'Point', coordinates: [106.9, 47.9] } };
    const p = await sdk.places.create({ name: 'Home', owner: 'customer_1', location: new SDK.Point(47.9, 106.9) });
    assert.equal(new Headers(calls.at(-1).headers).get('Customer-Token'), 'customer');
    assert.equal(new Headers(calls.at(-1).headers).get('Accept-Language'), 'mn');
    assert.deepEqual(p.coordinates, [47.9, 106.9]);
    const restored = new SDK.Place(p.serialize(), a);
    await restored.update({ name: 'Office' });
    assert.equal(calls.at(-1).method, 'PUT');
    assert.ok(calls.at(-1).url.endsWith('/places/place_1'));
});
await check('Storefront: Collection cache restoration helpers', () => {
    const c = new SDK.Collection([{ id: 'a' }, { id: 'b' }]);
    assert.equal(c.objectAt(1).id, 'b');
    assert.equal(c.findBy('id', 'a').id, 'a');
});
if (SDK.Trailer) {
    await check('PR35: attach preserves Trailer identity', async () => {
        const adapter = { post: async () => ({ id: 'asset_connection_1', vehicle: { id: 'vehicle_1' }, trailer: { id: 'trailer_1' } }) };
        const trailer = new SDK.Trailer({ id: 'trailer_1', name: 'Trailer' }, adapter);
        await trailer.attach({ vehicle: 'vehicle_1' });
        assert.equal(trailer.id, 'trailer_1');
    });
    await check('PR35: detach preserves Trailer identity', async () => {
        const trailer = new SDK.Trailer({ id: 'trailer_1' }, { post: async () => ({ status: 'ok', connection: null }) });
        await trailer.detach();
        assert.equal(trailer.id, 'trailer_1');
    });
    await check('PR35: send preserves WorkOrder identity/status', async () => {
        const order = new SDK.WorkOrder({ id: 'work_order_1', status: 'open' }, { post: async () => ({ status: 'ok', message: 'Sent' }) });
        await order.send();
        assert.equal(order.id, 'work_order_1');
        assert.equal(order.getAttribute('status'), 'open');
    });
}
console.log(JSON.stringify({ sdk: process.argv[2], results: rows }, null, 2));

process.exitCode = rows.some((row) => row.result === 'FAIL') ? 1 : 0;
