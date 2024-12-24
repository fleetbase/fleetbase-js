import Adapter from '../adapter';
import { isBlank } from '../utils';

class BrowserAdapter extends Adapter {
    /**
     * Setup browser adapter.
     * @param {Object} config
     */
    constructor(config) {
        super(config);

        this.setHeaders({
            Authorization: `Bearer ${config.publicKey}`,
            'Content-Type': 'application/json',
            'User-Agent': '@fleetbase/sdk;browser',
        });
    }

    /**
     * Updates the adapter headers.
     *
     * @param {Object} headers
     */
    setHeaders(headers = {}) {
        this.headers = { ...this.headers, ...headers };

        return this;
    }

    /**
     * Parses the JSON returned by a network request
     *
     * @param  {Object} response A response from a network request
     * @return {Object}          The parsed JSON, status from the response
     *
     * @return {Promise}
     */
    parseJSON(response) {
        return new Promise((resolve, reject) =>
            response
                .json()
                .then((json) =>
                    resolve({
                        statusText: response.statusText,
                        status: response.status,
                        ok: response.ok,
                        json,
                    })
                )
                .catch(() => {
                    reject(new Error('Oops! Something went wrong when handling your request.'));
                })
        );
    }

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
    request(path, method = 'GET', data = {}, options = {}) {
        return new Promise((resolve, reject) =>
            fetch(options.url || `${this.host}/${this.namespace}/${path}`, {
                method,
                mode: options.mode || 'cors',
                headers: new Headers({
                    ...(this.headers || {}),
                    ...(options.headers || {}),
                }),
                ...data,
            })
                .then(this.parseJSON)
                .then((response) => {
                    if (response.ok) {
                        return resolve(response.json);
                    }

                    return reject(new Error(response.json.errors ? response.json.errors[0] : response.statusText));
                })
                .catch((error) => {
                    reject(error);
                })
        );
    }

    /**
     * Makes a GET request with fetch
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    get(path, query = {}, options = {}) {
        const urlParams = !isBlank(query) ? new URLSearchParams(query).toString() : '';

        return this.request(`${path}${urlParams ? `?${urlParams}` : ''}`, 'GET', {}, options);
    }

    /**
     * Makes a POST request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    post(path, data = {}, options = {}) {
        return this.request(path, 'POST', { body: JSON.stringify(data) }, options);
    }

    /**
     * Makes a PUT request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    put(path, data = {}, options = {}) {
        return this.request(path, 'PUT', { body: JSON.stringify(data) }, options);
    }

    /**
     * Makes a DELETE request with fetch
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    delete(path, options = {}) {
        return this.request(path, 'DELETE', {}, options);
    }

    /**
     * Makes a PATCH request with fetch
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    patch(path, data = {}, options = {}) {
        return this.request(path, 'PATCH', { body: JSON.stringify(data) }, options);
    }
}

export default BrowserAdapter;
