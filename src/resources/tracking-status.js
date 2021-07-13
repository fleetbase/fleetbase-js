import Resource from '../resource';

class TrackingStatus extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'tracking-status', options);
    }
}

export default TrackingStatus;
