import Resource from '../resource';
import { StoreActions } from '../utils';

const orderActions = new StoreActions({
    getDistanceAndTime: function (id, options = {}) {
        return this.adapter.get(`${this.namespace}/${id}/distance-and-time`, {}, options);
    },
});

class Order extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'order', { actions: orderActions, ...options });
    }

    getDistanceAndTime() {
        return this.store.getDistanceAndTime(this.id);
    }
}

export default Order;

export { orderActions };