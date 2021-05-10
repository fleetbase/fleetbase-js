import { assert } from 'chai';
import Fleetbase from '../src/fleetbase';
import Store from '../src/store';
import Model from '../src/model';
import { Place } from '../src/resources';

// create an instance of the fleetbase sdk
describe('Create a Fleetbase SDK instance', () => {
	const fleetbase = new Fleetbase('pk_testpublickey');
	
	it('should be an instance of Fleetbase', () => {
        assert.instanceOf(fleetbase, Fleetbase);
    });

	describe('#places', () => {
		it('should have places store instance', () => {
			assert.instanceOf(fleetbase.places, Store);
		});
	})
});

// create a place instance without fleetbase sdk
describe('Create a Place instance without SDK', () => {
	const place = new Place({
		name: 'Warehouse',
		street1: '23 Serangoon Central Nex',
		country: 'Singapore'
	});
	
	it('should be an instance of Place', () => {
        assert.instanceOf(place, Place);
    });
	
	it('should be an instance of Model', () => {
        assert.instanceOf(place, Model);
    });
	
	it('should be able to get street1 attribute', () => {
        assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex');
    });
});

