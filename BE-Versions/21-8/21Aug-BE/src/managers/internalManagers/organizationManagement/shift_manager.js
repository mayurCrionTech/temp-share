const {
	Shift
} = require("../../../models/mongoDB/organizationManagement/shift_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = Shift;
const mongoose = require("mongoose");

async function createShift(createObj) {
	try {
		const datum = await mongoDbManager.insertOne(Model, createObj);
		return { id: datum._id };
	} catch (error) {
		throw error;
	}
}

async function createShifts(createObj) {
	try {
		const data = await mongoDbManager.insertMany(Model, createObj);
		return multipleCreateResponseObject(data);
	} catch (error) {
		throw error;
	}
}

async function updateShift(id, updateObj) {
	try {
		const query = {
			_id: id,
			isDeleted: false
		};
		const datum = await mongoDbManager.updateOne(Model, query, updateObj);
		return datum;
	} catch (error) {
		throw error;
	}
}

async function deleteShifts(ids) {
	try {
		const deleteResults = await mongoDbManager.updateMany(Model, { _id: { $in: ids } }, { $set: { isDeleted: true } });
		return deleteResults;
	} catch (error) {
		throw error;
	}
}

async function updateShifts(updateObjects) {
	try {
		const bulkUpdateOperations = updateObjects.map(({ id, updateObject }) => ({
			updateOne: {
				filter: { _id: id },
				update: { $set: updateObject }
			}
		}));

		const result = await mongoDbManager.bulkWrite(Model, bulkUpdateOperations);
		return result;
	} catch (error) {
		throw error;
	}
}

const returnInvalidShiftIds = async (ids) => {
	try {
		let invalidShiftIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidShiftIds.length > 0) {
			return invalidShiftIds;
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false
		};

		const existingShifts = await mongoDbManager.findManyWithPopulate(
			Model,
			query,
			null,
			null,
			null,
			"_id",
			[]
		);

		const existingShiftIds = existingShifts.map(
			(shift) => shift._id.toString()
		);

		invalidShiftIds.push(
			...ids.filter((id) => !existingShiftIds.includes(id))
		);

		return Array.from(new Set(invalidShiftIds));
	} catch (error) {
		throw error;
	}
};

const getShifts = async (reqData) => {
	try {
		const queryObj = queryBuilder(reqData);
		const fieldMapping = fieldMappings();
		const countData = await mongoDbManager.count(Model, queryObj.query);

		// Handle cases where either page or limit is not provided
		if (queryObj.page === null && queryObj.limit === null) {
			queryObj.limit = 200 || 1; // Set limit to the total number of records if no limit is provided
			queryObj.page = 1; // Set page to 1 if no page is provided
		} else if (queryObj.page === null) {
			queryObj.page = 1; // Set default page to 1 if not provided
		} else if (queryObj.limit === null) {
			queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
		}

		if (queryObj.limit === 0 && queryObj.page > 1) {
			return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
		}

			const populateFields = ["businessUnit"];

			const selectFields = ["name", "shiftHours", "businessUnit"];

		let data = await mongoDbManager.fetchAllAndPopulate(
			Model,
			queryObj.query,
			fieldMapping,
			queryObj.limit,
			queryObj.page,
			queryObj.sortOrder,
			populateFields,
			selectFields
		);

		if (data) {
			data = data.map((result) => {
				const { _id, ...rest } = result;
				return { ...rest, id: _id };
			});
		}

		const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

		return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
	} catch (error) {
		throw error;
	}
};

async function getShift(shiftId, reqData) {
	try {
		const queryObj = queryBuilder(reqData);
		const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
		const populateFields = ["createdBy", "updatedBy", "businessUnit"];

		const selectFields = ["name", "shiftHours", "createdBy", "updatedBy", "businessUnit", "createdAt", "updatedAt"];
		shiftId = new mongoose.Types.ObjectId(shiftId);
		let datum = await mongoDbManager.buildSingleAggregationPipeline(
			Model,
			shiftId,
			queryObj.query,
			fieldMapping,
			populateFields,
			selectFields
		);
		if (datum) {
			const { _id, ...rest } = datum;
			return { ...rest, id: _id };
		} else return null;
	} catch (err) {
		throw err;
	}
}

async function checkExistingShift(id) {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return false;
		}
		const query = { _id: id, isDeleted: false };
		const existingShift = await mongoDbManager.findOne(Model, query);

		return existingShift;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	createShift,
	createShifts,
	updateShift,
	updateShifts,
	deleteShifts,
	returnInvalidShiftIds,
	getShifts,
	getShift,
	checkExistingShift
};

function multipleCreateResponseObject(data) {
	const ids = data.map((result) => result._id);
	return { ids: ids };
}

function fieldMappings() {
	return {
		businessUnit: {
			localField: "businessUnit",
			collection: "businessUnits",
			fieldsToInclude: ["name", "id"] // Example fields to include
		},
		updatedBy: {
			localField: "updatedBy",
			collection: "users",
			fieldsToInclude: ["name", "email", "id"] // Example fields to include
		},
		createdBy: {
			localField: "createdBy",
			collection: "users",
			fieldsToInclude: ["name", "email", "id"] // Example fields to include
		}
	};
}

function queryBuilder(reqData) {
	const query = {
		isDeleted: false,
		...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
		...(reqData.description && { value: { $regex: reqData.description, $options: "i" } }),
		...(reqData.businessUnits && { businessUnit: { $in: reqData.businessUnits } }),
		...(reqData.createdAt && { createdAt: reqData.createdAt }),
		...(reqData.updatedAt && { updatedAt: reqData.updatedAt })
	};

	const page = reqData.page ? parseInt(reqData.page, 10) : null;
	const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
	const skip = page && limit ? (page - 1) * limit : 0;
	const sort = reqData.sort || "createdAt";
	const order = reqData.order === "asc" ? 1 : -1;
	const sortOrder = { [sort]: order };

	return {
		query,
		skip,
		page,
		limit,
		sortOrder
	};
}
