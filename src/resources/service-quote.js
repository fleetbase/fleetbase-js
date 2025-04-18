import Resource from '../resource.js';
import { register } from '../registry.js';
import { isResource } from '../resource.js';
import StoreActions from '../utils/store-actions.js';

export const serviceQuoteActions = new StoreActions({
    fromPayload(payload, params = {}) {
        if (isResource(payload)) {
            payload = payload.id;
        }

        return this.adapter.get(`${this.namespace}`, { payload, ...params }).then(this.afterFetch.bind(this));
    },

    fromPreliminary(params = {}) {
        return this.adapter.get(`${this.namespace}/preliminary`, { ...params }).then(this.afterFetch.bind(this));
    },
});

export default class ServiceQuote extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-quote', options);
    }

    fromPreliminary(params = {}) {
        return this.store.fromPreliminary(params);
    }

    fromPayload(payload, params = {}) {
        return this.store.fromPayload(payload, params);
    }
}

register('resource', 'ServiceQuote', ServiceQuote);
