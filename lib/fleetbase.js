'use strict';

class Fleetbase {
	/**
	 * Builds an instance of the Fleetbase SDK
	 * 
	 * @param  {String} publicKey The public key issued
	 * @param  {String} secretKey The secret key issued
	 * @param  {String} version   The version of resource to access
	 * @return {Fletbase}        Instance
	 */
	constructor(publicKey, secretKey, version = 'v1') {
		this.publicKey = publicKey;
		this.secretKey = secretKey;
		this.version = version;
		return this;
	}
};

export default Fleetbase;