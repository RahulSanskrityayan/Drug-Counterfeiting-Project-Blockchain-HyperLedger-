'use strict';

/**
 * This is a Node.JS application to view drugs History on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,drugName, serialNo) {

	try {

		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const drugHistoryBuffer = await pharmanetContract.submitTransaction('viewHistory',drugName, serialNo);

		// process response
		console.log('.....Processing View History Transaction Response \n\n');
		let historyOfDrug = JSON.parse(drugHistoryBuffer.toString());
		console.log(historyOfDrug);
		console.log('\n\n.....View History Drug Transaction Complete!');
		return historyOfDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
