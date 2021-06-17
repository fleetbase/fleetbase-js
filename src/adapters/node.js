import Adapter from '../adapter';
import axios from 'axios';

class NodeAdapter extends Adapter {
    constructor(config) {
        super(config);

        this.axios = axios.create({
            baseURL: `${this.host}/${this.namespace}`,
            headers: {
                Authorization: `Bearer ${config.publicKey}`,
                'Content-Type': 'application/json',
                'User-Agent': '@fleetbase/sdk;node',
            },
        });
    }

    /**
     * Tranform the response, and return the response data from axios.
     *
     * @param {AxiosResponse} response
     * @returns {Object}
     */
    transform(response) {
        return response.data;
    }

    /**
     * Makes a GET request with axios
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    get(path, query = {}, options = {}) {
        const urlParams = !isBlank(query) ? new URLSearchParams(query).toString() : '';

        return this.axios.get(`${path}${urlParams ? `?${urlParams}` : ''}`, options).then(this.transform.bind(this));
    }

    /**
     * Makes a POST request with axios
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    post(path, data = {}, options = {}) {
        return this.axios.post(path, data, options).then(this.transform.bind(this));
    }

    /**
     * Makes a PUT request with axios
     *
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    put(path, data = {}, options = {}) {
        return this.axios.put(path, data, options).then(this.transform.bind(this));
    }

    /**
     * Makes a DELETE request with axios
     *
     * @param {String} path
     * @param {Object} query
     * @param {Object} options
     *
     * @return {Promise}
     */
    delete(path, options = {}) {
        return this.axios.delete(path, options).then(this.transform.bind(this));
    }

    /**
     * Makes a PATCH request with axios
     * @param {String} path
     * @param {Object} data
     * @param {Object} options
     *
     * @return {Promise}
     */
    patch(path, data = {}, options = {}) {
        return this.axios.patch(path, data, options).then(this.transform.bind(this));
    }
}

export default NodeAdapter;
