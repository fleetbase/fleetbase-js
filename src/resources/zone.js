import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Zone extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'zone', options);
    }
}

registerResource('resource', 'Zone', Zone);
