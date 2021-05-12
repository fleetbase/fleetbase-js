import { assert } from 'chai';
import Fleetbase from '../src/fleetbase';
import Model from '../src/model';
import Store from '../src/store';
import { Place } from '../src/resources';

const fleetbase = new Fleetbase('flb_test_lxHdcBHAHeuDCQS9udhZ');
const adapter = fleetbase.getAdapter();

// create an instance of the fleetbase sdk
describe('fleetbase.places', () => {

	const context = { id: null };

	describe('#create()', () => {
		it('Should create a Place resource', async () => {
			const place = await fleetbase.places.create({
				name: 'Warehouse',
				street1: '23 Serangoon Central Nex',
				country: 'Singapore'
			});
	
			context.id = place.id;
	
			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
		});
	
		it('Should have an id', () => {
			assert.isString(context.id);
			assert.include(context.id, 'place', `id: ${context.id}`);
		});
	});
	
	describe('#update()', () => {
		it('Should update the Place resource instance', async () => {
			const { id } = context;
			const place = await fleetbase.places.update(id, {
				street2: '#5-22'
			});
	
			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
			assert.equal(place.getAttribute('street2'), '#5-22');
		});
	});
	
	describe('#delete()', () => {
		it('Should delete the Place resource instance', async () => {
			const { id } = context;
			const place = await fleetbase.places.destroy(id);
	
			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
			assert.isTrue(place.getAttribute('deleted'));
		});
	});
});

// create a place instance without fleetbase sdk
describe('Place', async () => {

	const context = {
		place: new Place({
			name: 'Warehouse',
			street1: '23 Serangoon Central Nex',
			country: 'Singapore'
		}, adapter)
	};

	describe('#create()', () => {
		it('Should create a Place resource', async () => {
			const { place } = context;

			await place.save();

			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
		});

		it('Should have an id', () => {
			assert.isString(context.place.id);
			assert.include(context.place.id, 'place', `id: ${context.place.id}`);
		});
	});

	describe('#update()', () => {
		it('Should update the Place resource instance', async () => {
			const { place } = context;

			await place.update({
				street2: '#5-22'
			});

			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
			assert.equal(place.getAttribute('street2'), '#5-22');
		});
	});

	describe('#delete()', () => {
		it('Should delete the Place resource instance', async () => {
			const { place } = context;

			await place.destroy();

			assert.instanceOf(place, Place);
			assert.instanceOf(place, Model);
			assert.isTrue(place.getAttribute('deleted'));
		});
	});
});