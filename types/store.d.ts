export default Store;
declare class Store {
    constructor(resource: any, adapter: any, options?: {});
    resource: any;
    adapter: any;
    namespace: any;
    storage: Collection;
    options: {};
    extendActions(actions?: any[]): any;
    deposit(resourceInstance: any): any;
    serialize(json: any): import('./resolver').Resolver;
    afterFetch(json: any): any;
    create(attributes?: {}, options?: {}): Promise<any>;
    update(id: any, attributes?: {}, options?: {}): Promise<any>;
    findRecord(id: any, options?: {}): Promise<any>;
    findAll(options?: {}): Promise<any>;
    query(query?: {}, options?: {}): Promise<any>;
    queryRecord(query?: {}, options?: {}): Promise<any>;
    destroy(record: any, options?: {}): Promise<any>;
}
export function afterFetch(store: any, json: any): any;
export function extendStoreActions(store: any, actions?: any[]): any;
import { Collection } from './utils';
