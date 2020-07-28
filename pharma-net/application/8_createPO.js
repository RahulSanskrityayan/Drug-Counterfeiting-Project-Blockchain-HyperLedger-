'use strict';

/**
 * This is a Node.JS application to Create PO on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,buyerCRN, sellerCRN, drugName, quantity) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Create a new Purchase Order
		const purchaseOrderBuffer = await pharmanetContract.submitTransaction('createPO',buyerCRN, sellerCRN, drugName, quantity);
		// process response
		console.log('.....Processing Create PO Transaction Response \n\n');
		let newPurchaseOrder = JSON.parse(purchaseOrderBuffer.toString());
		console.log(newPurchaseOrder);
		console.log('\n\n.....Create PO Transaction Complete!');
		return newPurchaseOrder;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
