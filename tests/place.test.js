import { assert } from 'chai';
import Fleetbase from '../src/fleetbase';
import Model from '../src/model';
import { Place } from '../src/resources';

const fleetbase = new Fleetbase('flb_test_lxHdcBHAHeuDCQS9udhZ');
const adapter = fleetbase.getAdapter();

// create an instance of the fleetbase sdk
describe('Create a Place using SDK', async () => {
    const place = await fleetbase.places.create({
        name: 'Warehouse',
        street1: '23 Serangoon Central Nex',
        country: 'Singapore'
    });

	it('should be an instance of Place', () => assert.instanceOf(place, Place));
	
	it('should be an instance of Model', () => assert.instanceOf(place, Model));
	
	it('should be able to get street1 attribute', () => assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex'));

	describe('Update the Place resource instance', async () => {
		const updatedPlace = await fleetbase.places.update(place.id, {
			street2: '#5-22'
		});

		it('should be an instance of Place', () => assert.instanceOf(updatedPlace, Place));
	
		it('should be an instance of Model', () => assert.instanceOf(updatedPlace, Model));
		
		it('street2 attribute should be updated', () => assert.equal(updatedPlace.getAttribute('street2'), '#5-22'));
	});

	describe('Delete the Place resource instance', async () => {
		const deletedPlace = await fleetbase.places.destroy(place);

		it('should be an instance of Place', () => assert.instanceOf(deletedPlace, Place));
	
		it('should be an instance of Model', () => assert.instanceOf(deletedPlace, Model));
	});
});

// create a place instance without fleetbase sdk
describe('Create a Place by Model Instance', async () => {
	const place = new Place({
		name: 'Warehouse',
		street1: '23 Serangoon Central Nex',
		country: 'Singapore'
	}, adapter);

    await place.save();
	
	it('should be an instance of Place', () => assert.instanceOf(place, Place));
	
	it('should be an instance of Model', () => assert.instanceOf(place, Model));
	
	it('should be able to get street1 attribute', () => assert.equal(place.getAttribute('street1'), '23 Serangoon Central Nex'));

	describe('Update the Place resource instance', async () => {
		place.setAttribute('street2', '#5-22');

		await place.save();

		it('should be an instance of Place', () => assert.instanceOf(place, Place));
	
		it('should be an instance of Model', () => assert.instanceOf(place, Model));
		
		it('street2 attribute should be updated', () => assert.equal(place.getAttribute('street2'), '#5-22'));
	});

	describe('Delete the Place resource instance', async () => {
		await place.destroy();

		it('should be an instance of Place', () => assert.instanceOf(deletedPlace, Place));
	
		it('should be an instance of Model', () => assert.instanceOf(deletedPlace, Model));
	});
});