import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Fleet extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'fleet', options);
    }
}

register('resource', 'Fleet', Fleet);
