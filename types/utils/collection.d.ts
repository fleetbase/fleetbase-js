export default Collection;
declare class Collection extends Array<any> {
    constructor(...items: any[]);
    get notEmpty(): boolean;
    get empty(): boolean;
    get first(): any;
    get last(): any;
    replace(start: any, deleteCount: any, items?: any[]): this;
    objectsAt(indexes: any): any;
    objectAt(index: any): any;
    indexOf(object: any, startAt: any): number;
    lastIndexOf(object: any, startAt: any): any;
    includes(object: any, startAt: any): boolean;
    findBy(...args: any[]): any;
    findIndexBy(...args: any[]): number;
    isEvery(...args: any[]): boolean;
    isAny(...args: any[]): boolean;
    invoke(methodName: any, ...args: any[]): any[];
    toArray(): any[];
    compact(): any[];
    sortBy(...args: any[]): this;
    uniqBy(key: any): any[];
    without(value: any): any[] | this;
    clear(): this;
    insertAt(idx: any, object: any): this;
    replaceAt(idx: any, object: any): this;
    removeAt(start: any, len: any): any;
    pushObject(obj: any): this;
    pushObjects(objects: any): this;
    popObject(): any;
    shiftObject(): any;
    unshiftObject(obj: any): any;
    unshiftObjects(objects: any): this;
    reverseObjects(): this;
    setObjects(objects: any): this;
    removeObject(obj: any): this;
    removeObjects(objects: any): this;
    addObject(obj: any): this;
    addObjects(objects: any): this;
}
export function replace(array: any, start: any, deleteCount: any, items?: any[]): void;
export function uniqBy(array: any, key?: (item: any) => any): any[];
export function isCollection(mixed: any): boolean;
export function objectAt(array: any, index: any): any;
export function iter(key: any, value: any, ...args: any[]): (item: any) => boolean;
export function findIndex(array: any, predicate: any, startAt?: number): number;
export function find(array: any, callback: any, target: any): any;
export function any(array: any, callback: any, target: any): boolean;
export function every(array: any, callback: any, target: any): boolean;
export function indexOf(array: any, val: any, startAt: number, withNaNCheck: any): number;
export function removeAt(array: any, index: any, len?: number): any;
export function insertAt(array: any, index: any, item: any): any;
