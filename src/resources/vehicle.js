import Resource from '../resource.js';
import { register } from '../registry.js';
import { Point } from '@fleetbase/sdk';

export default class Vehicle extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'vehicle', options);
    }

    /**
     * Attribute which determines if vehicle is online.
     *
     * @var {Integer}
     */
    get isOnline() {
        return this.getAttribute('online') === true;
    }

    /**
     * The latitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get latitude() {
        return this.getAttribute('location', new Point())?.coordinates[1];
    }

    /**
     * The longitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get longitude() {
        return this.getAttribute('location', new Point())?.coordinates[0];
    }

    /**
     * Array coordinate pair for Place location.
     *
     * @var {Array}
     */
    get coordinates() {
        const { latitude, longitude } = this;

        return [latitude, longitude];
    }
}

register('resource', 'Vehicle', Vehicle);
