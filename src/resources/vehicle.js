import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Vehicle extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'vehicle', options);
    }
}

register('resource', 'Vehicle', Vehicle);
