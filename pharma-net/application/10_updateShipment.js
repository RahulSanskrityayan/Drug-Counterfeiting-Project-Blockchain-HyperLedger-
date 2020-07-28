'use strict';

/**
 * This is a Node.JS application to updateShipment on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,buyerCRN, drugName, transporterCRN) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const UpdateShipmentBuffer = await pharmanetContract.submitTransaction('updateShipment',buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing updateShipment Transaction Response \n\n');
		let updatedShipment = JSON.parse(UpdateShipmentBuffer.toString());
		console.log(updatedShipment);
		console.log('\n\n.....update Shipment Transaction Complete!');
		return updatedShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
