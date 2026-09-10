import Adapter from '../adapter.js';
import { appendQuery, requestWithFetch } from './fetch.js';
import type { AdapterConfig, RequestOptions, ResourceAttributes } from '../types.js';

export default class BrowserAdapter extends Adapter {
    declare host: string;
    declare headers: Record<string, string>;
    protected readonly fetchConfig: AdapterConfig;

    constructor(config: AdapterConfig = {}) {
        const headers = new Headers(config.headers);
        if (config.publicKey) {
            headers.set('Authorization', `Bearer ${config.publicKey}`);
        }
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        const normalized = { ...config, host: config.host ?? '', headers: headerRecord(headers) };
        super(normalized);
        this.fetchConfig = normalized;
    }

    setHeaders(headers: HeadersInit = {}): this {
        const merged = new Headers(this.headers);
        new Headers(headers).forEach((value, key) => merged.set(key, value));
        this.headers = headerRecord(merged);
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

    /** Legacy interception point: data is a fetch envelope, not an API payload. */
    request(path: string, method = 'GET', data: RequestOptions & { body?: unknown } = {}, options: RequestOptions = {}): Promise<unknown> {
        const { body, ...requestOptions } = data;
        return requestWithFetch(
            { ...this.fetchConfig, host: this.host, namespace: this.namespace ?? '', headers: this.headers },
            { path, method, data: body, options: { ...requestOptions, ...options } }
        );
    }

    override get(path: string, query: ResourceAttributes = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(appendQuery(path, query), 'GET', {}, options.url ? { ...options, url: appendQuery(options.url, query) } : options);
    }

    override post(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'POST', { body: JSON.stringify(data) }, options);
    }

    override put(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'PUT', { body: JSON.stringify(data) }, options);
    }

    override patch(path: string, data: unknown = {}, options: RequestOptions = {}): Promise<unknown> {
        return this.request(path, 'PATCH', { body: JSON.stringify(data) }, options);
    }

    override delete(path: string, options: RequestOptions = {}, legacyOptions?: RequestOptions): Promise<unknown> {
        return this.request(path, 'DELETE', {}, legacyOptions ?? options);
    }
}

function headerRecord(headers: Headers): Record<string, string> {
    // Keep a spreadable bag and canonical casing so a subclass's Authorization
    // override replaces the configured credential instead of appending a second one.
    return Object.fromEntries(Array.from(headers, ([key, value]) => [key.replace(/(^|-)[a-z]/g, (part) => part.toUpperCase()), value]));
}
