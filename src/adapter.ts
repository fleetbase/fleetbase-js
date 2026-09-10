import type { AdapterConfig, AdapterLike, RequestOptions, ResourceAttributes } from './types.js';

export default class Adapter implements AdapterLike {
    version: string;
    host: string | null;
    namespace: string | null;
    headers: HeadersInit;

    constructor(config: AdapterConfig = {}) {
        this.version = config.version ?? 'v1';
        this.host = config.host ?? null;
        this.namespace = config.namespace ?? null;
        this.headers = config.headers ?? {};
    }

    get(_path: string, _query: ResourceAttributes = {}, _options: RequestOptions = {}): Promise<unknown> {
        return Promise.reject(new Error('Adapter#get must be implemented.'));
    }

    post(_path: string, _data: unknown = {}, _options: RequestOptions = {}): Promise<unknown> {
        return Promise.reject(new Error('Adapter#post must be implemented.'));
    }

    put(_path: string, _data: unknown = {}, _options: RequestOptions = {}): Promise<unknown> {
        return Promise.reject(new Error('Adapter#put must be implemented.'));
    }

    patch(_path: string, _data: unknown = {}, _options: RequestOptions = {}): Promise<unknown> {
        return Promise.reject(new Error('Adapter#patch must be implemented.'));
    }

    delete(_path: string, _options: RequestOptions = {}, _legacyOptions?: RequestOptions): Promise<unknown> {
        return Promise.reject(new Error('Adapter#delete must be implemented.'));
    }
}
