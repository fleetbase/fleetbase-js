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
    /**
     * @method invoke
     **/
    static invoke(...args: any[]): any;
    constructor(string: any, chain?: boolean);
    str: any;
    chain: boolean;
    uncountableWords: string[];
    pluralRules: (string | RegExp)[][];
    singularRules: (string | RegExp)[][];
    nonTitlecasedWords: string[];
    idSuffix: RegExp;
    underbar: RegExp;
    spaceOrUnderbar: RegExp;
    uppercase: RegExp;
    underbarPrefix: RegExp;
    get(): any;
    applyRules(str: any, rules: any, skip: any, override: any): any;
    pluralize(str: any, plural?: any): any;
    singularize(str: any, singular: any): any;
    camelize(str: any, lowFirstLetter: any): any;
    underscore(str: any): any;
    humanize(str: any, lowFirstLetter: any): any;
    capitalize(str: any): any;
    dasherize(str: any): any;
    normify(str: any, allFirstUpper: any): any;
    demodulize(str: any): any;
    tableize(str: any): any;
    classify(str: any): any;
    foreignKey(str: any, dropIdUbar?: boolean): any;
    ordinalize(str: any): any;
}
export function pluralize(...args: any[]): any;
export function singularize(...args: any[]): any;
export function humanize(...args: any[]): any;
export function underscore(...args: any[]): any;
export function camelize(...args: any[]): any;
export function capitalize(...args: any[]): any;
export function dasherize(...args: any[]): any;
export function normify(...args: any[]): any;
export function demodulize(...args: any[]): any;
export function tableize(...args: any[]): any;
export function classify(...args: any[]): any;
export function foreignKey(...args: any[]): any;
