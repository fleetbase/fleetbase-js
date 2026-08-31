import Adapter from '../adapter.js';
import { requestWithFetch } from './fetch.js';
import type { AdapterConfig, RequestOptions, ResourceAttributes } from '../types.js';

export default class BrowserAdapter extends Adapter {
    protected readonly fetchConfig: AdapterConfig;

    constructor(config: AdapterConfig = {}) {
        const headers = new Headers(config.headers);
        if (config.publicKey) {
            headers.set('Authorization', `Bearer ${config.publicKey}`);
        }
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const normalized = { ...config, headers };
        super(normalized);
        this.fetchConfig = normalized;
    }

    setHeaders(headers: HeadersInit = {}): this {
        const merged = new Headers(this.fetchConfig.headers);
        new Headers(headers).forEach((value, key) => merged.set(key, value));
        this.fetchConfig.headers = merged;
        this.headers = merged;
        return this;
    }

    async parseJSON(response: Response): Promise<{ statusText: string; status: number; ok: boolean; json: unknown }> {
        try {
            return {
                statusText: response.statusText,
                status: response.status,
                ok: response.ok,
                json: await response.json(),
            };
        } catch (cause) {
            throw new Error('Oops! Something went wrong when handling your request.', { cause });
        }
    }

    request(path: string, method = 'GET', data: unknown = undefined, options: RequestOptions = {}): Promise<unknown> {
        if (data && typeof data === 'object' && 'body' in data) {
            const { body, ...requestOptions } = data as { body?: unknown } & RequestOptions;
            return requestWithFetch(this.fetchConfig, { path, method, data: body, options: { ...requestOptions, ...options } });
        }
        return requestWithFetch(this.fetchConfig, { path, method, data, options });
    }

    override get(path: string, query: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return requestWithFetch(this.fetchConfig, { path, method: 'GET', query, options });
    }

    override post(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'POST', data, options);
    }

    override put(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'PUT', data, options);
    }

    override patch(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'PATCH', data, options);
    }

    override delete(path: string, options: RequestOptions = {}, legacyOptions?: RequestOptions): Promise<unknown> {
        return this.request(path, 'DELETE', undefined, legacyOptions ?? options);
    }
}
