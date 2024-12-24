import { assert } from 'chai';
import Fleetbase from '../src/fleetbase';
import Store from '../src/store';
import Resource from '../src/resource';
import { Place } from '../src/resources';
import 'cross-fetch/polyfill';

// create an instance of the fleetbase sdk
describe('Create a Fleetbase SDK instance', () => {
    // const fleetbase = new Fleetbase();
    const fleetbase = new Fleetbase('$2y$10$uHbd1Sd3TxuvZKS2i4pe7OHDmxyN3xTBU1fDVYIGqtlyYs6jaO.hy', { host: 'https://v2api.fleetbase.engineering' });

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

    it('should be able to get street1 attribute', () => {
        assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex');
    });
});
