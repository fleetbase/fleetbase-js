import Resource from '../resource.js';
import { register } from '../registry.js';

export default class ServiceRate extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-rate', options);
    }
}

registerResource('resource', 'ServiceRate', ServiceRate);
