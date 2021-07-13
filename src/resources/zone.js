import Resource from '../resource';

class Zone extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'zone', options);
    }
}

export default Zone;
