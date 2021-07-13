import Resource from '../resource';

class ServiceRate extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-rate', options);
    }
}

export default ServiceRate;
