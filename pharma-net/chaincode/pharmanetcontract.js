'use strict';

const {Contract} = require ('fabric-contract-api');

class PharmanetContract extends Contract{

constructor(){

	super('org.pharma-network.com.pharmanet');
}

// function to instantiate the chaincode
async instantiate(ctx){
console.log('Pharmanet Smart Contract Instantiated');
}

// function to Register Company
async registerCompany (ctx,companyCRN, companyName, location, organisationRole ){
// check to ensure consumer is not allowed to register a company
if((organisationRole.toUpperCase()=== 'CONSUMER') || (ctx.clientIdentity.getMSPID().includes('consumer'))){
	throw new Error('Customer is not allowed to register a company');
}
const companycrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest' ,[companyCRN] );
const companyregKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyregRequest',[companyCRN + '-' + companyName]);
let comapanydetailsbuffer  = await ctx.stub.getState(companyregKey).catch(err => console.log(err));
if(comapanydetailsbuffer.length!==0){
const companydeatils = JSON.parse(comapanydetailsbuffer.toString());
if(companydeatils.companyID.split("-")[0]=== companyCRN){
	throw new Error('Comapany with same CRN number already Exists');
}
}
let orgRole = "MANUFACTURER,DISTRIBUTOR,RETAILER,TRANSPORTER";
let hierarchyValue = 0;
// Assigning hierarchyKey to the compnay based on Organization Role
if(orgRole.includes(organisationRole.toUpperCase())){
	let orgdetails = organisationRole.toUpperCase();
	switch (orgdetails) {
		case "MANUFACTURER":
			hierarchyValue=1;
			break;
		case "DISTRIBUTOR":
			hierarchyValue=2;
			break;
	 case "RETAILER":
			hierarchyValue=3;
			break
	}
}else{
	throw new Error("organisationRole is not Valid");
}
// creating compnay object to store on ledger
let companyobj ={
	companyID : companyCRN + '-' + companyName,
	name : companyName,
  location : location,
	organisationRole : organisationRole,
	hierarchyKey : hierarchyValue,
};

if(organisationRole.toUpperCase()=== 'TRANSPORTER'){
	delete companyobj ['hierarchyKey'];

}

let companyNameobj ={
companyName : companyName,
organisationRole : organisationRole,
hierarchyKey : hierarchyValue,
location : location,
};

let companyregBuffer = Buffer.from(JSON.stringify(companyobj)) ;
await ctx.stub.putState(companyregKey,companyregBuffer);
let companyNameBuffer = Buffer.from(JSON.stringify(companyNameobj));
await ctx.stub.putState(companycrnKey,companyNameBuffer);
return companyobj;
}

// function to add drugs to the network
async addDrug (ctx,drugName, serialNo, mfgDate, expDate, companyCRN){
	const drugRegKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugName + '-' + serialNo]);
	const companycrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest',[companyCRN] );
  let companyNamebuff = await ctx.stub.getState(companycrnKey).catch(err=> console.log(err));
	if(companyNamebuff.length===0){
		throw new Error('No Company Registered with this CRN');
	}
	// check to ensure only manufacturer can add drugs
	const companydetails = JSON.parse(companyNamebuff.toString());
	if((companydetails.organisationRole).toUpperCase() !== 'MANUFACTURER'|| (!ctx.clientIdentity.getMSPID().includes('manufacturer'))){
		throw new Error("only Manufacturer can add drugs");
	}
	const drugdetailsBuffer = await ctx.stub.getState(drugRegKey).catch(err => console.log(err));
  if(drugdetailsBuffer.length>0){
		const drugInfo = JSON.parse(drugdetailsBuffer.toString());
		if(drugInfo.productID===drugName + '-' + serialNo){
			throw new Error("Cannot Register Drug with Same Details");
		}
	}
// creating drug object to store on network
	let drugDetailsObj = {
		productID : drugName + '-' + serialNo,
		name : drugName,
		manufacturer : companyCRN + '-' + companydetails.companyName,
		manufacturingDate : mfgDate,
		expiryDate : expDate,
		owner : companyCRN + '-' + companydetails.companyName,
		shipment: null,
	};
const drugInfoBuffer = Buffer.from(JSON.stringify(drugDetailsObj));
await ctx.stub.putState(drugRegKey,drugInfoBuffer);
return drugDetailsObj;
}

// Creating Purchase order for fetching drugs
async createPO (ctx,buyerCRN, sellerCRN, drugName, quantity){
	const buyercrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest',[buyerCRN] );
  let buyerCompanybuffer = await ctx.stub.getState(buyercrnKey).catch(err=> console.log(err));
	let allowedcompanies = "DISTRIBUTOR,RETAILER";
	if(buyerCompanybuffer.length===0){
		throw new Error('No Company Registered with this  CRN' +buyerCRN);
	}
	// check to ensure only retailers and distributors can raise PO
	const Buyerdetails = JSON.parse(buyerCompanybuffer.toString());
	if(Buyerdetails.organisationRole.toUpperCase()!== allowedcompanies.split(',')[0] && Buyerdetails.organisationRole.toUpperCase()!== allowedcompanies.split(',')[1] ){
		throw new Error('Only Retailers or Distributors can raise PO');
	}
	const sellercrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest',[sellerCRN] );
  let sellerCompanybuffer = await ctx.stub.getState(sellercrnKey).catch(err=> console.log(err));
	if(sellerCompanybuffer.length===0){
		throw new Error('No Company Registered with this  CRN' +sellerCRN);
	}
	// check to ensure drug transfer happens in hierarchical order
	const Sellerdetails = JSON.parse(sellerCompanybuffer.toString());
	if(Buyerdetails.hierarchyKey-1!==Sellerdetails.hierarchyKey){
		throw new Error("Transfer of Drugs can only take in Hierarchical Order");
	}

	const PoKey = ctx.stub.createCompositeKey('org.pharma-network.com.PORequest', [buyerCRN + "-" + drugName]);
// creating Purchase order object to store on ledger
	let Poobj = {
		poID : buyerCRN + "-" + drugName,
		drugName : drugName,
		quantity : quantity,
		buyer : buyerCRN + "-" + Buyerdetails.companyName,
		seller : sellerCRN + "-" + Sellerdetails.companyName,
	};
	const PObuffer = Buffer.from(JSON.stringify(Poobj));
	await ctx.stub.putState(PoKey,PObuffer);
	return Poobj;
}

// function to create shipment in response to the PO raised
async createShipment (ctx,buyerCRN, drugName, listOfAssets, transporterCRN ){
	const PoKey = ctx.stub.createCompositeKey('org.pharma-network.com.PORequest', [buyerCRN + "-" + drugName]);
	const PoBuffer = await ctx.stub.getState(PoKey).catch(err=> console.log('err'));
	if(PoBuffer.length===0){
		throw new Error("No Purchase order details available with this information");
	}

	let assetDetails = listOfAssets.split(',');
	console.log("List of Assests"+assetDetails);
	const PoDetails = JSON.parse(PoBuffer.toString());

	//check to ensure the quqntity of drugs matches with PO
	if(PoDetails.quantity!==assetDetails.length.toString()){
		throw new Error("Quantity doesn't match with the PO");
	}
	const transportcrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest' ,[transporterCRN] );
	let transportCompanybuffer = await ctx.stub.getState(transportcrnKey).catch(err=> console.log(err));
	if(transportCompanybuffer.length===0){
		throw new Error('No Transporter Registered with this  CRN');
	}
	const transporterdetails = JSON.parse(transportCompanybuffer.toString());

// Ensuring all the drugs mentioned in PO are available on Network
	for(let i=0;i<assetDetails.length;i++){
		let drugid=assetDetails[i];
		console.log("Value in DrugId"+drugid);
		const drugfetchKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugid]);
		const drugInfoBuffer = await ctx.stub.getState(drugfetchKey).catch(err=> console.log('err'));
		if(drugInfoBuffer.length===0){
			throw new Error("Drug is not registered on the network");
		}
	}
	const ShipKey = ctx.stub.createCompositeKey('org.pharma-network.com.ShipmentRequest', [buyerCRN + "-" + drugName]);

// create Shipment object to store on network
	let shipmentobj = {
		shipmentID: buyerCRN + "-" + drugName,
		creator: PoDetails.seller,
		assets: listOfAssets,
		transporter: transporterdetails.companyName + "-" + transporterCRN,
		status: 'in-transit',
	};
	let shipmentBuffer = Buffer.from(JSON.stringify(shipmentobj));
	await ctx.stub.putState(ShipKey,shipmentBuffer);
	return shipmentobj;
}

// function to update shipment information by the transporter to delivered
async updateShipment( ctx,buyerCRN, drugName, transporterCRN){
	const transportcrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest' ,[transporterCRN] );
	let transporerDetailsbuffer = await ctx.stub.getState(transportcrnKey).catch(err=> console.log(err));
	if(transporerDetailsbuffer.length===0){
		throw new Error('No Transporter Registered with this  CRN');
	}
	// check to ensure only the transporter can update shipment information
	const transporterInfo = JSON.parse(transporerDetailsbuffer.toString());
	if(transporterInfo.organisationRole.toUpperCase()!=='TRANSPORTER'){
		throw new Error('Only Transporter can updateShipment Information');
	}
	const ShipKey = ctx.stub.createCompositeKey('org.pharma-network.com.ShipmentRequest', [buyerCRN + "-" + drugName]);
	const shipmentInfoBuffer = await ctx.stub.getState(ShipKey).catch(err => console.log('err'));
	if(shipmentInfoBuffer.length===0){
		throw new Error('No Shipment Found with this Information');
	}
	const shipmentDetails = JSON.parse(shipmentInfoBuffer.toString());

	const buyergetKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest',[buyerCRN] );
  let buyerbuffer = await ctx.stub.getState(buyergetKey).catch(err=> console.log(err));
	if(buyerbuffer.length===0){
		throw new Error('No Company Registered with this  CRN' +buyerCRN);
	}
	const Buyerdetailsinfo = JSON.parse(buyerbuffer.toString());

// creating updated shipment information to store on network
 let updateShipmentobj = {
 		shipmentID: shipmentDetails.shipmentID,
 		creator: shipmentDetails.creator,
 		assets: shipmentDetails.assets,
 		transporter: shipmentDetails.transporter,
 		status: 'delivered',
 };
 let updateshipmentBuffer = Buffer.from(JSON.stringify(updateShipmentobj));
 await ctx.stub.putState(ShipKey,updateshipmentBuffer);

 let assetDetails = shipmentDetails.assets.split(',');
 for(let i=0;i<assetDetails.length;i++){
	 let drugid=assetDetails[i];
	 const druggetKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugid]);
	 const drugfetchBuffer = await ctx.stub.getState(druggetKey).catch(err=> console.log('err'));
	 if(drugfetchBuffer.length===0){
		 throw new Error("Drug is not registered on the network");
	 }
	 const druginformation = JSON.parse(drugfetchBuffer.toString());

// updating the drug info with Shipment ID
	 let drugUpdateobj = {
		productID : druginformation.productID,
 		name : druginformation.name,
 		manufacturer : druginformation.manufacturer,
 		manufacturingDate : druginformation.manufacturingDate,
 		expiryDate : druginformation.expiryDate,
 		owner : buyerCRN + '-' + Buyerdetailsinfo.companyName,
 		shipment: shipmentDetails.shipmentID,
	 };

	 let updateDrugBuffer = Buffer.from(JSON.stringify(drugUpdateobj));
	 await ctx.stub.putState(druggetKey,updateDrugBuffer);
	 return updateShipmentobj;
 }

}

// function to view the current state of the drug
async viewDrugCurrentState(ctx,drugName, serialNo){
	const drugstateKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugName + '-' + serialNo]);
	const drugcurrentstateBuffer = await ctx.stub.getState(drugstateKey).catch(err => console.log(err));
  if(drugcurrentstateBuffer.length===0){
		throw new Error("Drug is not registered on the network");
}
const drugcurrentInfo = JSON.parse(drugcurrentstateBuffer.toString());

let drugcurrentobj = {
 productID : drugcurrentInfo.productID,
 name : drugcurrentInfo.name,
 manufacturer : drugcurrentInfo.manufacturer,
 manufacturingDate : drugcurrentInfo.manufacturingDate,
 expiryDate : drugcurrentInfo.expiryDate,
 owner : drugcurrentInfo.owner,
 shipment: drugcurrentInfo.shipment,
};
return drugcurrentobj;
}

// function to retail the drug by the Retailer
async retailDrug (ctx,drugName, serialNo, retailerCRN, customerAadhar){
	const relailercrnKey = ctx.stub.createCompositeKey('org.pharma-network.com.companyCrnRequest' ,[retailerCRN] );
	let retailerDetailsbuffer = await ctx.stub.getState(relailercrnKey).catch(err=> console.log(err));
	if(retailerDetailsbuffer.length===0){
		throw new Error('No retailer Registered with this  CRN');
	}
	// check to ensure only the Retailer can sell the drugs
	const retailerInfo = JSON.parse(retailerDetailsbuffer.toString());
	if(retailerInfo.organisationRole.toUpperCase()!=='RETAILER'){
		throw new Error('Only Retailer can sell Drugs to consumer');
	}
	const drugsellKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugName + '-' + serialNo]);
	const drugSalesBuffer = await ctx.stub.getState(drugsellKey).catch(err => console.log(err));
  if(drugSalesBuffer.length===0){
		throw new Error("Drug is not registered on the network");
  }
  const drugSalesInfo = JSON.parse(drugSalesBuffer.toString());

  if(drugSalesInfo.owner.split('-')[0]!==retailerCRN){
	throw new Error("Only the Owner of the drug can sell the drug");
  }
// Drug object with updated owner info
let drugSalesobj = {
 productID : drugSalesInfo.productID,
 name : drugSalesInfo.name,
 manufacturer : drugSalesInfo.manufacturer,
 manufacturingDate : drugSalesInfo.manufacturingDate,
 expiryDate : drugSalesInfo.expiryDate,
 owner : customerAadhar,
 shipment: drugSalesInfo.shipment,
};
let retailDrugBuffer = Buffer.from(JSON.stringify(drugSalesobj));
await ctx.stub.putState(drugsellKey,retailDrugBuffer);

return drugSalesobj;
}

// function to view entire lifecycle of the Drug
async viewHistory (ctx,drugName, serialNo){
	const drgHistoryKey = ctx.stub.createCompositeKey('org.pharma-network.com.drugregRequest',[drugName + '-' + serialNo]);
	const drugHistoryBuffer = await ctx.stub.getHistoryForKey(drgHistoryKey).catch(err => console.log(err));
	if(drugHistoryBuffer.length===0){
		throw new Error("Drug History Not Found");
}
// Storing the Whole information of the drug into array and returning to caller
const allResults = [];
	while (true) {
			const res = await drugHistoryBuffer.next();
			if (res.value) {
					allResults.push(res.value.value.toString('utf8'));
			}
			if (res.done) {
					await drugHistoryBuffer.close();
					return allResults;
			}
	}
}




}

module.exports=PharmanetContract;
