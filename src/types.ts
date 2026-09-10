export type ResourceAttributes = Record<string, unknown>;
export type Identifier = string | number;

export type Constructor<T, Args extends unknown[] = never[]> = new (...args: Args) => T;

export interface RequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
    headers?: HeadersInit;
    url?: string;
}

export interface AdapterConfig {
    version?: string;
    host?: string;
    namespace?: string;
    headers?: HeadersInit;
    publicKey?: string;
    fetch?: typeof globalThis.fetch;
}

/** @deprecated Use AdapterConfig. Retained as a descriptive compatibility alias. */
export type AdapterOptions = AdapterConfig;

export interface AdapterLike {
    get(path: string, query?: ResourceAttributes, options?: RequestOptions): Promise<unknown>;
    post(path: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
    put(path: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
    patch(path: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
    delete(path: string, options?: RequestOptions, legacyOptions?: RequestOptions): Promise<unknown>;
}

export interface FleetbaseConfig extends AdapterConfig {
    adapter?: AdapterLike;
    customerToken?: string;
}

export interface ResourceOptions {
    version?: string;
    actions?: StoreActionsLike | StoreActionsLike[];
    onAfterFetch?: (json: unknown) => void;
}

export interface StoreActionsLike {
    extend(binding?: object): unknown;
}
