import Place from './place';

class Waypoint extends Place {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'waypoint', options);
    }
}

export default Waypoint;
