import Resource from '../resource.js';
import { register } from '../registry.js';

export default class ServiceArea extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-area', options);
    }
}

register('resource', 'ServiceArea', ServiceArea);
