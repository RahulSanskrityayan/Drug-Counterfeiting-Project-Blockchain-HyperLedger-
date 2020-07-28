'use strict';

/**
 * This is a Node.JS application to Register a new company on the network.
 */

const helper = require('./contractHelper');

async function main(orgRole,companyCRN, companyName, location, organisationRole) {

	try {
		console .log("Vale in Org Role" +orgRole);
		const pharmanetContract = await helper.getContractInstance(orgRole);

		// Register a new Companay
		const companyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Register Companay Transaction Response \n\n');
		let newCompnay = JSON.parse(companyBuffer.toString());
		console.log(newCompnay);
		console.log('\n\n.....Register company Transaction Complete!');
		return newCompnay;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
module.exports.execute = main;
