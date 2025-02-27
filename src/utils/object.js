/* eslint no-undef: "off" */
import isEmpty from './is-empty.js';

export function isResource(mixed) {
    return typeof mixed === 'object' && !isEmpty(mixed?.attributes) && typeof mixed?.attributes === 'object';
}

export function isCallable(object, property) {
    return typeof object[property] === 'function';
}

export function getResolved(func, path) {
    const resolved = func();
    return Array.isArray(resolved) || typeof resolved === 'object' ? get(resolved, path) : null;
}

export function invoke(object, method) {
    if (typeof object[method] === 'function') {
        return object[method].bind(object);
    }
}

export function get(object, path) {
    let current = object;

    const type = typeof object;
    const isObject = type === 'object';
    const isFunction = type === 'function';
    const isArray = Array.isArray(object);

    const pathType = typeof path;
    const pathIsString = pathType === 'string';
    const pathIsDotted = pathIsString && path.includes('.');
    const pathArray = pathIsDotted ? path.split('.') : [path];

    if (isArray || isObject) {
        for (let i = 0; i < pathArray.length; i++) {
            if (current && current[pathArray[i]] === undefined) {
                return null;
            } else if (current) {
                current = current[pathArray[i]];

                // if is resource then return get on its attributes
                if (isResource(current) && pathArray[i + 1] !== undefined) {
                    const newPath = pathArray.slice(i + 1).join('.');

                    return get(current.attributes, newPath);
                }

                // resolve functions and continue
                if (typeof current === 'function') {
                    const newPath = pathArray.slice(i + 1).join('.');
                    return getResolved(current, newPath);
                }
            }
        }
        return current;
    }

    if (isFunction) {
        return getResolved(object, path);
    }
}

export function getProperties(object, properties = []) {
    const selected = {};
    let propertyNames = arguments;
    let i = 1;

    if (arguments.length === 2 && Array.isArray(properties)) {
        i = 0;
        propertyNames = arguments[1];
    }

    for (; i < propertyNames.length; i++) {
        selected[propertyNames[i]] = get(object, propertyNames[i]);
    }

    return selected;
}

export function set(object, path, value) {
    let current = object;
    const type = typeof object;
    const isObject = type === 'object';
    const isFunction = type === 'function';
    const isArray = Array.isArray(object);

    // if is function
    if (isFunction) {
        // throw error should be object or array or object like
    }

    const pathType = typeof path;
    const pathIsString = pathType === 'string';
    const pathIsDotted = pathIsString && path.includes('.');
    const pathArray = pathIsDotted ? path.split('.') : [path];
    const iterations = pathArray.length;

    if (isArray || isObject) {
        for (let i = 0; i < iterations - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }

        current[pathArray[iterations - 1]] = value;
    }

    return value;
}

export function setProperties(object, properties = {}) {
    for (const property in properties) {
        set(object, property, properties[property]);
    }

    return object;
}

export function extend(target, classes = []) {
    if (arguments.length > 1) {
        classes = arguments;
    }
    for (const element of classes) {
        for (const property in element) {
            if (Object.prototype.hasOwnProperty.call(element, property)) {
                target[property] = element[property];
            }
        }
    }
    return target;
}
