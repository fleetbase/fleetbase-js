import Resource from '../resource';

class ServiceArea extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-area', options);
    }
}

export default ServiceArea;
