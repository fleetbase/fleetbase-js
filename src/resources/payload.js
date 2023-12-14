import Resource from '../resource';
import Collection from '../utils/collection';

class Payload extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'payload', options);
    }

    /**
     * Attaches an entity to an existing payload and returns
     * the payload with the entity attached
     *
     * @param  {[type]} Entity entity        [description]
     * @return {[type]}        [description]
     */
    attach(entity) {
        // perform op return payload
    }

    /**
     * Returns all of the entities attached to this payload
     *
     * @return {[type]} [description]
     */
    get entities() {}

    /**
     * Returns the dropoff for this payload
     *
     * @return {[type]} [description]
     */
    get dropoff() {}

    /**
     * Returns the pickup for this payload
     *
     * @return {[type]} [description]
     */
    get pickup() {}

    /**
     * Returns all the waypoints for this payload
     *
     * @return {[type]} [description]
     */
    get waypoints() {
        return new Collection(this.waypoints);
    }
}

export default Payload;
