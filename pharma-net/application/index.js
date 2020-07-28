const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules
const addToWalletManufacturer = require('./1_addToWalletManufacturer');
const addToWalletRetailer = require('./2_addToWalletRetailer');
const addToWalletDistributor = require('./3_addToWalletDistributor');
const addToWalletConsumer = require('./4_addToWalletConsumer');
const addToWalletTransporter = require('./5_addToWalletTransporter');
const registerCompany = require('./6_registerCompany');
const addDrug = require('./7_addDrug');
const createPO = require('./8_createPO');
const createShipment = require('./9_createShipment');
const updateShipment = require('./10_updateShipment');
const retailDrug = require('./11_retailDrug');
const viewHistory = require('./12_viewHistory');
const ViewCurrentState = require('./13_ViewCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('hello world'));

app.post('/1_addToWalletManufacturer', (req, res) => {
	addToWalletManufacturer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/2_addToWalletRetailer', (req, res) => {
	addToWalletRetailer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/3_addToWalletDistributor', (req, res) => {
	addToWalletDistributor.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/4_addToWalletConsumer', (req, res) => {
	addToWalletConsumer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/5_addToWalletTransporter', (req, res) => {
	addToWalletTransporter.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/6_registerCompany', (req, res) => {
	registerCompany.execute(req.body.orgRole,req.body.companyCRN, req.body.companyName, req.body.location,req.body.organisationRole)
			.then((company) => {
				console.log('New Compnay Registered');
				const result = {
					status: 'success',
					message: 'New Compnay Registered',
					company: company
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/7_addDrug', (req, res) => {
	addDrug.execute(req.body.orgRole,req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate,req.body.companyCRN)
			.then((drug) => {
				console.log('New Drug Added');
				const result = {
					status: 'success',
					message: 'New Drug added',
					drug: drug
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/8_createPO', (req, res) => {
	createPO.execute(req.body.orgRole,req.body.buyerCRN, req.body.sellerCRN, req.body.drugName,req.body.quantity)
			.then((purchaseOrder) => {
				console.log('purchaseOrder created');
				const result = {
					status: 'success',
					message: 'purchaseOrder created',
					purchaseOrder: purchaseOrder
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/9_createShipment', (req, res) => {
	createShipment.execute(req.body.orgRole,req.body.buyerCRN, req.body.drugName, req.body.listOfAssets,req.body.transporterCRN)
			.then((shipment) => {
				console.log('shipment created');
				const result = {
					status: 'success',
					message: 'shipment created',
					shipment: shipment
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/10_updateShipment', (req, res) => {
	updateShipment.execute(req.body.orgRole,req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
			.then((updatedShipment) => {
				console.log('Shipment Updated');
				const result = {
					status: 'success',
					message: 'Shipment Updated',
					updatedShipment: updatedShipment
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/11_retailDrug', (req, res) => {
	retailDrug.execute(req.body.orgRole,req.body.drugName, req.body.serialNo, req.body.retailerCRN,req.body.customerAadhar)
			.then((retaildrug) => {
				console.log('Drugs Sold');
				const result = {
					status: 'success',
					message: 'Drugs Sold',
					retaildrug: retaildrug
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/12_viewHistory', (req, res) => {
	viewHistory.execute(req.body.orgRole,req.body.drugName, req.body.serialNo)
			.then((DrugHistory) => {
				console.log('History of Drug');
				const result = {
					status: 'success',
					message: 'Drug History',
					DrugHistory: DrugHistory
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/13_ViewCurrentState', (req, res) => {
	ViewCurrentState.execute(req.body.orgRole,req.body.drugName, req.body.serialNo)
			.then((drugCurrentState) => {
				console.log('Current state of Drug');
				const result = {
					status: 'success',
					message: 'Drug Current State',
					drugCurrentState: drugCurrentState
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
