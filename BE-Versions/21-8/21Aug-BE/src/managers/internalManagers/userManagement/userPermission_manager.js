const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const UserPermission = require("../../../models/mongoDB/userManagement/userPermission_model");
const Model = UserPermission;
const mongoose = require("mongoose");

async function createUserPermission(createObject) {
	try {
		const datum = await mongoDbManager.insertOne(Model, createObject);
		return datumCreateResponse(datum);
	} catch (error) {
		throw error;
	}
}

async function getAllUserPermissions(reqData, businessUnit) {
	try {
		let query = {};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		if (department) {
			query.department = { $in: reqData.departments };
		}
		if (reqData.name) {
			query.name = { $regex: reqData.name, $options: "i" };
		}

		const page = parseInt(reqData.page) || 1;
		const limit = parseInt(reqData.limit) || 0;
		const skip = (page - 1) * limit;

		const sort = reqData.sort || "createdAt";
		const order = reqData.order === "desc" ? -1 : 1;
		const sortOrder = { [sort]: order };
		let selectFields = reqData.selectFields;
		let populateFields = reqData.populateFields;
		const countData = await mongoDbManager.count(Model, query);

		if (limit === 0 && page > 1) {
			// Return an appropriate response for your use case
			return paginationHandler.paginationResObj(page, 1, countData, []);
		}

		selectFields = selectFields
			? [...new Set(selectFields.split(",")), "_id"]
					// .filter((field) => field !== "userPassword")
					.join(" ")
			: "_id";

		populateFields = populateFields ? getPopulateOptions(populateFields, "_id name") : [];

		let data = await mongoDbManager.findManyWithPopulate(
			Model,
			query,
			limit,
			skip,
			sortOrder,
			selectFields,
			populateFields
		);
		if (data) {
			data = data.map((result) => {
				const { _id, ...rest } = result;
				return { ...rest, id: _id };
			});
		}

		const totalPages = countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);

		return paginationHandler.paginationResObj(page, totalPages, countData, data);
	} catch (error) {
		throw error;
	}
}

async function getUserPermission(id, selectFields = "", populateFields = "", businessUnit) {
	try {
		let query = {
			_id: id
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		selectFields = selectFields
			? [...new Set(selectFields.split(",")), "_id"]
					// .filter((field) => field !== "userPassword")
					.join(" ")
			: ["_id"];
		populateFields = populateFields ? getPopulateOptions(populateFields, "_id name") : [];

		let datum = await mongoDbManager.findOneWithPopulate(
			Model,
			query,
			selectFields,
			populateFields
		);
		if (datum) {
			const { _id, ...rest } = datum;
			return { ...rest, id: _id };
		} else return null;
	} catch (err) {
		throw err;
	}
}


async function updateUserPermission(id, updateObject, businessUnit) {
	try {
		let query = {
			_id: id
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		return await mongoDbManager.updateOne(Model, query, updateObject);
	} catch (error) {
		throw error;
	}
}

async function updateUserPermissions(userPermissionsReqArray, updatedBy) {
	const bulkUpdateOperations = [];
	for (const userPermission of userPermissionsReqArray) {
		const userPermissionReqObj = {
			positivePermissions: userPermission.positivePermissions || [],
			negativePermissions: userPermission.negativePermissions || [],
			updatedBy: updatedBy
		};
		const query = {
			_id: userPermission.id
		};
		// if(req.businessUnit) {
		//     query.businessUnit = req.businessUnit;
		// }
		bulkUpdateOperations.push({
			updateOne: {
				filter: query,
				update: userPermissionReqObj
			}
		});
	}
	return await mongoDbManager.bulkWrite(Model, bulkUpdateOperations);
}

async function checkExistingUserPermissionId(id, businessUnit) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
    }
    const query = {_id: id}
    if(businessUnit) {
        query.businessUnit = businessUnit;
    }
    const existingUserPermission = await mongoDbManager.findOne(Model, query);
    return existingUserPermission !== null;
}

module.exports = {
	createUserPermission,
	getAllUserPermissions,
	getUserPermission,
	updateUserPermission,
	updateUserPermissions,
	checkExistingUserPermissionId
};

const datumCreateResponse = (datum) => {
	return {
		id: datum._id
	};
};
