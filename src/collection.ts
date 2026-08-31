import { get } from './utils.js';

function compare(left: unknown, right: unknown): number {
    return left === right ? 0 : left == null ? -1 : right == null ? 1 : left < right ? -1 : 1;
}

export function replace<T>(array: T[], start: number, deleteCount: number, items: T[] = []): void {
    array.splice(start, deleteCount, ...items);
}

export function uniqBy<T>(array: T[], key: keyof T | ((item: T) => unknown) = (item) => item): T[] {
    const seen = new Set<unknown>();
    return array.filter((item) => {
        const value = typeof key === 'function' ? key(item) : get(item, String(key));
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

export function isCollection(value: unknown): value is Collection<unknown> {
    return value instanceof Collection;
}
export function objectAt<T>(array: T[], index: number): T | undefined {
    return array[index];
}
export function iter<T>(key: keyof T, value?: unknown, hasValue = arguments.length === 2): (item: T) => boolean {
    return hasValue ? (item) => item[key] === value : (item) => Boolean(item[key]);
}

export default class Collection<T = unknown> extends Array<T> {
    static override get [Symbol.species](): ArrayConstructor {
        return Array;
    }

    constructor(...items: T[] | [T[]]) {
        super();
        Object.setPrototypeOf(this, new.target.prototype);
        this.push(...(items.length === 1 && Array.isArray(items[0]) ? items[0] : (items as T[])));
    }

    get notEmpty(): boolean {
        return this.length > 0;
    }
    get empty(): boolean {
        return this.length === 0;
    }
    get first(): T | undefined {
        return this[0];
    }
    get last(): T | undefined {
        return this[this.length - 1];
    }
    replace(start: number, deleteCount: number, items: T[] = []): this {
        replace(this, start, deleteCount, items);
        return this;
    }
    objectsAt(indexes: number[]): Array<T | undefined> {
        return indexes.map((index) => this[index]);
    }
    objectAt(index: number): T | undefined {
        return this[index];
    }
    findBy<K extends keyof T>(key: K, value?: T[K]): T | undefined {
        return this.find(iter(key, value, arguments.length === 2));
    }
    findIndexBy<K extends keyof T>(key: K, value?: T[K]): number {
        return this.findIndex(iter(key, value, arguments.length === 2));
    }
    isEvery<K extends keyof T>(key: K, value?: T[K]): boolean {
        return this.every(iter(key, value, arguments.length === 2));
    }
    isAny<K extends keyof T>(key: K, value?: T[K]): boolean {
        return this.some(iter(key, value, arguments.length === 2));
    }
    invoke(methodName: keyof T, ...args: unknown[]): unknown[] {
        return this.map((item) => {
            const method = item[methodName];
            return typeof method === 'function' ? (method as (...values: unknown[]) => unknown).apply(item, args) : undefined;
        });
    }
    toArray(): T[] {
        return [...this];
    }
    compact(): Collection<NonNullable<T>> {
        return createCollection<NonNullable<T>>(this.filter((value): value is NonNullable<T> => value != null));
    }
    sortBy(...keys: Array<keyof T>): this {
        return this.sort((left, right) => {
            for (const key of keys) {
                const result = compare(left[key], right[key]);
                if (result) return result;
            }
            return 0;
        });
    }
    uniqBy(key?: keyof T | ((item: T) => unknown)): T[] {
        return uniqBy(this, key);
    }
    without(value: T): T[] | this {
        return this.includes(value) ? this.filter((item) => !Object.is(item, value)) : this;
    }
    clear(): this {
        this.splice(0);
        return this;
    }
    insertAt(index: number, item: T): this {
        this.splice(index, 0, item);
        return this;
    }
    replaceAt(index: number, item: T): this {
        return this.replace(index, 1, [item]);
    }
    removeAt(start: number, length = 1): this {
        this.splice(start, length);
        return this;
    }
    pushObject(item: T): this {
        return this.insertAt(this.length, item);
    }
    pushObjects(items: T[]): this {
        return this.replace(this.length, 0, items);
    }
    popObject(): T | null {
        return this.pop() ?? null;
    }
    shiftObject(): T | null {
        return this.shift() ?? null;
    }
    unshiftObject(item: T): T {
        this.unshift(item);
        return item;
    }
    unshiftObjects(items: T[]): this {
        return this.replace(0, 0, items);
    }
    reverseObjects(): this {
        Array.prototype.reverse.call(this);
        return this;
    }
    setObjects(items: T[]): this {
        return this.replace(0, this.length, items);
    }
    removeObject(item: T): this {
        for (let index = this.length - 1; index >= 0; index -= 1) {
            if (Object.is(this[index], item)) this.splice(index, 1);
        }
        return this;
    }
    removeObjects(items: T[]): this {
        items.forEach((item) => this.removeObject(item));
        return this;
    }
    addObject(item: T): this {
        if (!this.includes(item)) this.push(item);
        return this;
    }
    addObjects(items: T[]): this {
        items.forEach((item) => this.addObject(item));
        return this;
    }
}

export function createCollection<T>(items: T[]): Collection<T>;
export function createCollection<T>(...items: T[]): Collection<T>;
export function createCollection<T>(...items: T[] | [T[]]): Collection<T> {
    return new Collection<T>(...items);
}
