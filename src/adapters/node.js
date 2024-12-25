import Adapter from '../adapter.js';
import { register } from '../registry.js';
import { isArray } from '../utils/array.js';
import axios from 'axios';

/**
 * @class NodeAdapter
 * @extends Adapter
 *
 * @classdesc
 * The NodeAdapter extends the base Adapter class to facilitate making HTTP requests using Axios in a Node environment.
 * It provides convenient methods for all standard HTTP verbs (GET, POST, PUT, DELETE, PATCH) and supports:
 *
 *  - Automatic JSON serialization and deserialization.
 *  - Base URL and common headers.
 *  - Interceptors for transforming responses and handling errors.
 *  - Customizable headers at runtime via `setHeaders`.
 */
export default class NodeAdapter extends Adapter {
    /**
     * Creates an instance of NodeAdapter.
     *
     * @param {Object} config - Configuration object
     * @param {string} config.publicKey - The public key used for authorization.
     * @param {string} [config.host='https://api.example.com'] - The base URL or domain for the API.
     * @param {string} [config.namespace='v1'] - The default namespace or version for the API.
     *
     * @example
     * const adapter = new NodeAdapter({
     *   publicKey: 'YOUR_PUBLIC_KEY',
     *   host: 'https://api.yourapp.com',
     *   namespace: 'v1'
     * });
     */
    constructor(config) {
        super(config);

        // Create a dedicated Axios instance with base URL and default headers
        this.axiosInstance = axios.create({
            baseURL: `${this.host}/${this.namespace}`,
            headers: {
                Authorization: `Bearer ${config.publicKey}`,
                'Content-Type': 'application/json',
                'User-Agent': '@fleetbase/sdk;node',
            },
        });

        /**
         * Sets up Axios interceptors for response success and error handling.
         *
         * Success:
         *  - Returns `response.data` by default.
         *
         * Error:
         *  - If the server returned a response, checks for `data.errors` or `data.error` and throws an Error accordingly.
         *  - Otherwise, re-throws the original error to preserve stack trace.
         */
        this.axiosInstance.interceptors.response.use(
            /**
             * Transform successful responses by returning only `response.data`.
             *
             * @param {import('axios').AxiosResponse} response - The successful Axios response object
             * @returns {any} - The `data` property of the response, containing the actual payload
             */
            (response) => response.data,

            /**
             * Handle error responses, extracting relevant information from the response payload.
             *
             * @param {import('axios').AxiosError} error - The error object thrown by Axios
             * @throws {Error} - An Error instance with a message derived from the server response
             */
            (error) => {
                if (error.response) {
                    const { data } = error.response;

                    if (isArray(data.errors) && data.errors.length) {
                        throw new Error(data.errors[0]);
                    } else if (data.error) {
                        throw new Error(data.error);
                    }
                }
                throw error;
            }
        );
    }

    /**
     * Merges the provided headers with existing default headers.
     *
     * @param {Object} [headers={}] - Additional headers to add or override.
     * @returns {NodeAdapter} - The current instance of NodeAdapter for method chaining.
     *
     * @example
     * adapter.setHeaders({ 'X-Custom-Header': 'my-value' });
     */
    setHeaders(headers = {}) {
        this.axiosInstance.defaults.headers.common = {
            ...this.axiosInstance.defaults.headers.common,
            ...headers,
        };
        return this;
    }

    /**
     * A generic method to make an HTTP request with Axios.
     * This method is utilized internally by specialized request methods such as `get`, `post`, etc.
     *
     * @private
     * @param {string} method - HTTP verb (e.g., GET, POST, PUT, DELETE, PATCH).
     * @param {string} url - The URL path (relative to `baseURL`).
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request configuration.
     * @returns {Promise<any>} - A promise resolving to the response data or rejecting with an Error.
     *
     * @example
     * // Example usage inside another method:
     * this.request('GET', '/users', { params: { limit: 50 } });
     */
    request(method, url, options = {}) {
        return this.axiosInstance.request({
            method,
            url,
            ...options,
        });
    }

    /**
     * Makes a GET request.
     *
     * @param {string} path - The endpoint path, relative to `baseURL`.
     * @param {Object} [query={}] - Query parameters to include in the request URL.
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request options.
     * @returns {Promise<any>} - A promise that resolves with the response data or rejects with an Error.
     *
     * @example
     * adapter.get('/users', { limit: 25 }).then(data => {
     *   console.log(data);
     * }).catch(err => {
     *   console.error(err);
     * });
     */
    get(path, query = {}, options = {}) {
        return this.request('GET', path, { params: query, ...options });
    }

    /**
     * Makes a POST request.
     *
     * @param {string} path - The endpoint path, relative to `baseURL`.
     * @param {Object} [data={}] - The request body payload.
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request options.
     * @returns {Promise<any>} - A promise that resolves with the response data or rejects with an Error.
     *
     * @example
     * adapter.post('/users', { name: 'John Doe' }).then(data => {
     *   console.log(data);
     * }).catch(err => {
     *   console.error(err);
     * });
     */
    post(path, data = {}, options = {}) {
        return this.request('POST', path, { data, ...options });
    }

    /**
     * Makes a PUT request.
     *
     * @param {string} path - The endpoint path, relative to `baseURL`.
     * @param {Object} [data={}] - The updated data to send in the request body.
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request options.
     * @returns {Promise<any>} - A promise that resolves with the response data or rejects with an Error.
     *
     * @example
     * adapter.put('/users/123', { name: 'Jane Doe' }).then(data => {
     *   console.log(data);
     * }).catch(err => {
     *   console.error(err);
     * });
     */
    put(path, data = {}, options = {}) {
        return this.request('PUT', path, { data, ...options });
    }

    /**
     * Makes a DELETE request.
     *
     * @param {string} path - The endpoint path, relative to `baseURL`.
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request options.
     * @returns {Promise<any>} - A promise that resolves with the response data or rejects with an Error.
     *
     * @example
     * adapter.delete('/users/123').then(data => {
     *   console.log(data);
     * }).catch(err => {
     *   console.error(err);
     * });
     */
    delete(path, options = {}) {
        return this.request('DELETE', path, options);
    }

    /**
     * Makes a PATCH request.
     *
     * @param {string} path - The endpoint path, relative to `baseURL`.
     * @param {Object} [data={}] - Partial data to update on the server.
     * @param {import('axios').AxiosRequestConfig} [options={}] - Additional Axios request options.
     * @returns {Promise<any>} - A promise that resolves with the response data or rejects with an Error.
     *
     * @example
     * adapter.patch('/users/123', { email: 'new_email@example.com' }).then(data => {
     *   console.log(data);
     * }).catch(err => {
     *   console.error(err);
     * });
     */
    patch(path, data = {}, options = {}) {
        return this.request('PATCH', path, { data, ...options });
    }
}

register('adapter', 'NodeAdapter', NodeAdapter);
