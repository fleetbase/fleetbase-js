export default NodeAdapter;
declare class NodeAdapter extends Adapter {
    axios: import('axios').AxiosInstance;
    /**
     * Updates the adapter headers.
     *
     * @param {Object} headers
     */
    setHeaders(headers?: any): this;
    /**
     * Tranform the response, and return the response data from axios.
     *
     * @param {AxiosResponse} response
     * @returns {Object}
     */
    transform(response: AxiosResponse): any;
    /**
     * Handles an erroneous request.
     *
     * @param {AxiosResponse} response
     * @returns {Object}
     */
    handleError(error: any): any;
    /**
     * Makes a GET request with axios
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    get(path: string, query?: any, options?: any): Promise<any>;
    /**
     * Makes a POST request with axios
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    post(path: string, data?: any, options?: any): Promise<any>;
    /**
     * Makes a PUT request with axios
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    put(path: string, data?: any, options?: any): Promise<any>;
    /**
     * Makes a DELETE request with axios
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    delete(path: string, options?: any): Promise<any>;
    /**
     * Makes a PATCH request with axios
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    patch(path: string, data?: any, options?: any): Promise<any>;
}
import Adapter from '../adapter';
