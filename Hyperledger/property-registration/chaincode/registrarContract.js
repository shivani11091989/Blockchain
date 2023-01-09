'use strict';

const {Contract} = require('fabric-contract-api');

class RegistrarContract extends Contract {
	
	constructor() {
		super('registrarContract');
	}	
	
	// a. Instantiate
	async instantiateRegistrar(ctx) {
		console.log('Registrar Chaincode was successfully deployed.');
	}
	// 1. Approve User
	async approveNewUser(ctx, name, socialSecurityNumber) {
		const requestKey = ctx.stub.createCompositeKey('regnet.user.request', [name,socialSecurityNumber]);
		const requestBuffer = await ctx.stub.getState(requestKey);
		let request = null;
		if (requestBuffer) {
			request =  JSON.parse(requestBuffer.toString());
		} else {
			return 'request with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}

		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);

		const newUserObject = {
			docType: 'user',
			name: request.name,
			email: request.email,
			phoneNumber: request.phoneNumber,
			socialSecurityNumber:request.socialSecurityNumber,
			upgradCoins:0,
			createdAt: ctx.stub.getTxTimestamp()
		}
		const userBuffer = Buffer.from(JSON.stringify(newUserObject));
		// putState
		await ctx.stub.putState(userKey, userBuffer);
		return newUserObject;
	}

	// 2. View User
	async viewUser(ctx, name, socialSecurityNumber) {
		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);
		const userBuffer = await ctx.stub.getState(userKey);
		if (userBuffer) {
			return JSON.parse(userBuffer.toString());
		} else {
			return 'user with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}
	}

	// 3. Approve Property
	async approvePropertyRegistration(ctx, propertyId) {
		const requestKey = ctx.stub.createCompositeKey('regnet.property.request', [propertyId]);
		const requestBuffer = await ctx.stub.getState(requestKey);
		let request = null;
		if (requestBuffer) {
			request =  JSON.parse(requestBuffer.toString());
		} else {
			return 'request with key ' + propertyId + ' does not exist on the network';
		}

		const propertyKey = ctx.stub.createCompositeKey('regnet.property', [propertyId]);

		const newPropertyObject = {
			docType: 'property',
			propertyId: request.propertyId,
			price: request.price,
			status: request.status,
			owner: request.owner,
			createdAt: ctx.stub.getTxTimestamp()
		}
		const dataBuffer = Buffer.from(JSON.stringify(newPropertyObject));
		// putState
		await ctx.stub.putState(propertyKey, dataBuffer);
		return newPropertyObject;
	}

	// 4. View Property
	async viewProperty(ctx, propertId) {
		const propertyKey = ctx.stub.createCompositeKey('regnet.property', [propertId]);
		const dataBuffer = await ctx.stub.getState(propertyKey);
		if (dataBuffer) {
			return JSON.parse(dataBuffer.toString());
		} else {
			return 'property with key ' + propertId + ' does not exist on the network';
		}
	}
}

module.exports = RegistrarContract;

