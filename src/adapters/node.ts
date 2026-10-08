import BrowserAdapter from './browser.js';
import type { AdapterConfig } from '../types.js';

/**
 * The Fetch transport for Node.js. It is the browser transport plus a User-Agent, so
 * every verb, the current host and namespace, and headers set later with `setHeaders`
 * work the same way in both.
 */
export default class NodeAdapter extends BrowserAdapter {
    constructor(config: AdapterConfig = {}) {
        const headers = new Headers(config.headers);
        if (!headers.has('User-Agent')) {
            headers.set('User-Agent', '@fleetbase/sdk;node');
        }
        super({ ...config, headers });
    }
}
