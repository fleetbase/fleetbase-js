import { assert } from 'chai';
import Fleetbase from '../src/fleetbase.js';
import Store from '../src/store.js';
import Resource, { isResource } from '../src/resource.js';
import Place from '../src/resources/place.js';
import { resolveResource } from '../src/resolver.js';

// create an instance of the fleetbase sdk
describe('Create a Fleetbase SDK instance', () => {
    const fleetbase = new Fleetbase(process.env.FLEETBASE_KEY, { host: process.env.FLEETBASE_HOST });

    it('should be an instance of Fleetbase', () => {
        assert.instanceOf(fleetbase, Fleetbase);
    });

    describe('#places', () => {
        it('should have places store instance', () => {
            assert.instanceOf(fleetbase.places, Store);
        });
        it('should be able to create() a place', async () => {
            const place = await fleetbase.places.create({
                name: 'Warehouse',
                street1: '23 Serangoon Central Nex',
                country: 'Singapore',
            });

            assert.instanceOf(place, Place);
        });
    });
});

// create a place instance without fleetbase sdk
describe('Create a Place instance without SDK', () => {
    const place = new Place({
        name: 'Warehouse',
        street1: '23 Serangoon Central Nex',
        country: 'Singapore',
    });

    it('should be an instance of Place', () => {
        assert.instanceOf(place, Place);
    });

    it('should be an instance of Resource', () => {
        assert.instanceOf(place, Resource);
    });

    it('should be an instance of Resource via isResource function', () => {
        assert.equal(isResource(place), true);
    });

    it('should be able to get street1 attribute', () => {
        assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex');
    });
});

// resolve a place instance using the resolver and registry
describe('Create a Place using the Resolver', () => {
    const place = resolveResource('Place', {
        name: 'Warehouse',
        street1: '23 Serangoon Central Nex',
        country: 'Singapore',
    });

    it('should be an instance of Place', () => {
        assert.instanceOf(place, Place);
    });

    it('should be an instance of Resource', () => {
        assert.instanceOf(place, Resource);
    });

    it('should be an instance of Resource via isResource function', () => {
        assert.equal(isResource(place), true);
    });

    it('should be able to get street1 attribute', () => {
        assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex');
    });
});
