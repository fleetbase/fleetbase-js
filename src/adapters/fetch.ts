import { FleetbaseError } from '../errors.js';
import type { AdapterConfig, RequestOptions, ResourceAttributes } from '../types.js';

export interface FetchRequest {
    path: string;
    method: string;
    data?: unknown;
    query?: ResourceAttributes;
    options?: RequestOptions;
}

export function buildUrl(config: AdapterConfig, path: string, override?: string): string {
    if (override) {
        return override;
    }

    const host = (config.host ?? '').replace(/\/$/, '');
    const namespace = (config.namespace ?? '').replace(/^\/+|\/+$/g, '');
    const cleanPath = path.replace(/^\//, '');
    return [host, namespace, cleanPath].filter(Boolean).join('/');
}

/**
 * Append query values the way PHP and Laravel read them, as SDK v1 did on native
 * (axios): a list is `key[]=a&key[]=b`, a nested object `key[field]=value`, a list of
 * objects `key[0][field]=value`. Repeating a plain key (`key=a&key=b`) would leave the
 * server with only the last value.
 */
export function appendQuery(url: string, query: ResourceAttributes = {}): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        appendValue(params, key, value);
    }

    const serialized = params.toString();
    if (!serialized) {
        return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}${serialized}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function appendValue(params: URLSearchParams, key: string, value: unknown): void {
    if (value === null || value === undefined) {
        return;
    }
    if (value instanceof Date) {
        params.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
        value.forEach((item, index) => appendValue(params, isPlainObject(item) || Array.isArray(item) ? `${key}[${index}]` : `${key}[]`, item));
    } else if (isPlainObject(value)) {
        for (const [field, nested] of Object.entries(value)) {
            appendValue(params, `${key}[${field}]`, nested);
        }
    } else {
        params.append(key, String(value));
    }
}

function errorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === 'object') {
        const body = payload as Record<string, unknown>;
        if (Array.isArray(body.errors) && typeof body.errors[0] === 'string') {
            return body.errors[0];
        }
        if (typeof body.error === 'string') {
            return body.error;
        }
        if (typeof body.message === 'string') {
            return body.message;
        }
    }
    return typeof payload === 'string' && payload ? payload : fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
        return null;
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function requestWithFetch(config: AdapterConfig, request: FetchRequest): Promise<unknown> {
    const fetchImplementation = config.fetch ?? globalThis.fetch;
    if (typeof fetchImplementation !== 'function') {
        throw new FleetbaseError('No Fetch API implementation is available in this environment.', { code: 'FETCH_UNAVAILABLE' });
    }

    const options = request.options ?? {};
    const baseUrl = buildUrl(config, request.path, options.url);
    const url = appendQuery(baseUrl, request.query);
    const headers = new Headers(config.headers);
    new Headers(options.headers).forEach((value, key) => headers.set(key, value));

    const init: RequestInit = { ...options, method: request.method, headers };
    if (request.data !== undefined && request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = typeof request.data === 'string' || request.data instanceof FormData || request.data instanceof URLSearchParams ? request.data : JSON.stringify(request.data);
    }
    delete (init as RequestInit & { url?: string }).url;

    let response: Response;
    try {
        response = await fetchImplementation(url, init);
    } catch (cause) {
        throw new FleetbaseError('Unable to reach the Fleetbase API.', { code: 'NETWORK_ERROR', cause });
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
        const requestId = response.headers.get('x-request-id') ?? undefined;
        const body = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : undefined;
        throw new FleetbaseError(errorMessage(payload, response.statusText || `HTTP ${response.status}`), {
            status: response.status,
            code: typeof body?.code === 'string' ? body.code : 'HTTP_ERROR',
            response: payload,
            ...(requestId ? { requestId } : {}),
        });
    }

    return payload;
}
