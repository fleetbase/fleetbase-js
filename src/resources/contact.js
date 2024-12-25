import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Contact extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'contact', options);
    }
}

registerResource('resource', 'Contact', Contact);
