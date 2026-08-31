type Rule = readonly [RegExp, string];
type StringResult = FleetbaseString | string;

const UNCOUNTABLE = new Set(['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news']);
const PLURAL_RULES: Rule[] = [
    [/(m)an$/gi, '$1en'],
    [/(pe)rson$/gi, '$1ople'],
    [/(child)$/gi, '$1ren'],
    [/^(ox)$/gi, '$1en'],
    [/(ax|test)is$/gi, '$1es'],
    [/(octop|vir)us$/gi, '$1i'],
    [/(alias|status)$/gi, '$1es'],
    [/(bu)s$/gi, '$1ses'],
    [/(buffal|tomat|potat)o$/gi, '$1oes'],
    [/([ti])um$/gi, '$1a'],
    [/sis$/gi, 'ses'],
    [/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
    [/(hive)$/gi, '$1s'],
    [/([^aeiouy]|qu)y$/gi, '$1ies'],
    [/(x|ch|ss|sh)$/gi, '$1es'],
    [/(matr|vert|ind)ix|ex$/gi, '$1ices'],
    [/([m|l])ouse$/gi, '$1ice'],
    [/(quiz)$/gi, '$1zes'],
    [/s$/gi, 's'],
    [/$/gi, 's'],
];
const SINGULAR_RULES: Rule[] = [
    [/(status)$/gi, '$1'],
    [/(m)en$/gi, '$1an'],
    [/(pe)ople$/gi, '$1rson'],
    [/(child)ren$/gi, '$1'],
    [/([ti])a$/gi, '$1um'],
    [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/gi, '$1$2sis'],
    [/(hive)s$/gi, '$1'],
    [/(tive)s$/gi, '$1'],
    [/(curve)s$/gi, '$1'],
    [/([lr])ves$/gi, '$1f'],
    [/([^fo])ves$/gi, '$1fe'],
    [/([^aeiouy]|qu)ies$/gi, '$1y'],
    [/(s)eries$/gi, '$1eries'],
    [/(m)ovies$/gi, '$1ovie'],
    [/(x|ch|ss|sh)es$/gi, '$1'],
    [/([m|l])ice$/gi, '$1ouse'],
    [/(bus)es$/gi, '$1'],
    [/(o)es$/gi, '$1'],
    [/(shoe)s$/gi, '$1'],
    [/(cris|ax|test)es$/gi, '$1is'],
    [/(octop|vir)i$/gi, '$1us'],
    [/(alias|status)es$/gi, '$1'],
    [/^(ox)en/gi, '$1'],
    [/(vert|ind)ices$/gi, '$1ex'],
    [/(matr)ices$/gi, '$1ix'],
    [/(quiz)zes$/gi, '$1'],
    [/s$/gi, ''],
];
const NON_TITLE_CASED = new Set(['and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at', 'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over', 'with', 'for']);

export default class FleetbaseString {
    str: string;
    chain: boolean;

    constructor(value: unknown = '', chain = true) {
        this.str = value == null ? '' : String(value);
        this.chain = chain;
    }

    get(): string {
        return this.str;
    }

    private result(value: string): StringResult {
        this.str = value;
        return this.chain ? this : value;
    }

    private rules(value: string, rules: Rule[], override?: string | null): StringResult {
        let result = override ?? value;
        if (!override && !UNCOUNTABLE.has(value.toLowerCase())) {
            const rule = rules.find(([pattern]) => pattern.test(value));
            if (rule) {
                result = value.replace(rule[0], rule[1]);
            }
        }
        return this.result(result);
    }

    pluralize(value = this.str, override: string | null = null): StringResult {
        return this.rules(value, PLURAL_RULES, override);
    }

    singularize(value = this.str, override: string | null = null): StringResult {
        return this.rules(value, SINGULAR_RULES, override);
    }

    camelize(value = this.str, lowFirstLetter = false): StringResult {
        const result = value
            .split('/')
            .map((segment) =>
                segment
                    .split('_')
                    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
                    .join('')
            )
            .join('::');
        return this.result(lowFirstLetter ? `${result.charAt(0).toLowerCase()}${result.slice(1)}` : result);
    }

    underscore(value = this.str): StringResult {
        return this.result(
            value
                .split('::')
                .map((part) => part.replace(/([A-Z])/g, '_$1').replace(/^_/, ''))
                .join('/')
                .toLowerCase()
        );
    }

    humanize(value = this.str, lowFirstLetter = false): StringResult {
        const result = value
            .toLowerCase()
            .replace(/(_ids|_id)$/g, '')
            .replace(/_/g, ' ');
        return this.result(lowFirstLetter ? result : `${result.charAt(0).toUpperCase()}${result.slice(1)}`);
    }

    capitalize(value = this.str): StringResult {
        const lower = value.toLowerCase();
        return this.result(`${lower.charAt(0).toUpperCase()}${lower.slice(1)}`);
    }

    dasherize(value = this.str): StringResult {
        return this.result(value.replace(/[ _]/g, '-').toLowerCase());
    }

    normify(value = this.str, allFirstUpper = false): StringResult {
        const normalized = allFirstUpper ? underscore(camelize(value)) : value.toLowerCase();
        const words = normalized
            .replace(/_/g, ' ')
            .split(' ')
            .map((word) =>
                word
                    .split('-')
                    .map((part) => (NON_TITLE_CASED.has(part.toLowerCase()) ? part : capitalize(part)))
                    .join('-')
            );
        const result = words.join(' ');
        return this.result(`${result.charAt(0).toUpperCase()}${result.slice(1)}`);
    }

    demodulize(value = this.str): StringResult {
        return this.result(value.split('::').at(-1)!);
    }

    tableize(value = this.str): StringResult {
        return this.result(pluralize(underscore(value)));
    }

    classify(value = this.str): StringResult {
        const normalized = String(value)
            .trim()
            .replace(/[\s_-]+/g, '_');
        return this.result(camelize(singularize(normalized)));
    }

    foreignKey(value = this.str, dropIdUnderscore = false): StringResult {
        return this.result(`${underscore(demodulize(value))}${dropIdUnderscore ? '' : '_'}id`);
    }

    ordinalize(value = this.str): StringResult {
        const result = value
            .split(' ')
            .map((part) => {
                if (!/^\d+$/.test(part)) {
                    return part;
                }
                const number = Number(part);
                const finalTwo = number % 100;
                const suffix = finalTwo >= 11 && finalTwo <= 13 ? 'th' : number % 10 === 1 ? 'st' : number % 10 === 2 ? 'nd' : number % 10 === 3 ? 'rd' : 'th';
                return `${part}${suffix}`;
            })
            .join(' ');
        return this.result(result);
    }

    static invoke(method: keyof FleetbaseString, ...args: unknown[]): string | null {
        const instance = new FleetbaseString('', false);
        const candidate = instance[method];
        if (typeof candidate !== 'function') {
            return null;
        }
        return String((candidate as (...values: unknown[]) => unknown).apply(instance, args));
    }
}

export const pluralize = (value: string, override?: string | null): string => String(new FleetbaseString('', false).pluralize(value, override));
export const singularize = (value: string, override?: string | null): string => String(new FleetbaseString('', false).singularize(value, override));
export const humanize = (value: string, lowFirstLetter?: boolean): string => String(new FleetbaseString('', false).humanize(value, lowFirstLetter));
export const underscore = (value: string): string => String(new FleetbaseString('', false).underscore(value));
export const camelize = (value: string, lowFirstLetter?: boolean): string => String(new FleetbaseString('', false).camelize(value, lowFirstLetter));
export const capitalize = (value: string): string => String(new FleetbaseString('', false).capitalize(value));
export const dasherize = (value: string): string => String(new FleetbaseString('', false).dasherize(value));
export const normify = (value: string, allFirstUpper?: boolean): string => String(new FleetbaseString('', false).normify(value, allFirstUpper));
export const demodulize = (value: string): string => String(new FleetbaseString('', false).demodulize(value));
export const tableize = (value: string): string => String(new FleetbaseString('', false).tableize(value));
export const classify = (value: string): string => String(new FleetbaseString('', false).classify(value));
export const foreignKey = (value: string, dropIdUnderscore?: boolean): string => String(new FleetbaseString('', false).foreignKey(value, dropIdUnderscore));
