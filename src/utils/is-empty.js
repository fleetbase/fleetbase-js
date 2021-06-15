const isEmpty = (obj) => {
    const none = obj === null || obj === undefined;
    if (none) {
        return none;
    }

    if (typeof obj.size === 'number') {
        return !obj.size;
    }

    const objectType = typeof obj;

    if (objectType === 'object') {
        const { size } = obj;
        if (typeof size === 'number') {
            return !size;
        }
    }

    if (typeof obj.length === 'number' && objectType !== 'function') {
        return !obj.length;
    }

    if (objectType === 'object') {
        const { length } = obj;
        if (typeof length === 'number') {
            return !length;
        }
    }

    return false;
};

export default isEmpty;
