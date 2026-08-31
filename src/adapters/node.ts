import BrowserAdapter from './browser.js';
import { requestWithFetch } from './fetch.js';
import type { AdapterConfig, RequestOptions } from '../types.js';

export default class NodeAdapter extends BrowserAdapter {
    constructor(config: AdapterConfig = {}) {
        const headers = new Headers(config.headers);
        if (!headers.has('User-Agent')) {
            headers.set('User-Agent', '@fleetbase/sdk;node');
        }
        super({ ...config, headers });
    }

    override request(method: string, url: string, options: RequestOptions & { data?: unknown } = {}): Promise<unknown> {
        const { data, ...requestOptions } = options;
        return requestWithFetch(this.fetchConfig, { path: url, method, data, options: requestOptions });
    }

    override post(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request('POST', path, { ...options, data });
    }

    override put(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request('PUT', path, { ...options, data });
    }

    override patch(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request('PATCH', path, { ...options, data });
    }

    override delete(path: string, options: RequestOptions = {}, legacyOptions?: RequestOptions): Promise<unknown> {
        return this.request('DELETE', path, legacyOptions ?? options);
    }
}
