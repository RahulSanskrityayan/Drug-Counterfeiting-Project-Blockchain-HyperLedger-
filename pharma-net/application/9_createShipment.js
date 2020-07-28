'use strict';

/**
 * This is a Node.JS application to CreateShipment the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,buyerCRN, drugName, listOfAssets, transporterCRN) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const ShipmentOrderBuffer = await pharmanetContract.submitTransaction('createShipment',buyerCRN, drugName, listOfAssets, transporterCRN);

		// process response
		console.log('.....Processing Create Shipment Transaction Response \n\n');
		let newShipment= JSON.parse(ShipmentOrderBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....CreateShipment Transaction Complete!');
		return newShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
