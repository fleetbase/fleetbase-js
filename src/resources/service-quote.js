import Resource from '../resource.js';
import { register } from '../registry.js';

export default class ServiceQuote extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'service-quote', options);
    }

    fromPreliminary() {}

    fromPayload() {}
}

register('resource', 'ServiceQuote', ServiceQuote);
