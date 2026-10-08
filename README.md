<p align="center">
  <img src="https://flb-assets.s3.ap-southeast-1.amazonaws.com/static/fleetbase-logo-svg.svg" width="380" height="100" alt="Fleetbase" />
</p>

<p align="center">
  The official JavaScript and TypeScript SDK for the Fleetbase API.
</p>

<p align="center">
  <a href="https://github.com/fleetbase/fleetbase-js/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/fleetbase/fleetbase-js/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="https://codecov.io/gh/fleetbase/fleetbase-js"><img src="https://codecov.io/gh/fleetbase/fleetbase-js/branch/main/graph/badge.svg" alt="Coverage" /></a>
  <a href="https://www.npmjs.com/package/@fleetbase/sdk"><img src="https://img.shields.io/npm/v/@fleetbase/sdk?label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@fleetbase/sdk"><img src="https://img.shields.io/npm/dw/@fleetbase/sdk" alt="Weekly downloads" /></a>
  <a href="https://github.com/fleetbase/fleetbase-js/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/fleetbase/fleetbase-js" alt="License" /></a>
</p>

Fleetbase SDK provides typed resources, stores, API actions, browser and Node.js transports, and extension points for custom adapters. Version 2 keeps the established v1 consumer API while providing correct ESM, CommonJS, TypeScript, and browser builds.

## Installation

```sh
# npm
npm install @fleetbase/sdk

# pnpm
pnpm add @fleetbase/sdk

# Yarn
yarn add @fleetbase/sdk

# Bun
bun add @fleetbase/sdk
```

The SDK supports Node.js 20.19.4 and newer at runtime, including legacy Node 20 consumers. Use Node 22/24 for maintained deployments; building this repository requires Node 22.13 or newer. Its browser transport uses the standard Fetch API, so it works without framework-specific dependencies in modern browser applications and bundlers.

## Quick start

```ts
import Fleetbase from '@fleetbase/sdk';

const fleetbase = new Fleetbase('your_public_key');

const place = await fleetbase.places.create({
    name: 'Space Needle',
    street1: '400 Broad Street',
    city: 'Seattle',
    state: 'WA',
    country: 'US',
});

console.log(place.id);
```

The same root API is available to CommonJS consumers:

```js
const { default: Fleetbase } = require('@fleetbase/sdk');

const fleetbase = new Fleetbase('your_server_key');
```

Never expose a Fleetbase secret key in browser code. Browser applications must use a public key. Keep server credentials in environment variables or a secret manager.

## Resources and stores

The client exposes stores for frequently used API resources:

```ts
const order = await fleetbase.orders.findRecord('order_123');
const places = await fleetbase.places.query({ city: 'Seattle' });
const driver = await fleetbase.drivers.findRecord('driver_123');
const quotes = await fleetbase.serviceQuotes.fromPreliminary({
    pickup: 'place_pickup',
    dropoff: 'place_dropoff',
});
```

Driver-app stores cover the FleetOps driver workflow — `manifests`, `manifestStops`, `trailers`, `fuelReports`, `issues`, and `workOrders` — alongside the driver-scoped helpers on existing stores:

```ts
const manifests = await fleetbase.drivers.manifests('driver_123', { status: 'active' });
const manifest = await fleetbase.manifests.optimize('manifest_123', { latitude: 1.29, longitude: 103.85 });
await fleetbase.manifestStops.update('manifest_stop_123', { status: 'arrived' }); // PATCH
await fleetbase.trailers.attach('trailer_123', { vehicle: 'vehicle_123' });
const trailers = await fleetbase.vehicles.trailers('vehicle_123');
await fleetbase.drivers.changePassword('driver_123', { password: 'current', new_password: 'next', new_password_confirmation: 'next' });
```

Inspection stores and vehicle inspection actions are deferred until a released Fleet-Ops driver inspection API can be verified. Trailer attach returns a raw connection; detach and work-order send return acknowledgements without replacing the resource's attributes.

Resource instances can also be created directly:

```ts
import { Place, Point } from '@fleetbase/sdk';

const place = new Place({
    name: 'Warehouse',
    location: new Point(47.6062, -122.3321),
});
```

The root package exports the existing resource classes, adapters, collection helpers, resolver and registry hooks, string helpers, validation utilities, and TypeScript request/configuration types.

## Realtime socket tokens

Fleetbase publishes realtime events over SocketCluster. Channel subscriptions are authorized with a short-lived socket token, so the flow is always:

1. **On your server**, use your secret key to mint a token with `fleetbase.socket.token()` (`POST /v1/socket/token`).
2. Send **only the token** to the browser or device. Never send the API key.
3. In the browser, connect with `socketcluster-client`, present the token (`socket.authenticate(token)` or an in-memory `authEngine`), then subscribe.

```ts
// server.ts: runs on your backend, never in the browser
import Fleetbase from '@fleetbase/sdk';

const fleetbase = new Fleetbase(process.env.FLEETBASE_SECRET_KEY!);

app.post('/realtime-token', requireSignedInUser, async (_req, res) => {
    // { token, expires_in, expires_at }
    res.json(await fleetbase.socket.token());
});
```

```ts
// browser.ts
import { create } from 'socketcluster-client';

async function fetchSocketToken(): Promise<{ token: string; expires_in: number }> {
    const response = await fetch('/realtime-token', { method: 'POST', credentials: 'include' });
    if (!response.ok) throw new Error(`Token request failed: ${response.status}`);
    return response.json();
}

// Keep the token in memory only. SocketCluster calls loadToken() before every (re)connect,
// so the token travels in the handshake and subscriptions are authorized from the start.
let current: { token: string; refreshAt: number } | null = null;
const remember = ({ token, expires_in }: { token: string; expires_in: number }) => {
    current = { token, refreshAt: Date.now() + (expires_in - 60) * 1000 };
    return token;
};
const authEngine = {
    saveToken: async (_name: string, token: string) => token,
    removeToken: async () => {
        const token = current?.token ?? null;
        current = null;
        return token;
    },
    loadToken: async () => (current && Date.now() < current.refreshAt ? current.token : remember(await fetchSocketToken())),
};

const socket = create({ hostname: 'socket.example.com', secure: true, port: 443, authEngine });

// Refresh about 60 seconds before expiry without dropping subscriptions.
setInterval(async () => {
    if (current && Date.now() >= current.refreshAt) {
        await socket.authenticate(remember(await fetchSocketToken()));
    }
}, 15_000);

const channel = socket.subscribe(`company.${companyUuid}`);
for await (const event of channel) {
    console.log(event);
}
```

A token minted with an API key may subscribe to its company channel (`company.{company uuid}`), its own key channel (`api.{key id}`), and channels of resources that belong to the same company (for example `order.{order uuid or public id}`). A server that does not have realtime authentication configured answers the mint request with `404`; in that case connect without a token as before.

## Custom adapters

Implement the stable adapter interface when requests need to use an application-specific transport:

```ts
import { Adapter } from '@fleetbase/sdk';

class CustomAdapter extends Adapter {
    get(path, query, options) {
        return customRequest('GET', path, { query, ...options });
    }

    post(path, data, options) {
        return customRequest('POST', path, { data, ...options });
    }

    put(path, data, options) {
        return customRequest('PUT', path, { data, ...options });
    }

    patch(path, data, options) {
        return customRequest('PATCH', path, { data, ...options });
    }

    delete(path, options) {
        return customRequest('DELETE', path, options);
    }
}

const fleetbase = new Fleetbase('your_key', {
    adapter: new CustomAdapter(),
});
```

Calling `fleetbase.setAdapter(adapter)` updates the client and all existing stores.

## Errors

Transport failures reject with `FleetbaseError`, which remains a normal JavaScript `Error` and adds safe structured details when available:

```ts
import { FleetbaseError } from '@fleetbase/sdk';

try {
    await fleetbase.orders.findRecord('missing');
} catch (error) {
    if (error instanceof FleetbaseError) {
        console.error(error.status, error.code, error.requestId);
    }
}
```

## Package formats

The npm package contains:

- native ESM with declarations and source maps;
- true CommonJS (`.cjs`) with CommonJS declarations;
- a minified browser bundle at `dist/fleetbase.min.js`;
- no runtime dependencies.

Every release candidate is checked with Publint, Are The Types Wrong, packed-tarball content and size assertions, ESM/CommonJS export parity, strict TypeScript, cross-platform smoke tests, and 100% statement, branch, function, and line coverage.

Production-build fixtures verify the exact candidate tarball with Vite, webpack, esbuild, React, Vue, Svelte, Angular, Ember, Next.js (client and server), Nuxt (client and server), Expo web/React Native Android, and an edge-runtime VM. Chromium, Firefox, and WebKit gates also execute SDK construction, Fetch transport, resource serialization, authorization headers, and browser-only key validation. See the [compatibility policy](./docs/compatibility.md) for the release-blocking matrix.

## Development

```sh
pnpm install --frozen-lockfile
pnpm run verify
```

Pull-request tests are deterministic and do not need Fleetbase credentials. API behavior is cross-checked against the official [Postman collections](https://github.com/fleetbase/postman), [Core API](https://github.com/fleetbase/core-api), and [Fleet-Ops](https://github.com/fleetbase/fleetops) sources.

Maintainers can also run the secret-gated `Live API integration` workflow. It installs the exact packed SDK candidate and performs a read-only current-organization request using the `FLEETBASE_PUBLIC_KEY` repository secret; scheduled runs skip cleanly until that secret is configured, while manually dispatched runs fail clearly when it is absent.

See the [release guide](https://github.com/fleetbase/fleetbase-js/blob/main/docs/releasing.md) for publishing and the [contribution guide](https://github.com/fleetbase/fleetbase-js/blob/main/CONTRIBUTING.md) for the development workflow.

## License

[AGPL-3.0-or-later](./LICENSE.md)
