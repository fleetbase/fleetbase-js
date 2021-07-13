import Resource from '../resource';

class Contact extends Resource {
    constructor(attributes = {}, adapter, options = {}) {
        super(attributes, adapter, 'contact', options);
    }
}

export default Contact;
