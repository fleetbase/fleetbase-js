const { isArray } = Array;

class GoogleAddress {
    constructor(place) {
        this.place = place;
        this.geometry = place?.geometry;
        this.components = this.parseComponents();
        this.attributes = this.parseProperties();
    }

    parse() {
        this.parseComponents();
        this.parseProperties();
    }

    parseComponents() {
        const components = (this.place?.address_components || []).reduce(function (acc, data) {
            data.types.forEach(function (type) {
                acc[type] = data;
            });
            return acc;
        }, {});

        return components;
    }

    parseProperties() {
        const attributes = {
            streetNumber: this.get('street_number'),
            streetName: this.get('route'),
            coordinates: this.geometry?.location ? Object.values(this.geometry.location) : [0, 0],
            city: this.or(['locality', 'sublocality', 'sublocality_level_1', 'neighborhood', 'administrative_area_level_3', 'administrative_area_level_2']),
            county: this.get('administrative_area_level_2'),
            stateShort: this.get('administrative_area_level_1', true),
            stateLong: this.get('administrative_area_level_1'),
            countryShort: this.get('country', true),
            country: this.get('country', true),
            countryLong: this.get('country'),
            postalCode: this.get('postal_code'),
        };

        attributes.address = [attributes.streetNumber, attributes.streetName].filter(Boolean).join(' ');

        return attributes;
    }

    all() {
        return this.attributes;
    }

    or(keys = []) {
        for (const element of keys) {
            const key = element;

            if (isArray(key)) {
                const pkey = key[0];
                const short = key[1];

                if (this.has(pkey)) {
                    return this.get(pkey, short);
                }

                continue;
            }

            if (this.has(key)) {
                return this.get(key);
            }
        }

        return null;
    }

    has(key) {
        return key in this.components;
    }

    get(key, short = false) {
        if (!(key in this.components)) {
            return null;
        }

        return short ? this.components[key].short_name : this.components[key].long_name;
    }

    setAttributes(attributes = {}) {
        this.attributes = { ...this.attributes, ...attributes };

        return this;
    }

    setAttribute(key, value) {
        this.attributes[key] = value;

        return this;
    }

    getAttribute(key) {
        return this.attributes[key] || null;
    }
}

export default GoogleAddress;
