<p align="center">
  <img src="https://flb-assets.s3.ap-southeast-1.amazonaws.com/static/fleetbase-logo-svg.svg" width="380" height="100" />
</p>
<p align="center">
Fast, powerful, and easy to use JavaScript SDK for building on-demand and last-mile apps using Fleetbase API.
Build custom real-time on-demand experiences, and easily manage the flow from start to finish.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@fleetbase/sdk">
    <img src="https://img.shields.io/npm/v/@fleetbase/sdk" alt="Version" />
  </a>
  <a href="https://www.npmjs.com/package/@fleetbase/sdk">
    <img src="https://img.shields.io/npm/dw/@fleetbase/sdk" alt="Downloads/week" />
  </a>
  <a href="https://bundlephobia.com/package/@fleetbase/sdk@1.0.0">
    <img src="https://img.shields.io/bundlephobia/min/@fleetbase/sdk" alt="Bundle Size" />
  </a>
  <a href="https://github.com/fleetbase/fleetbase-js/blob/master/LICENSE.md">
    <img src="https://img.shields.io/github/license/fleetbase/fleetbase-js" alt="License" />
  </a>
  <br>
  <a href="https://fleetbase.io">fleetbase.io</a> | <a href="https://twitter.com/fleetbase_io">@fleetbase_io</a> | <a href="https://discord.gg/Q78hkXNK">Discord</a>
</p>

## Installation

### With NPM

`npm install @fleetbase/sdk`

### With Yarn

`yarn add @fleetbase/sdk`

## Documentation

See the [documentation webpage](https://fleetbase.io/docs).

If you would like to make contributions to the Fleetbase Javascript SDK documentation source, here is a [guide](https://github.com/fleetbase/fleetbase-js/blob/master/CONTRIBUTING.md) in doing so.

## Quick Start for Browser

```js
import Fleetbase from '@fleetbase/sdk';

const fleetbase = new Fleetbase('Your Public Key');

// create a place
const speceNeedle = await fleetbase.places.create({
    name: 'Space Needle',
    street1: '400 Broad Street',
    city: 'Seattle',
    state: 'WA',
    country: 'US',
});
```

## Quick Start for Node

```js
import Fleetbase from '@fleetbase/sdk';

const fleetbase = new Fleetbase('Your Secret Key');

// create a place
const speceNeedle = await fleetbase.places.create({
    name: 'Space Needle',
    street1: '400 Broad Street',
    city: 'Seattle',
    state: 'WA',
    country: 'US',
});
```

## Create a custom adapter

You're able to create a custom adapter to handle network request in the Fleetbase SDK.
The Fleetbase SDK ships with two standard adapters. The BrowserAdapter which is based on `fetch()` and
the NodeAdapter based on axios.

```js
import { Adapter } from '@fleetbase/sdk';

class CustomAdapter extends Adapter {
    constructor(config) {
        super(config);
    }

    get() {}
    post() {}
    put() {}
    patch() {}
    delete() {}
}
```
