

import Model from '../model';

class Place extends Model {
    constructor(attributes = {}, adapter, version = 'v1') {
        super(attributes, version, 'place', adapter);
    }
}

export default Place;
