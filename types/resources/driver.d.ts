export default Driver;
declare class Driver extends Resource {
    constructor(attributes: {}, adapter: any, options?: {});
    get token(): any;
    get isOnline(): boolean;
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
    track(params?: {}, options?: {}): any;
    syncDevice(params?: {}, options?: {}): any;
}
export const driverActions: StoreActions;
import Resource from '../resource';
import { StoreActions } from '../utils';
