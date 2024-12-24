export default GoogleAddress;
declare class GoogleAddress {
    constructor(place: any);
    place: any;
    geometry: any;
    components: any;
    attributes: {
        streetNumber: any;
        streetName: any;
        coordinates: any[];
        city: any;
        county: any;
        stateShort: any;
        stateLong: any;
        countryShort: any;
        country: any;
        countryLong: any;
        postalCode: any;
    };
    parse(): void;
    parseComponents(): any;
    parseProperties(): {
        streetNumber: any;
        streetName: any;
        coordinates: any[];
        city: any;
        county: any;
        stateShort: any;
        stateLong: any;
        countryShort: any;
        country: any;
        countryLong: any;
        postalCode: any;
    };
    all(): {
        streetNumber: any;
        streetName: any;
        coordinates: any[];
        city: any;
        county: any;
        stateShort: any;
        stateLong: any;
        countryShort: any;
        country: any;
        countryLong: any;
        postalCode: any;
    };
    or(keys?: any[]): any;
    has(key: any): boolean;
    get(key: any, short?: boolean): any;
    setAttributes(attributes?: {}): this;
    setAttribute(key: any, value: any): this;
    getAttribute(key: any): any;
}
