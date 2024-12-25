import isEmpty from './is-empty.js';

export function isBlank(obj) {
    return isEmpty(obj) || (typeof obj === 'string' && /\S/.test(obj) === false);
}

export default isBlank;
