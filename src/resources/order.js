import Resource from '../resource';
import { StoreActions, isResource } from '../utils';

const orderActions = new StoreActions({
    getDistanceAndTime: function (id, params = {}, options = {}) {
        return this.adapter.get(`${this.namespace}/${id}/distance-and-time`, params, options);
    },

    getNextActivity: function (id, params = {}, options = {}) {
        return this.adapter.get(`${this.namespace}/${id}/next-activity`, params, options);
    },

    dispatch: function (id, params = {}, options = {}) {
        return this.adapter.post(`${this.namespace}/${id}/dispatch`, params, options).then(this.afterFetch.bind(this));
    },

    start: function (id, params = {}, options = {}) {
        return this.adapter.post(`${this.namespace}/${id}/start`, params, options).then(this.afterFetch.bind(this));
    },

    updateActivity: function (id, params = {}, options = {}) {
        return this.adapter.post(`${this.namespace}/${id}/update-activity`, params, options).then(this.afterFetch.bind(this));
    },

    setDestination: function (id, destinationId, params = {}, options = {}) {
        if (isResource(destinationId)) {
            destinationId = destinationId.id;
        }

        return this.adapter.post(`${this.namespace}/${id}/set-destination/${destinationId}`, params, options).then(this.afterFetch.bind(this));
    },

    captureQrCode: function (id, subjectId = null, params = {}, options = {}) {
        if (isResource(subjectId)) {
            subjectId = subjectId.id;
        }

        return this.adapter.post(`${this.namespace}/${id}/capture-qr${!subjectId ? '' : '/' + subjectId}`, params, options);
    },

    captureSignature: function (id, subjectId = null, params = {}, options = {}) {
        if (isResource(subjectId)) {
            subjectId = subjectId.id;
        }

        return this.adapter.post(`${this.namespace}/${id}/capture-signature${!subjectId ? '' : '/' + subjectId}`, params, options);
    },

    complete: function (id, params = {}, options = {}) {
        return this.adapter.post(`${this.namespace}/${id}/complete`, params, options).then(this.afterFetch.bind(this));
    },

    cancel: function (id, params = {}, options = {}) {
        return this.adapter.delete(`${this.namespace}/${id}/cancel`, params, options).then(this.afterFetch.bind(this));
    },
});

class Order extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'order', { actions: orderActions, ...options });
    }

    getDistanceAndTime(params = {}, options = {}) {
        return this.store.getDistanceAndTime(this.id, params, options);
    }

    dispatch(params = {}, options = {}) {
        return this.store.dispatch(this.id, params, options);
    }

    start(params = {}, options = {}) {
        return this.store.start(this.id, params, options);
    }

    setDestination(destinationId, params = {}, options = {}) {
        return this.store.setDestination(this.id, destinationId, params, options);
    }

    captureQrCode(subjectId = null, params = {}, options = {}) {
        return this.store.captureQrCode(this.id, subjectId, params, options);
    }

    captureSignature(subjectId = null, params = {}, options = {}) {
        return this.store.captureSignature(this.id, subjectId, params, options);
    }

    getNextActivity(params = {}, options = {}) {
        return this.store.getNextActivity(this.id, params, options);
    }

    updateActivity(params = {}, options = {}) {
        return this.store.updateActivity(this.id, params, options);
    }

    cancel(params = {}, options = {}) {
        return this.store.cancel(this.id, params, options);
    }

    complete(params = {}, options = {}) {
        return this.store.complete(this.id, params, options);
    }

    get isDispatched() {
        return this.getAttribute('dispatched_at') !== null;
    }

    get isNotDispatched() {
        return this.getAttribute('dispatched_at') == null;
    }

    get isStarted() {
        return this.getAttribute('started_at') !== null;
    }

    get isNotStarted() {
        return this.getAttribute('started_at') == null;
    }

    get isCompleted() {
        return this.getAttribute('status') == 'completed';
    }

    get isCanceled() {
        return this.getAttribute('status') == 'canceled';
    }

    get isEnroute() {
        return this.getAttribute('status') == 'driver_enroute' || this.getAttribute('status') === 'enroute';
    }

    get isInProgress() {
        return this.isStarted && !this.isCanceled && !this.isCompleted;
    }

    get scheduledAt() {
        return this.isAttributeFilled('scheduled_at') ? new Date(this.getAttribute('scheduled_at')) : null;
    }

    get startedAt() {
        return this.isAttributeFilled('started_at') ? new Date(this.getAttribute('started_at')) : null;
    }

    get dispatchedAt() {
        return this.isAttributeFilled('dispatched_at') ? new Date(this.getAttribute('dispatched_at')) : null;
    }

    get status() {
        return this.getAttribute('status');
    }
}

export default Order;

export { orderActions };
