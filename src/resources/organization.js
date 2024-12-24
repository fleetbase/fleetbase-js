import Resource from '../resource';

class Organization extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'organization', options);
    }
}

export default Organization;
