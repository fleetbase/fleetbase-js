import Resource from '../resource.js';
import { register } from '../registry.js';

export default class TrackingStatus extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'tracking-status', options);
    }
}

register('resource', 'TrackingStatus', TrackingStatus);
