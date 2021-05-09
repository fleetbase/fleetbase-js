import String from '../string';

const pluralize = function() {
    const argz = ['pluralize', ...arguments];

    return String.invoke(...argz);
};

const singularize = function() {
    const argz = ['singularize', ...arguments];

    return String.invoke(...argz);
};

const humanize = function() {
    const argz = ['humanize', ...arguments];

    return String.invoke(...argz);
};

const underscore = function() {
    const argz = ['underscore', ...arguments];

    return String.invoke(...argz);
};

const camelize = function() {
    const argz = ['camelize', ...arguments];

    return String.invoke(...argz);
};

const capitalize = function() {
    const argz = ['capitalize', ...arguments];

    return String.invoke(...argz);
};

const dasherize = function() {
    const argz = ['dasherize', ...arguments];

    return String.invoke(...argz);
};

const normify = function() {
    const argz = ['normify', ...arguments];

    return String.invoke(...argz);
};

const demodulize = function() {
    const argz = ['demodulize', ...arguments];

    return String.invoke(...argz);
};

const tableize = function() {
    const argz = ['tableize', ...arguments];

    return String.invoke(...argz);
};

const classify = function() {
    const argz = ['classify', ...arguments];

    return String.invoke(...argz);
};

const foreignKey = function() {
    const argz = ['foreignKey', ...arguments];

    return String.invoke(...argz);
};

export {
    String,
    pluralize,
    singularize,
    humanize,
    underscore,
    camelize,
    capitalize,
    dasherize,
    normify,
    demodulize,
    tableize,
    classify,
    foreignKey
};