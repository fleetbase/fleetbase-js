import Resource from '../resource';

class Vehicle extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'vehicle', options);
    }
}

export default Vehicle;
