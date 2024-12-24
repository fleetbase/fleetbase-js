'use strict';

/**
 * Javascript String
 *
 * instance
 * new String('hello_world').humanize().get() => "Hello world"
 *
 * instance
 * const string = new String();
 * string.humanize('hello_world').get() => "Hello world"
 *
 * no chain
 * new String('hello_world', false).humanize() => "Hello world"
 *
 * static
 * String.invoke('humanize', 'hello_world') => "Hello world"
 *
 * exports {}
 * humanize('hello_world') => "Hello world"
 */

export default class String {
    constructor(string, chain = true) {
        this.str = string;
        this.chain = chain;
    }

    uncountableWords = ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news'];

    pluralRules = [
        [new RegExp('(m)an$', 'gi'), '$1en'],
        [new RegExp('(pe)rson$', 'gi'), '$1ople'],
        [new RegExp('(child)$', 'gi'), '$1ren'],
        [new RegExp('^(ox)$', 'gi'), '$1en'],
        [new RegExp('(ax|test)is$', 'gi'), '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'), '$1i'],
        [new RegExp('(alias|status)$', 'gi'), '$1es'],
        [new RegExp('(bu)s$', 'gi'), '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'), '$1a'],
        [new RegExp('sis$', 'gi'), 'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
        [new RegExp('(hive)$', 'gi'), '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
        [new RegExp('(quiz)$', 'gi'), '$1zes'],
        [new RegExp('s$', 'gi'), 's'],
        [new RegExp('$', 'gi'), 's'],
    ];

    singularRules = [
        [new RegExp('(m)en$', 'gi'), '$1an'],
        [new RegExp('(pe)ople$', 'gi'), '$1rson'],
        [new RegExp('(child)ren$', 'gi'), '$1'],
        [new RegExp('([ti])a$', 'gi'), '$1um'],
        [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', 'gi'), '$1$2sis'],
        [new RegExp('(hive)s$', 'gi'), '$1'],
        [new RegExp('(tive)s$', 'gi'), '$1'],
        [new RegExp('(curve)s$', 'gi'), '$1'],
        [new RegExp('([lr])ves$', 'gi'), '$1f'],
        [new RegExp('([^fo])ves$', 'gi'), '$1fe'],
        [new RegExp('([^aeiouy]|qu)ies$', 'gi'), '$1y'],
        [new RegExp('(s)eries$', 'gi'), '$1eries'],
        [new RegExp('(m)ovies$', 'gi'), '$1ovie'],
        [new RegExp('(x|ch|ss|sh)es$', 'gi'), '$1'],
        [new RegExp('([m|l])ice$', 'gi'), '$1ouse'],
        [new RegExp('(bus)es$', 'gi'), '$1'],
        [new RegExp('(o)es$', 'gi'), '$1'],
        [new RegExp('(shoe)s$', 'gi'), '$1'],
        [new RegExp('(cris|ax|test)es$', 'gi'), '$1is'],
        [new RegExp('(octop|vir)i$', 'gi'), '$1us'],
        [new RegExp('(alias|status)es$', 'gi'), '$1'],
        [new RegExp('^(ox)en', 'gi'), '$1'],
        [new RegExp('(vert|ind)ices$', 'gi'), '$1ex'],
        [new RegExp('(matr)ices$', 'gi'), '$1ix'],
        [new RegExp('(quiz)zes$', 'gi'), '$1'],
        [new RegExp('s$', 'gi'), ''],
    ];

    nonTitlecasedWords = ['and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at', 'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over', 'with', 'for'];

    idSuffix = new RegExp('(_ids|_id)$', 'g');
    underbar = new RegExp('_', 'g');
    spaceOrUnderbar = new RegExp('[ _]', 'g');
    uppercase = new RegExp('([A-Z])', 'g');
    underbarPrefix = new RegExp('^_');

    get() {
        return this.str;
    }

    applyRules(str, rules, skip, override) {
        if (override) {
            str = override;
        } else {
            var ignore = skip.indexOf(str.toLowerCase()) > -1;
            if (!ignore) {
                for (var x = 0; x < rules.length; x++) {
                    if (str.match(rules[x][0])) {
                        str = str.replace(rules[x][0], rules[x][1]);
                        break;
                    }
                }
            }
        }

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.pluralize('person')           -> 'people'
        String.pluralize('octopus')          -> 'octopi'
        String.pluralize('Hat')              -> 'Hats'
        String.pluralize('person', 'guys')   -> 'guys'    
    */
    pluralize(str, plural = null) {
        str = str || this.str;

        return this.applyRules(str, this.pluralRules, this.uncountableWords, plural);
    }

    /*
        String.singularize('person')         -> 'person'
        String.singularize('octopi')         -> 'octopus'
        String.singularize('hats')           -> 'hat'
        String.singularize('guys', 'person') -> 'person'
    */
    singularize(str, singular) {
        str = str || this.str;

        return this.applyRules(str, this.singularRules, this.uncountableWords, singular);
    }

    /*
        String.camelize('message_properties')        -> 'MessageProperties'
        String.camelize('message_properties', true)  -> 'messageProperties'
    */
    camelize(str, lowFirstLetter) {
        str = str || this.str;

        let str_path = str.split('/');
        for (var i = 0; i < str_path.length; i++) {
            let str_arr = str_path[i].split('_');
            let initX = lowFirstLetter && i + 1 === str_path.length ? 1 : 0;

            for (let x = initX; x < str_arr.length; x++) {
                str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
            }
            str_path[i] = str_arr.join('');
        }
        str = str_path.join('::');

        // fix
        if (lowFirstLetter === true) {
            let first = str.charAt(0).toLowerCase();
            let last = str.slice(1);
            str = first + last;
        }

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.underscore('MessageProperties')       -> 'message_properties'
        String.underscore('messageProperties')       -> 'message_properties'
    */
    underscore(str) {
        str = str || this.str;

        var str_path = str.split('::');
        for (var i = 0; i < str_path.length; i++) {
            str_path[i] = str_path[i].replace(this.uppercase, '_$1');
            str_path[i] = str_path[i].replace(this.underbarPrefix, '');
        }
        str = str_path.join('/').toLowerCase();

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.humanize('message_properties')        -> 'Message properties'
        String.humanize('message_properties')        -> 'message properties'
    */
    humanize(str, lowFirstLetter) {
        str = str || this.str;

        var str = str.toLowerCase();
        str = str.replace(this.idSuffix, '');
        str = str.replace(this.underbar, ' ');
        if (!lowFirstLetter) {
            str = this.capitalize(str);
        }

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.capitalize('message_properties')      -> 'Message_properties'
        String.capitalize('message properties')      -> 'Message properties'
    */
    capitalize(str) {
        str = str || this.str;

        str = str.toLowerCase();
        str = str.substring(0, 1).toUpperCase() + str.substring(1);

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.dasherize('message_properties')       -> 'message-properties'
        String.dasherize('message properties')       -> 'message-properties'
    */
    dasherize(str) {
        str = str || this.str;

        str = str.replace(this.spaceOrUnderbar, '-');
        str = str.toLowerCase();

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.normify('message_properties')         -> 'Message Properties'
        String.normify('message properties')         -> 'Message Properties'
        Inflactor.normify('Message_propertyId', true)   -> 'Message Properties Id'
    */
    normify(str, allFirstUpper) {
        str = str || this.str;

        //var str = str.toLowerCase();
        if (allFirstUpper === true) {
            str = this.camelize(str);
            str = this.underscore(str);
        } else {
            str = str.toLowerCase();
        }

        str = str.replace(this.underbar, ' ');
        var str_arr = str.split(' ');
        for (var x = 0; x < str_arr.length; x++) {
            var d = str_arr[x].split('-');
            for (var i = 0; i < d.length; i++) {
                if (this.nonTitlecasedWords.indexOf(d[i].toLowerCase()) < 0) {
                    d[i] = this.capitalize(d[i]);
                }
            }
            str_arr[x] = d.join('-');
        }
        str = str_arr.join(' ');
        str = str.substring(0, 1).toUpperCase() + str.substring(1);

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.demodulize('Message::Bus::Properties')    -> 'Properties'
    */
    demodulize(str) {
        str = str || this.str;

        var str_arr = str.split('::');
        str = str_arr[str_arr.length - 1];

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.tableize('MessageBusProperty')    -> 'message_bus_properties'
    */
    tableize(str) {
        str = str || this.str;

        str = this.pluralize(this.underscore(str));

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.classify('message_bus_properties')    -> 'MessageBusProperty'
    */
    classify(str) {
        str = str || this.str;

        str = this.singularize(this.camelize(str));

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.foreignKey('MessageBusProperty')       -> 'message_bus_property_id'
        String.foreignKey('MessageBusProperty', true) -> 'message_bus_propertyid'
    */
    foreignKey(str, dropIdUbar = false) {
        str = str || this.str;

        str = this.underscore(this.demodulize(str)) + (dropIdUbar ? '' : '_') + 'id';

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /*
        String.ordinalize('the 1 pitch')     -> 'the 1st pitch'
    */
    ordinalize(str) {
        str = str || this.str;

        var str_arr = str.split(' ');
        for (var x = 0; x < str_arr.length; x++) {
            var i = parseInt(str_arr[x]);
            if (i === NaN) {
                var ltd = str_arr[x].substring(str_arr[x].length - 2);
                var ld = str_arr[x].substring(str_arr[x].length - 1);
                var suf = 'th';
                if (ltd != '11' && ltd != '12' && ltd != '13') {
                    if (ld === '1') {
                        suf = 'st';
                    } else if (ld === '2') {
                        suf = 'nd';
                    } else if (ld === '3') {
                        suf = 'rd';
                    }
                }
                str_arr[x] += suf;
            }
        }
        str = str_arr.join(' ');

        // set str
        this.str = str;

        if (this.chain === true) {
            return this;
        }

        // return result
        return str;
    }

    /**
     * @method invoke
     **/
    static invoke() {
        const argz = Object.values(arguments);
        const instance = new String(null, false);
        const method = arguments[0];
        argz.shift();

        if (typeof instance[method] === 'function') {
            return instance[method](...argz);
        }

        return null;
    }
}

const pluralize = function () {
    const argz = ['pluralize', ...arguments];

    return String.invoke(...argz);
};

const singularize = function () {
    const argz = ['singularize', ...arguments];

    return String.invoke(...argz);
};

const humanize = function () {
    const argz = ['humanize', ...arguments];

    return String.invoke(...argz);
};

const underscore = function () {
    const argz = ['underscore', ...arguments];

    return String.invoke(...argz);
};

const camelize = function () {
    const argz = ['camelize', ...arguments];

    return String.invoke(...argz);
};

const capitalize = function () {
    const argz = ['capitalize', ...arguments];

    return String.invoke(...argz);
};

const dasherize = function () {
    const argz = ['dasherize', ...arguments];

    return String.invoke(...argz);
};

const normify = function () {
    const argz = ['normify', ...arguments];

    return String.invoke(...argz);
};

const demodulize = function () {
    const argz = ['demodulize', ...arguments];

    return String.invoke(...argz);
};

const tableize = function () {
    const argz = ['tableize', ...arguments];

    return String.invoke(...argz);
};

const classify = function () {
    const argz = ['classify', ...arguments];

    return String.invoke(...argz);
};

const foreignKey = function () {
    const argz = ['foreignKey', ...arguments];

    return String.invoke(...argz);
};

export { pluralize, singularize, humanize, underscore, camelize, capitalize, dasherize, normify, demodulize, tableize, classify, foreignKey };
