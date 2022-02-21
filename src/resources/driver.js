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

    retrieve: function (id) {
        return this.findRecord(id);
    },
});

class Driver extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'driver', options);
    }

    get token() {
        return this.getAttribute('token');
    }

    get isOnline() {
        return this.getAttribute('online') === true;
    }

    syncDevice(token) {
        return this.adapter
            .setHeaders({ 'Driver-Token': this.token })
            .post('drivers/register-device', token)
            .then(() => {
                return this;
            });
    }
}

export default Driver;
export { driverActions };
