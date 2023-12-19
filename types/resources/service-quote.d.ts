export default ServiceQuote;
declare class ServiceQuote extends Resource {
    constructor(attributes: {}, adapter: any, options?: {});
    fromPreliminary(): void;
    fromPayload(): void;
}
import Resource from '../resource';
