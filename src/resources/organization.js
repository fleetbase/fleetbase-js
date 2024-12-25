import Resource from '../resource.js';
import { register } from '../registry.js';
import { StoreActions } from '../utils/index.js';

export const organizationActions = new StoreActions({
    current: function (params = {}, options = {}) {
        return this.adapter.get(`${this.namespace}/current`, params, options);
    },
});

export default class Organization extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'organization', { actions: organizationActions, ...options });
    }
}

registerResource('resource', 'Organization', Organization);
