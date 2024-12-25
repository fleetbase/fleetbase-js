import Resource from '../resource.js';
import { createCollection } from '../utils/collection.js';
import { resolveResource } from '../resolver.js';
import { register } from '../registry.js';

export default class Payload extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'payload', options);
    }

    /**
     * Attaches an entity to an existing payload and returns
     * the payload with the entity attached
     *
     * @param  {Entity} Entity entity        [description]
     * @return {Payload}        [description]
     */
    // eslint-disable-next-line no-unused-vars
    attach(entity) {
        // perform op return payload
    }

    /**
     * Returns all of the entities attached to this payload
     *
     * @return {Collection} [description]
     */
    get entities() {
        return new Collection(this.entities.map((data) => resolveResource('Entity', data, this.adapter)));
    }

    /**
     * Returns the dropoff for this payload
     *
     * @return {Place|null} [description]
     */
    get dropoff() {
        return this.dropoff ? resolveResource('Place', this.dropoff, this.adapter) : null;
    }

    /**
     * Returns the pickup for this payload
     *
     * @return {Place|null} [description]
     */
    get pickup() {
        return this.pickup ? resolveResource('Place', this.pickup, this.adapter) : null;
    }

    /**
     * Returns all the waypoints for this payload
     *
     * @return {Collection} [description]
     */
    get waypoints() {
        return new Collection(this.waypoints.map((data) => resolveResource('Waypoint', data, this.adapter)));
    }
}

registerResource('resource', 'Payload', Payload);
