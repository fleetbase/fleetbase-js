import Resource from '../resource';
import { StoreActions } from '../utils';

const organizationActions = new StoreActions({
    current: function (params = {}, options = {}) {
        return this.adapter.get(`${this.namespace}/current`, params, options);
    },
});

class Organization extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'organization', { actions: organizationActions, ...options });
    }
}

export default Organization;
export { organizationActions };
