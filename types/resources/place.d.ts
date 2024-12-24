export default Place;
declare class Place extends Resource {
    static fromGoogleAddress(googleAddress: any, adapter: any, options?: {}): Place;
    constructor(attributes: {}, adapter: any, options?: {});
    /**
     * The latitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get latitude(): any;
    /**
     * The longitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get longitude(): any;
    /**
     * Array coordinate pair for Place location.
     *
     * @var {Array}
     */
    get coordinates(): any[];
    /**
     * Set the owner of the place.
     *
     * @param {Object|String} owner
     * @return {Place}
     */
    setOwner(owner: any | string): Place;
}
import Resource from '../resource';
