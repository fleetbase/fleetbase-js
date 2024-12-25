import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Vendor extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'vendor', options);
    }
}

registerResource('resource', 'Vendor', Vendor);
