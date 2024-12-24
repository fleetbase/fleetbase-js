export default Payload;
declare class Payload extends Resource {
    constructor(attributes: {}, adapter: any, options?: {});
    /**
     * Attaches an entity to an existing payload and returns
     * the payload with the entity attached
     *
     * @param  {[type]} Entity entity        [description]
     * @return {[type]}        [description]
     */
    attach(entity: any): [type];
    /**
     * Returns all of the entities attached to this payload
     *
     * @return {[type]} [description]
     */
    get entities(): [type];
    /**
     * Returns the dropoff for this payload
     *
     * @return {[type]} [description]
     */
    get dropoff(): [type];
    /**
     * Returns the pickup for this payload
     *
     * @return {[type]} [description]
     */
    get pickup(): [type];
    /**
     * Returns all the waypoints for this payload
     *
     * @return {[type]} [description]
     */
    get waypoints(): [type];
}
import Resource from '../resource';
