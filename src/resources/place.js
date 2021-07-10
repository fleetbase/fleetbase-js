import Resource from '../resource';

class Place extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'place', options);
    }

    static fromGoogleAddress(googleAddress, adapter, options = {}) {
        const attributes = {
            name: null,
            address: googleAddress.getAttribute('address'),
            location: googleAddress.getAttribute('coordinates'),
            street1: googleAddress.getAttribute('streetName'),
            street2: null,
            city: googleAddress.getAttribute('city'),
            province: googleAddress.getAttribute('stateLong'),
            postal_code: googleAddress.getAttribute('postalCode'),
            neighborhood: googleAddress.get('neighborhood'),
            district: googleAddress.getAttribute('county'),
            building: googleAddress.get('building'),
            country: googleAddress.getAttribute('countryShort'),
            phone: null,
            security_access_code: null
        };

        return new Place(attributes, adapter, options);
    }

    /**
     * The latitude coordinate for the 'Place' location.
     * 
     * @var {Integer}
     */
    get latitude() {
        return this.getAttribute('location').coordinates[1];
    }

    /**
     * The longitude coordinate for the 'Place' location.
     * 
     * @var {Integer}
     */
    get longitude() {
        return this.getAttribute('location').coordinates[0];
    }

    /**
     * Array coordinate pair for Place location.
     * 
     * @var {Array}
     */
    get coordinates() {
        const { latitude, longitude } = this;

        return  [ latitude, longitude ];
    }
}

export default Place;
