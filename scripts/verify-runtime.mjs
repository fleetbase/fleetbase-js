import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(resolve('package.json'));
const cjs = require('@fleetbase/sdk');
const esm = await import(pathToFileURL(resolve('node_modules/@fleetbase/sdk/dist/index.js')).href);
for (const sdk of [esm, cjs]) {
    let request;
    const adapter = new sdk.BrowserAdapter({
        host: 'https://api.test',
        publicKey: 'fixture',
        fetch: async (url, init) => {
            request = { url, ...init };
            return Response.json({ id: 'driver_1', location: { type: 'Point', coordinates: [106.9, 47.9] } });
        },
    });
    adapter.setHeaders({ 'Accept-Language': 'mn' });
    await adapter.post('messages', { body: 'hello', type: 'text' });
    assert.equal(request.body, '{"body":"hello","type":"text"}');
    assert.equal(new Headers(request.headers).get('Accept-Language'), 'mn');
    const driver = await new sdk.default('fixture', { adapter }).drivers.findRecord('driver_1');
    assert.deepEqual(driver.coordinates, [47.9, 106.9]);
    assert.equal(typeof sdk.default, 'function');
}
console.log(`Packed ESM/CJS runtime contracts passed on ${process.version}.`);
