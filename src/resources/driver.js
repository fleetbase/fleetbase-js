import Resource from '../resource';
import { StoreActions, isPhone, isEmail } from '../utils';

const driverActions = new StoreActions({
    // const { error } = await fleetbase.drivers.login('+1 111-1111');
    login: function (identity, password = null, attributes = {}) {
        // handle phone number authentication
        if (isPhone(identity)) {
            return this.adapter.post('drivers/login-with-sms', { phone: identity });
        }

        if (!password) {
            throw new Error('Login requires password!');
        }

        return this.adapter.post('drivers/login', { identity, password, ...attributes }).then(this.afterFetch.bind(this));
    },

    verifyCode: function (identity, code, attributes = {}) {
        return this.adapter.post('drivers/verify-code', { identity, code, ...attributes }).then(this.afterFetch.bind(this));
    },

    track: function (id, params = {}, options = {}) {
        return this.adapter.post(`drivers/${id}/track`, params, options).then(this.afterFetch.bind(this));
    },

    retrieve: function (id) {
        return this.findRecord(id);
    },

    syncDevice(id, params = {}, options = {}) {
        return this.adapter.post(`drivers/${id}/register-device`, params, options);
    },
});

class Driver extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'driver', { actions: driverActions, ...options });
    }

    get token() {
        return this.getAttribute('token');
    }

    get isOnline() {
        return this.getAttribute('online') === true;
    }

    /**
     * The latitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get latitude() {
        return this.getAttribute('location', new Point())?.coordinates[1];
    }

    /**
     * The longitude coordinate for the 'Place' location.
     *
     * @var {Integer}
     */
    get longitude() {
        return this.getAttribute('location', new Point())?.coordinates[0];
    }

    /**
     * Array coordinate pair for Place location.
     *
     * @var {Array}
     */
    get coordinates() {
        const { latitude, longitude } = this;

        return [latitude, longitude];
    }

    track(params = {}, options = {}) {
        return this.store.track(this.id, params, options);
    }

    syncDevice(params = {}, options = {}) {
        return this.store.syncDevice(this.id, params, options);
    }
}

export default Driver;
export { driverActions };
