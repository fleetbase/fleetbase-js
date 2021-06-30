import Resource from '../resource';

class Place extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'place', options);
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
