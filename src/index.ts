import Adapter from './adapter.js';
import BrowserAdapter from './adapters/browser.js';
import EmberJsAdapter from './adapters/ember.js';
import NodeAdapter from './adapters/node.js';
import Fleetbase from './fleetbase.js';
import Resource from './resource.js';
import Store from './store.js';
import { register } from './registry.js';

register('adapter', 'Adapter', Adapter);
register('adapter', 'BrowserAdapter', BrowserAdapter);
register('adapter', 'NodeAdapter', NodeAdapter);
register('adapter', 'EmberJsAdapter', EmberJsAdapter);

export default Fleetbase;
export { Fleetbase, Adapter, BrowserAdapter, EmberJsAdapter, NodeAdapter, Resource, Store };
export { detectAdapter } from './adapters/detect.js';
export { default as Collection, createCollection, isCollection, iter, objectAt, replace, uniqBy } from './collection.js';
export { FleetbaseError } from './errors.js';
export { create, createAdapter, createResource, createStore, register, registry } from './registry.js';
export { default as Resolver, lookup, resolve, resolveAdapter, resolveResource } from './resolver.js';
export * from './resources.js';
export { createStore as createStoreInstance, afterFetch } from './store.js';
export { default as StoreActions, createStoreActions, extendStoreActions, isStoreActions } from './store-actions.js';
export { camelize, capitalize, classify, dasherize, demodulize, foreignKey, humanize, normify, pluralize, singularize, tableize, underscore } from './string.js';
export {
    createGoogleAddress,
    extend,
    get,
    getProperties,
    GoogleAddress,
    invoke,
    isArray,
    isBlank,
    isCallable,
    isEmail,
    isEmpty,
    isLatitude,
    isLongitude,
    isNodeEnvironment,
    isPhone,
    Point,
    set,
    setProperties,
    uuid,
} from './utils.js';
export { isResource } from './resource.js';
export type * from './types.js';
