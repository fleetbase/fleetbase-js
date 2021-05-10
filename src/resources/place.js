'use strict';

import Model from '../model';

class Place extends Model {
    constructor(attributes = {}, version = 'v1', adapter) {
        super(attributes, version, 'place', adapter);
    }
};

export default Place;