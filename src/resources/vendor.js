import Resource from '../resource';

class Vendor extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'vendor', options);
    }
}

export default Vendor;
