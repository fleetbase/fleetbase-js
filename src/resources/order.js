import Resource from '../resource';

class Order extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'order', options);
    }
}

export default Order;
