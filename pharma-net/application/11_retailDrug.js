'use strict';

/**
 * This is a Node.JS application to retail drugs on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,drugName, serialNo, retailerCRN, customerAadhar) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const retailDrugBuffer = await pharmanetContract.submitTransaction('retailDrug',drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing retail Drug Transaction Response \n\n');
		let retailDrug = JSON.parse(retailDrugBuffer.toString());
		console.log(retailDrug);
		console.log('\n\n.....Retail Drug Transaction Complete!');
		return retailDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
