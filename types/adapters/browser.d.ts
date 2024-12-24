export default BrowserAdapter;
declare class BrowserAdapter extends Adapter {
    /**
     * Setup browser adapter.
     * @param {Object} config
     */
    constructor(config: any);
    /**
     * Updates the adapter headers.
     *
     * @param {Object} headers
     */
    setHeaders(headers?: any): this;
    /**
     * Parses the JSON returned by a network request
     *
     * @param  {Object} response A response from a network request
     * @return {Object}          The parsed JSON, status from the response
     *
     * @return {Promise}
     */
    parseJSON(response: any): any;
    /**
     * The base request method
     *
     * @param {String} path
     * @param {String} method
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    request(path: string, method?: string, data?: any, options?: any): Promise<any>;
    /**
     * Makes a GET request with fetch
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    get(path: string, query?: any, options?: any): Promise<any>;
    /**
     * Makes a POST request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    post(path: string, data?: any, options?: any): Promise<any>;
    /**
     * Makes a PUT request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    put(path: string, data?: any, options?: any): Promise<any>;
    /**
     * Makes a DELETE request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    delete(path: string, options?: any): Promise<any>;
    /**
     * Makes a PATCH request with fetch
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    patch(path: string, data?: any, options?: any): Promise<any>;
}
import Adapter from '../adapter';
