'use strict';

const {Contract} = require('fabric-contract-api');

class UserContract extends Contract {
	
	constructor() {
		super('userContract');
	}

	// a. Instantiate
	async instantiateUser(ctx) {
		console.log('User Chaincode was successfully deployed.');
	}
	// 1. Request New User
	async requestNewUser(ctx, name, email, phoneNumber, socialSecurityNumber) {
		const requestKey = ctx.stub.createCompositeKey('regnet.user.request', [name,socialSecurityNumber]);
		const newRequestObject = {
			docType: 'user.request',
			name: name,
			email: email,
			phoneNumber: phoneNumber,
			socialSecurityNumber:socialSecurityNumber,
			createdAt: ctx.stub.getTxTimestamp()
		}
		const requestBuffer = Buffer.from(JSON.stringify(newRequestObject));
		// putState
		await ctx.stub.putState(requestKey, requestBuffer);
		return newRequestObject;
	}
	// 2. Recharge Account
	async rechargeAccount(ctx, name, socialSecurityNumber, transactionId) {
		let transactionMap =  new Map();
		transactionMap.set("upg100",100);
		transactionMap.set("upg500",500);
		transactionMap.set("upg1000",1000);
		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);
		const userBuffer = await ctx.stub.getState(userKey);
		let user = null;
		if (userBuffer) {
			user =  JSON.parse(userBuffer.toString());
		} else {
			return 'user with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}

		const amount = transactionMap.get(transactionId);
		if(amount === undefined){
			return 'Invalid Bank Transaction ID.';
		}
		user.upgradCoins = user.upgradCoins + amount;
		const updatedUserBuffer = Buffer.from(JSON.stringify(user));
		// putState
		await ctx.stub.putState(userKey, updatedUserBuffer);
		return user;
	}

	// 3. View User
	async viewUser(ctx, name, socialSecurityNumber) {
		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);
		const userBuffer = await ctx.stub.getState(userKey);
		if (userBuffer) {
			return JSON.parse(userBuffer.toString());
		} else {
			return 'user with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}
	}

	// 4. Property Registration
	async propertyRegistrationRequest(ctx, name, socialSecurityNumber, prpertyId, price, status) {
		//Fetch user from blockchain
		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);
		const userBuffer = await ctx.stub.getState(userKey);
		if (!userBuffer) {
			return 'user with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}
	
		const requestKey = ctx.stub.createCompositeKey('regnet.property.request', [prpertyId]);
		let prpertObject = {
			docType: 'property.request',
			propertyId: prpertyId,
			price: price,
			status: status,
			owner: userKey,
			createdAt: ctx.stub.getTxTimestamp()
		};
	
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(prpertObject));
		await ctx.stub.putState(requestKey, dataBuffer);
		// Return value of new certificate issued to student
		return prpertObject;
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

	// 4. Update Property
	async updateProperty(ctx, name, socialSecurityNumber, propertyId, status) {
		const userKey = ctx.stub.createCompositeKey('regnet.user', [name,socialSecurityNumber]);
		const userBuffer = await ctx.stub.getState(userKey);
		let user = null;
		if (userBuffer) {
			user =  JSON.parse(userBuffer.toString());
		} else {
			return 'user with key ' + name +' & '+ socialSecurityNumber + ' does not exist on the network';
		}

		const propertyKey = ctx.stub.createCompositeKey('regnet.property', [propertyId]);
		const dataBuffer = await ctx.stub.getState(propertyKey);
		let property=null;
		if (dataBuffer) {
			property =  JSON.parse(dataBuffer.toString());
		} else {
			return 'property with key ' + propertyId + ' does not exist on the network';
		}

		if(property.owner !== userKey){
			return ' user: ' + name +' invoking the Transaction is not the property’s: '+propertyId +' owner';
		}
		property.status = status;
		const updatedPropertyBuffer = Buffer.from(JSON.stringify(property));
		// putState
		await ctx.stub.putState(propertyKey, updatedPropertyBuffer);
		return property;
	}

	// 4. purchase Property
	async purchaseProperty(ctx, buyerName, buyerSocialSecurityNumber, propertyId) {
		const buyerKey = ctx.stub.createCompositeKey('regnet.user', [buyerName,buyerSocialSecurityNumber]);
		const buyerBuffer = await ctx.stub.getState(buyerKey);
		let buyer = null;
		if (buyerBuffer) {
			buyer =  JSON.parse(buyerBuffer.toString());
		} else {
			return 'buyer with key ' + buyerName +' & '+ buyerSocialSecurityNumber + ' does not exist on the network';
		}

		const propertyKey = ctx.stub.createCompositeKey('regnet.property', [propertyId]);
		const dataBuffer = await ctx.stub.getState(propertyKey);
		let property=null;
		if (dataBuffer) {
			property =  JSON.parse(dataBuffer.toString());
		} else {
			return 'property with key ' + propertyId + ' does not exist on the network';
		}

		if(property.status !== "sale"){
			return 'property with key ' + propertyId + ' is not listed for sale on the network';
		}

		if(parseInt(property.price) > parseInt(buyer.upgradCoins)){
			return 'buyer with key ' + buyerName +' & '+ buyerSocialSecurityNumber + ' does not have required upgradCoins '+ property.price +' to buy the property';
		}
		const ownerKey = property.owner;
		const ownerBuffer = await ctx.stub.getState(ownerKey);
		let owner = JSON.parse(ownerBuffer.toString());

		owner.upgradCoins = parseInt(owner.upgradCoins) + parseInt(property.price);
		buyer.upgradCoins = parseInt(buyer.upgradCoins) - parseInt(property.price);
		property.status = "registered";
		property.owner = buyerKey;

		const updatedPropertyBuffer = Buffer.from(JSON.stringify(property));
		// putState
		await ctx.stub.putState(propertyKey, updatedPropertyBuffer);
		console.log('property commited')
		const updatedBuyerBuffer = Buffer.from(JSON.stringify(buyer));
		// putState
		await ctx.stub.putState(buyerKey, updatedBuyerBuffer);
		console.log('buyer commited')
		const updatedOwnerBuffer = Buffer.from(JSON.stringify(owner));
		// putState
		await ctx.stub.putState(ownerKey, updatedOwnerBuffer);
		console.log('owner commited')
		return true;
	}
}

module.exports = UserContract;

