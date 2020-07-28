'use strict';

/**
 * This is a Node.JS application to Add drugs on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const addDrugBuffer = await pharmanetContract.submitTransaction('addDrug',drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Add Drug Transaction Response \n\n');
		let newDrug = JSON.parse(addDrugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Add Drug Transaction Complete!');
		return newDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
