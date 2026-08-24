const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");

const UserAuthentication = require("../../../models/mongoDB/userManagement/userAuthentication_model");
const mongoose = require("mongoose");
const Model = UserAuthentication;

async function createUserAuthentication(userAuthenticationObject) {
	try {
		const userPassword = await mongoDbManager.insertOne(Model, userAuthenticationObject);
		const createdDatumResponse = userAuthenticationCreateResponse(userPassword);
		createdDatumResponse.passwordExpireAt = userPassword.passwordExpireAt;
		return createdDatumResponse;
	} catch (error) {
		throw error;
	}
}

async function updateUserAuthentication(id, updateObject, businessUnit) {
	try {
		let query = {
			_id: id,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		return await mongoDbManager.updateOne(Model, query, updateObject);
	} catch (error) {
		throw error;
	}
}

async function getUserAuthenticationByField(
	field,
	value,
	selectFields = "",
	populateFields = "",
	businessUnit
) {
	let query = {
		[field]: value,
		isEnabled: true,
		isDeleted: false
	};

	let originalPopulateFields = populateFields;

	if (businessUnit) {
		query.businessUnit = businessUnit;
	}

	selectFields = selectFields ? [...new Set(selectFields.split(",")), "_id"].join(" ") : ["_id"];

	if (populateFields) {
		populateFields = [...new Set(populateFields.split(",").filter(Boolean))];
	}

	populateFields = populateFields ? getPopulateOptions(populateFields, "_id name") : [];

	let datum = await mongoDbManager.findOneWithPopulate(Model, query, selectFields, populateFields);

	if (datum) {
		const { _id, ...rest } = datum;
		datum = { ...rest, id: _id };
	}

	return datum;
}

function getPopulateOptions(populateFields, defaultSelectFields = "_id name") {
	// Split the input string into an array, remove duplicates, and filter out empty strings

	// Initialize an array to hold the populate objects
	let populateOptions = [];

	// Populate each field with the default select fields
	populateFields.forEach((field) => {
		if (Model.schema.path(field)) {
			// Get the select fields for the current field
			let selectFields = getCustomSelectFieldsOnPopulate(field, defaultSelectFields);

			// Push the populate object into the options array
			populateOptions.push({ path: field, select: selectFields });
		}
	});

	return populateOptions;
}

function getCustomSelectFieldsOnPopulate(field, defaultSelectFields = "_id name") {
	switch (field) {
		case "permissions":
			return "id positivePermissions negativePermissions";
		default:
			return defaultSelectFields;
	}
}

module.exports = {
	createUserAuthentication: createUserAuthentication,
	updateUserAuthentication: updateUserAuthentication,
	getUserAuthenticationByField: getUserAuthenticationByField
};

const userAuthenticationCreateResponse = (userAuthentication) => {
	return {
		id: userAuthentication._id
	};
};
