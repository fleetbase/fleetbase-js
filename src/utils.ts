import type { ResourceAttributes } from './types.js';

export const isArray = Array.isArray;

export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value !== 'function' && typeof (value as { length?: unknown }).length === 'number') {
        return (value as { length: number }).length === 0;
    }
    if (typeof (value as { size?: unknown }).size === 'number') {
        return (value as { size: number }).size === 0;
    }
    return false;
}

export function isBlank(value: unknown): boolean {
    return isEmpty(value) || (typeof value === 'string' && !/\S/.test(value));
}

export function isLatitude(value: unknown): boolean {
    return typeof value !== 'symbol' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 90;
}

export function isLongitude(value: unknown): boolean {
    return typeof value !== 'symbol' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 180;
}

export function isPhone(value = ''): boolean {
    return /^[+]?\s*[0-9()./-][\s0-9()./-]*$/.test(value);
}

export function isEmail(value = ''): boolean {
    return /^\S+@\S+\.\S+$/.test(value);
}

export function isNodeEnvironment(): boolean {
    const runtime = globalThis as typeof globalThis & { process?: { release?: { name?: string } } };
    return runtime.process?.release?.name === 'node' && !(typeof navigator !== 'undefined' && navigator.product === 'ReactNative');
}

export function uuid(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    const segment = (): string =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .slice(1);
    return `${segment()}${segment()}-${segment()}-4${segment().slice(1)}-a${segment().slice(1)}-${segment()}${segment()}${segment()}`;
}

export function get(target: unknown, path: string | string[]): unknown {
    const parts = Array.isArray(path) ? path : path.split('.');
    let current = target;
    for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (!part || current === null || current === undefined) {
            return null;
        }
        if (typeof current === 'function') {
            current = (current as () => unknown)();
        }
        if (isResourceLike(current) && part !== 'attributes') {
            current = current.attributes;
        }
        if (current === null || (typeof current !== 'object' && typeof current !== 'function') || !(part in current)) {
            return null;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'function' ? (current as () => unknown)() : current;
}

export function set(target: object, path: string, value: unknown): unknown {
    const parts = path.split('.').filter(Boolean);
    if (parts.some((part) => part === '__proto__' || part === 'prototype' || part === 'constructor')) {
        throw new TypeError('Unsafe object path.');
    }
    let current = target as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) {
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
    }
    const final = parts.at(-1);
    if (final) {
        current[final] = value;
    }
    return value;
}

export function getProperties(target: unknown, properties: string[] = []): ResourceAttributes {
    return Object.fromEntries(properties.map((property) => [property, get(target, property)]));
}

export function setProperties(target: object, properties: ResourceAttributes = {}): object {
    for (const [property, value] of Object.entries(properties)) {
        set(target, property, value);
    }
    return target;
}

export function extend<T extends object>(target: T, ...sources: object[]): T {
    Object.assign(target, ...sources);
    return target;
}

export function isCallable(target: object, property: string): boolean {
    return typeof (target as Record<string, unknown>)[property] === 'function';
}

export function invoke(target: object, method: string): ((...args: unknown[]) => unknown) | undefined {
    const candidate = (target as Record<string, unknown>)[method];
    return typeof candidate === 'function' ? (candidate.bind(target) as (...args: unknown[]) => unknown) : undefined;
}

export function isResourceLike(value: unknown): value is { attributes: ResourceAttributes; id?: unknown; getAttribute?: (name: string) => unknown } {
    return Boolean(value && typeof value === 'object' && 'attributes' in value && typeof (value as { attributes?: unknown }).attributes === 'object');
}

export class Point {
    type = 'Point' as const;
    coordinates: [number, number];

    constructor(latitude = 0, longitude = 0) {
        this.coordinates = [longitude, latitude];
    }

    get latitude(): number {
        return this.coordinates[1];
    }
    get longitude(): number {
        return this.coordinates[0];
    }
    lat(): number {
        return this.latitude;
    }
    lng(): number {
        return this.longitude;
    }
    static fromGeoJson(json: { coordinates: [number, number] }): Point {
        return new Point(json.coordinates[1], json.coordinates[0]);
    }
    serialize(): { type: 'Point'; coordinates: [number, number] } {
        return { type: this.type, coordinates: [...this.coordinates] };
    }
    toJson(): { type: 'Point'; coordinates: [number, number] } {
        return this.serialize();
    }
    toString(): string {
        return `(${this.latitude}, ${this.longitude})`;
    }
}

interface GoogleAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

interface GooglePlace {
    address_components?: GoogleAddressComponent[];
    geometry?: { location?: Record<string, number> };
}

export class GoogleAddress {
    place: GooglePlace;
    geometry: GooglePlace['geometry'];
    components: Record<string, GoogleAddressComponent>;
    attributes: ResourceAttributes;

    constructor(place: GooglePlace) {
        this.place = place;
        this.geometry = place.geometry;
        this.components = this.parseComponents();
        this.attributes = this.parseProperties();
    }

    parse(): void {
        this.components = this.parseComponents();
        this.attributes = this.parseProperties();
    }

    parseComponents(): Record<string, GoogleAddressComponent> {
        const result: Record<string, GoogleAddressComponent> = {};
        for (const component of this.place.address_components ?? []) {
            for (const type of component.types) {
                result[type] = component;
            }
        }
        return result;
    }

    parseProperties(): ResourceAttributes {
        const streetNumber = this.get('street_number');
        const streetName = this.get('route');
        return {
            streetNumber,
            streetName,
            address: [streetNumber, streetName].filter(Boolean).join(' '),
            coordinates: this.geometry?.location ? Object.values(this.geometry.location) : [0, 0],
            city: this.or(['locality', 'sublocality', 'sublocality_level_1', 'neighborhood', 'administrative_area_level_3', 'administrative_area_level_2']),
            county: this.get('administrative_area_level_2'),
            stateShort: this.get('administrative_area_level_1', true),
            stateLong: this.get('administrative_area_level_1'),
            countryShort: this.get('country', true),
            country: this.get('country', true),
            countryLong: this.get('country'),
            postalCode: this.get('postal_code'),
        };
    }

    all(): ResourceAttributes {
        return this.attributes;
    }
    or(keys: Array<string | [string, boolean]> = []): string | null {
        for (const key of keys) {
            const [name, short] = Array.isArray(key) ? key : [key, false];
            if (this.has(name)) {
                return this.get(name, short);
            }
        }
        return null;
    }
    has(key: string): boolean {
        return key in this.components;
    }
    get(key: string, short = false): string | null {
        const component = this.components[key];
        return component ? (short ? component.short_name : component.long_name) : null;
    }
    setAttributes(attributes: ResourceAttributes = {}): this {
        Object.assign(this.attributes, attributes);
        return this;
    }
    setAttribute(key: string, value: unknown): this {
        this.attributes[key] = value;
        return this;
    }
    getAttribute(key: string): unknown {
        return this.attributes[key] ?? null;
    }
}

export function createGoogleAddress(place: GooglePlace): GoogleAddress {
    return new GoogleAddress(place);
}
