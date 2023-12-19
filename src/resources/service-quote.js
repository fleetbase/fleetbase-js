import Resource from '../resource';

class ServiceQuote extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-quote', options);
    }

    fromPreliminary() {}

    fromPayload() {}
}

export default ServiceQuote;
