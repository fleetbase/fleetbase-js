import Resource from '../resource';

class Driver extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'driver', options);
    }
}

export default Driver;
