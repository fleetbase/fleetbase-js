import { assert } from 'chai';
import String, { pluralize, dasherize } from '../src/utils/string';

describe('Create a new String() instance', () => {
    it('should be an instance of String', () => {
        const s = new String('Hello World');
        assert.instanceOf(s, String);
    });

    describe('#methods', () => {
        describe('dasherize()', () => {
            const dasherized = new String('Hello World').dasherize().get();

            it('string should be dasherized', () => assert.equal(dasherized, 'hello-world'));
        });

        describe('pluralize()', () => {
            const pluralized = new String('entity').pluralize().get();

            it('string should be pluralized', () => assert.equal(pluralized, 'entities'));
        });
    });
});

describe('pluralize() function', () => {
    it('should pluralize a string', () => {
        const pluralized = pluralize('entity');

        assert.equal(pluralized, 'entities');
    });
});

describe('dasherize() function', () => {
    it('should dasherize a string', () => {
        const dasherized = dasherize('Hello World');

        assert.equal(dasherized, 'hello-world');
    });
});
