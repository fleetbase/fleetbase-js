import Adapter from '../adapter.js';
import { register } from '../registry.js';
import { isBlank } from '../utils/index.js';

/**
 * @class BrowserAdapter
 * @extends Adapter
 *
 * @classdesc
 * The BrowserAdapter extends the base Adapter for browser-based environments.
 * It leverages the Fetch API to make HTTP requests and handles JSON parsing, headers,
 * and error propagation.
 *
 * @example
 * // Example usage:
 * const adapter = new BrowserAdapter({
 *   publicKey: 'MY_PUBLIC_KEY',
 *   host: 'https://api.example.com',
 *   namespace: 'v1'
 * });
 *
 * adapter.get('users')
 *   .then(users => console.log(users))
 *   .catch(error => console.error(error));
 */
export default class BrowserAdapter extends Adapter {
    /**
     * Initializes a BrowserAdapter instance by configuring default headers,
     * including Authorization and Content-Type.
     *
     * @param {Object} config - Configuration object for the adapter.
     * @param {string} config.publicKey - A valid public key for authorization.
     * @param {string} [config.host='https://api.example.com'] - The base URL or domain for the API.
     * @param {string} [config.namespace='v1'] - A namespace or version for the API.
     */
    constructor(config) {
        super(config);

        // Set default headers
        this.setHeaders({
            Authorization: `Bearer ${config.publicKey}`,
            'Content-Type': 'application/json',
            'User-Agent': '@fleetbase/sdk;browser',
        });
    }

    /**
     * Updates the adapter’s request headers.
     *
     * @param {Object} [headers={}] - An object of header key-value pairs.
     * @returns {BrowserAdapter} Returns the current adapter instance for method chaining.
     *
     * @example
     * adapter.setHeaders({
     *   'X-Custom-Header': 'SomeValue'
     * }).get('users');
     */
    setHeaders(headers = {}) {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    /**
     * Parses JSON from a fetch Response object.
     *
     * @private
     * @param {Response} response - The Fetch API response object.
     * @returns {Promise<{ statusText: string, status: number, ok: boolean, json: any }>}
     * A promise that resolves with an object containing:
     *  - `statusText`: The status text from the response
     *  - `status`: The numeric HTTP status
     *  - `ok`: A boolean indicating if the request was successful (status in the 200–299 range)
     *  - `json`: The parsed JSON from the response body
     *
     * @example
     * fetch('/api')
     *   .then(this.parseJSON)
     *   .then(({ json }) => console.log(json));
     */
    parseJSON(response) {
        return new Promise((resolve, reject) => {
            response
                .json()
                .then((json) => {
                    resolve({
                        statusText: response.statusText,
                        status: response.status,
                        ok: response.ok,
                        json,
                    });
                })
                .catch(() => {
                    reject(new Error('Oops! Something went wrong when handling your request.'));
                });
        });
    }

    /**
     * The base method for sending fetch requests. Manages headers, HTTP method,
     * and body serialization where necessary.
     *
     * @private
     * @param {string} path - The endpoint path (relative to `this.host/this.namespace`).
     * @param {string} [method='GET'] - The HTTP method (GET, POST, PUT, DELETE, PATCH).
     * @param {Object} [data={}] - The request payload. Usually includes `body`.
     * @param {Object} [options={}] - Additional fetch options (e.g. `mode`, `headers`, or `url` override).
     * @returns {Promise<any>} A promise resolving to the parsed JSON data or rejecting with an error.
     *
     * @example
     * this.request('users', 'POST', { body: JSON.stringify({ name: 'John' }) })
     *   .then(responseData => console.log(responseData));
     */
    request(path, method = 'GET', data = {}, options = {}) {
        return new Promise((resolve, reject) => {
            fetch(
                options.url || `${this.host}/${this.namespace}/${path}`, // Fallback to constructed URL if options.url is not provided
                {
                    method,
                    mode: options.mode || 'cors',
                    headers: new Headers({
                        ...(this.headers || {}),
                        ...(options.headers || {}),
                    }),
                    ...data, // Typically { body: JSON.stringify(payload) }
                }
            )
                .then(this.parseJSON)
                .then((response) => {
                    if (response.ok) {
                        // If the HTTP status code is 2xx, resolve with JSON data
                        return resolve(response.json);
                    }
                    // Otherwise, reject with error message or fallback to status text
                    reject(new Error(response.json.errors ? response.json.errors[0] : response.statusText));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * Issues a GET request to the specified path, optionally with query parameters.
     *
     * @param {string} path - The endpoint path.
     * @param {Object} [query={}] - Query parameters to append to the request URL.
     * @param {Object} [options={}] - Additional fetch options.
     * @returns {Promise<any>} A promise that resolves with the fetched data or rejects with an error.
     *
     * @example
     * // GET /users?limit=10
     * adapter.get('users', { limit: 10 })
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    get(path, query = {}, options = {}) {
        const urlParams = !isBlank(query) ? new URLSearchParams(query).toString() : '';
        return this.request(`${path}${urlParams ? `?${urlParams}` : ''}`, 'GET', {}, options);
    }

    /**
     * Issues a POST request with a JSON body.
     *
     * @param {string} path - The endpoint path.
     * @param {Object} [data={}] - The request payload, which will be stringified as JSON.
     * @param {Object} [options={}] - Additional fetch options.
     * @returns {Promise<any>} A promise that resolves with the server response or rejects with an error.
     *
     * @example
     * adapter.post('users', { name: 'John Doe' })
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    post(path, data = {}, options = {}) {
        return this.request(path, 'POST', { body: JSON.stringify(data) }, options);
    }

    /**
     * Issues a PUT request with a JSON body, commonly used for full updates.
     *
     * @param {string} path - The endpoint path.
     * @param {Object} [data={}] - The request payload, which will be stringified as JSON.
     * @param {Object} [options={}] - Additional fetch options.
     * @returns {Promise<any>} A promise that resolves with the server response or rejects with an error.
     *
     * @example
     * adapter.put('users/123', { name: 'Jane Doe' })
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    put(path, data = {}, options = {}) {
        return this.request(path, 'PUT', { body: JSON.stringify(data) }, options);
    }

    /**
     * Issues a DELETE request. Note that many APIs don't require a body for DELETE.
     *
     * @param {string} path - The endpoint path.
     * @param {Object} [options={}] - Additional fetch options.
     * @returns {Promise<any>} A promise that resolves with the server response or rejects with an error.
     *
     * @example
     * adapter.delete('users/123')
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    delete(path, options = {}) {
        return this.request(path, 'DELETE', {}, options);
    }

    /**
     * Issues a PATCH request with a JSON body, commonly used for partial updates.
     *
     * @param {string} path - The endpoint path.
     * @param {Object} [data={}] - The request payload, which will be stringified as JSON.
     * @param {Object} [options={}] - Additional fetch options.
     * @returns {Promise<any>} A promise that resolves with the server response or rejects with an error.
     *
     * @example
     * adapter.patch('users/123', { email: 'newemail@example.com' })
     *   .then(data => console.log(data))
     *   .catch(err => console.error(err));
     */
    patch(path, data = {}, options = {}) {
        return this.request(path, 'PATCH', { body: JSON.stringify(data) }, options);
    }
}

register('adapter', 'BrowserAdapter', BrowserAdapter);
