import Resource from '../resource';

class Entity extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'entity', options);
    }
}

export default Entity;
