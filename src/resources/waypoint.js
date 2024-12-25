import Place from './place.js';
import { register } from '../registry.js';

export default class Waypoint extends Place {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'waypoint', options);
    }
}

register('resource', 'Waypoint', Waypoint);
