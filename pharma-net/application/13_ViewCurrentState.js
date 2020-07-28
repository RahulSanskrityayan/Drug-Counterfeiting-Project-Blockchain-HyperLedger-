'use strict';

/**
 * This is a Node.JS application to View Current State of drugs on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,drugName, serialNo) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const currentStateBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState',drugName, serialNo);

		// process response
		console.log('.....Processing view current state Drug Transaction Response \n\n');
		let newCurrentStateOfDrug = JSON.parse(currentStateBuffer.toString());
		console.log(newCurrentStateOfDrug);
		console.log('\n\n.....view Current State Drug Transaction Complete!');
		return newCurrentStateOfDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
