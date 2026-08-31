<p align="center">
  <img src="https://flb-assets.s3.ap-southeast-1.amazonaws.com/static/fleetbase-logo-svg.svg" width="380" height="100" alt="Fleetbase" />
</p>

<p align="center">
  The official JavaScript and TypeScript SDK for the Fleetbase API.
</p>

<p align="center">
  <a href="https://github.com/fleetbase/fleetbase-js/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/fleetbase/fleetbase-js/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="https://github.com/fleetbase/fleetbase-js/actions/workflows/codeql.yml?query=branch%3Amain"><img src="https://github.com/fleetbase/fleetbase-js/actions/workflows/codeql.yml/badge.svg?branch=main" alt="CodeQL" /></a>
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

The SDK supports Node.js 22.13 and newer. Its browser transport uses the standard Fetch API, so it works without framework-specific dependencies in modern browser applications and bundlers.

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

Resource instances can also be created directly:

```ts
import { Place, Point } from '@fleetbase/sdk';

const place = new Place({
    name: 'Warehouse',
    location: new Point(47.6062, -122.3321),
});
```

The root package exports the existing resource classes, adapters, collection helpers, resolver and registry hooks, string helpers, validation utilities, and TypeScript request/configuration types.

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

## Development

```sh
pnpm install --frozen-lockfile
pnpm run verify
```

Pull-request tests are deterministic and do not need Fleetbase credentials. API behavior is cross-checked against the official [Postman collections](https://github.com/fleetbase/postman), [Core API](https://github.com/fleetbase/core-api), and [Fleet-Ops](https://github.com/fleetbase/fleetops) sources.

See the [modernization plan](https://github.com/fleetbase/fleetbase-js/blob/main/MODERNIZATION_PLAN.md) for the v2 compatibility and release program and the [contribution guide](https://github.com/fleetbase/fleetbase-js/blob/main/CONTRIBUTING.md) for the development workflow.

## License

[AGPL-3.0-or-later](./LICENSE.md)
