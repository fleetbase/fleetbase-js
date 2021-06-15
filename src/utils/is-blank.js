import isEmpty from './is-empty';

const isBlank = (obj) => isEmpty(obj) || (typeof obj === 'string' && /\S/.test(obj) === false);

export default isBlank;
