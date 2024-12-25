import Resource from '../resource.js';
import { register } from '../registry.js';

export default class Entity extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'entity', options);
    }
}

register('resource', 'Entity', Entity);
