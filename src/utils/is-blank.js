import isEmpty from './is-empty';

const isBlank = (obj) => {
    return isEmpty(obj) || (typeof obj === 'string' && /\S/.test(obj) === false);
};

export default isBlank;
