import { isArray } from './array';

/**
 * Collection
 * Extended array inspired by Ember's NativeArray
 **/

const CHUNK_SIZE = 60000;

// To avoid overflowing the stack, we splice up to CHUNK_SIZE items at a time.
// See https://code.google.com/p/chromium/issues/detail?id=56588 for more details.
const replace = (array, start, deleteCount, items = []) => {
    if (isArray(array)) {
        if (items.length <= CHUNK_SIZE) {
            array.splice(start, deleteCount, ...items);
        } else {
            array.splice(start, deleteCount);

            for (let i = 0; i < items.length; i += CHUNK_SIZE) {
                let chunk = items.slice(i, i + CHUNK_SIZE);
                array.splice(start + i, 0, ...chunk);
            }
        }
    } else if (isCollection(arr)) {
        array.replace(start, deleteCount, items);
    }
};

const identityFunction = (item) => item;

const uniqBy = (array, key = identityFunction) => {
    let ret = [];
    let seen = new Set();
    let getter = typeof key === 'function' ? key : (item) => get(item, key);

    array.forEach((item) => {
        let val = getter(item);
        if (!seen.has(val)) {
            seen.add(val);
            ret.push(item);
        }
    });

    return ret;
};

const isCollection = (mixed) => mixed instanceof Collection;

const objectAt = (array, index) => {
    if (isArray(array)) {
        return array[index];
    } else if (isCollection(array)) {
        return array.objectAt(index);
    }

    return null;
};

const iter = (key, value) => {
    let valueProvided = arguments.length === 2;
    return valueProvided ? (item) => value === item[key] : (item) => Boolean(item[key]);
};

const findIndex = (array, predicate, startAt = 0) => {
    let len = array.length;
    for (let index = startAt; index < len; index++) {
        let item = objectAt(array, index);
        if (predicate(item, index, array)) {
            return index;
        }
    }
    return -1;
};

const find = (array, callback, target) => {
    let predicate = callback.bind(target);
    let index = findIndex(array, predicate, 0);
    return index === -1 ? undefined : objectAt(array, index);
};

const any = (array, callback, target) => {
    let predicate = callback.bind(target);
    return findIndex(array, predicate, 0) !== -1;
};

const every = (array, callback, target) => {
    let cb = callback.bind(target);
    let predicate = (item, index, array) => !cb(item, index, array);
    return findIndex(array, predicate, 0) === -1;
};

const indexOf = (array, val, startAt = 0, withNaNCheck) => {
    let len = array.length;

    if (startAt < 0) {
        startAt += len;
    }

    // SameValueZero comparison (NaN !== NaN)
    let predicate = withNaNCheck && val !== val ? (item) => item !== item : (item) => item === val;
    return findIndex(array, predicate, startAt);
};

const removeAt = (array, index, len = 1) => {
    replace(array, index, len, []);
    return array;
};

const insertAt = (array, index, item) => {
    replace(array, index, 0, [item]);
    return item;
};

class Collection extends Array {
    constructor(...items) {
        if (isArray(arguments[0])) {
            super(...arguments[0]);
        } else {
            super(...arguments);
        }
    }

    get notEmpty() {
        return this.length > 0;
    }

    get empty() {
        return this.length === 0;
    }

    get first() {
        return objectAt(this, 0);
    }

    get last() {
        return objectAt(this, this.length - 1);
    }

    replace(start, deleteCount, items = []) {
        replace(this, start, deleteCount, items);

        return this;
    }

    objectsAt(indexes) {
        return indexes.map((idx) => objectAt(this, idx));
    }

    objectAt(index) {
        return objectAt(this, index);
    }

    indexOf(object, startAt) {
        return indexOf(this, object, startAt, false);
    }

    lastIndexOf(object, startAt) {
        let len = this.length;

        if (startAt === undefined || startAt >= len) {
            startAt = len - 1;
        }

        if (startAt < 0) {
            startAt += len;
        }

        for (let idx = startAt; idx >= 0; idx--) {
            if (objectAt(this, idx) === object) {
                return idx;
            }
        }

        return -1;
    }

    includes(object, startAt) {
        return indexOf(this, object, startAt, true) !== -1;
    }

    findBy() {
        return find(this, iter(...arguments));
    }

    findIndexBy() {
        return findIndex(this, iter(...arguments));
    }

    isEvery() {
        return every(this, iter(...arguments));
    }

    isAny() {
        return any(this, iter(...arguments));
    }

    invoke(methodName, ...args) {
        let ret = [];

        this.forEach((item) => ret.push(item[methodName]?.(...args)));

        return ret;
    }

    toArray() {
        return this.map((item) => item);
    }

    compact() {
        return this.filter((value) => value != null);
    }

    sortBy() {
        let sortKeys = arguments;

        return this.sort((a, b) => {
            for (const element of sortKeys) {
                let key = element;
                let propA = a[key];
                let propB = b[key];
                // return 1 or -1 else continue to the next sortKey
                let compareValue = compare(propA, propB);

                if (compareValue) {
                    return compareValue;
                }
            }
            return 0;
        });
    }

    uniqBy(key) {
        return uniqBy(this, key);
    }

    without(value) {
        if (!this.includes(value)) {
            return this; // nothing to do
        }

        // SameValueZero comparison (NaN !== NaN)
        let predicate = value === value ? (item) => item !== value : (item) => item === item;
        return this.filter(predicate);
    }

    clear() {
        let len = this.length;
        if (len === 0) {
            return this;
        }

        this.replace(0, len, []);
        return this;
    }

    insertAt(idx, object) {
        insertAt(this, idx, object);
        return this;
    }

    replaceAt(idx, object) {
        return this.replace(idx, 1, [object]);
    }

    removeAt(start, len) {
        return removeAt(this, start, len);
    }

    pushObject(obj) {
        return this.insertAt(this.length, obj);
    }

    pushObjects(objects) {
        this.replace(this.length, 0, objects);
        return this;
    }

    popObject() {
        let len = this.length;
        if (len === 0) {
            return null;
        }

        let ret = objectAt(this, len - 1);
        this.removeAt(len - 1, 1);
        return ret;
    }

    shiftObject() {
        if (this.length === 0) {
            return null;
        }

        let ret = objectAt(this, 0);
        this.removeAt(0);
        return ret;
    }

    unshiftObject(obj) {
        return insertAt(this, 0, obj);
    }

    unshiftObjects(objects) {
        this.replace(0, 0, objects);
        return this;
    }

    reverseObjects() {
        let len = this.length;
        if (len === 0) {
            return this;
        }

        let objects = this.toArray().reverse();
        this.replace(0, len, objects);
        return this;
    }

    setObjects(objects) {
        if (objects.length === 0) {
            return this.clear();
        }

        let len = this.length;
        this.replace(0, len, objects);
        return this;
    }

    removeObject(obj) {
        let loc = this.length || 0;
        while (--loc >= 0) {
            let curObject = objectAt(this, loc);

            if (curObject === obj) {
                this.removeAt(loc);
            }
        }
        return this;
    }

    removeObjects(objects) {
        for (let i = objects.length - 1; i >= 0; i--) {
            this.removeObject(objects[i]);
        }

        return this;
    }

    addObject(obj) {
        let included = this.includes(obj);

        if (!included) {
            this.pushObject(obj);
        }

        return this;
    }

    addObjects(objects) {
        objects.forEach((obj) => this.addObject(obj));
        return this;
    }
}

export default Collection;

export { replace, uniqBy, isCollection, objectAt, iter, findIndex, find, any, every, indexOf, removeAt, insertAt };
