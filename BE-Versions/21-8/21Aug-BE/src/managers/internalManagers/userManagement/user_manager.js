const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");

const permissionManager = require("../../internalManagers/organizationManagement/permission_manager");

const User = require("../../../models/mongoDB/userManagement/user_model");
const mongoose = require("mongoose");
const fileManager = require("../fileSystem/fileSystem_manager");
const Model = User;

async function createUser(createObject) {
	try {
		const datum = await mongoDbManager.insertOne(Model, createObject);
		return datumCreateResponse(datum);
	} catch (error) {
		throw error;
	}
}

async function getAllUsers(req, reqData, businessUnit) {
	let query = {
		// isEnabled: true, CR0031 - Restricted unwanted  Show BU Screen
		isDeleted: false,
		$or: [
			{ isDraft: { $exists: false } },
			{ isDraft: false },
			{ isDraft: true, createdBy: reqData.userId }
		]
	};

	if (businessUnit) {
		query.businessUnit = businessUnit;
	}
	// if (reqData.departments) {
	// 	query.department = { $in: [reqData.departments] };
	// }
	const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
	if (reqData.departments) {
	let departmentsArray = Array.isArray(reqData.departments)
		? reqData.departments
		: reqData.departments.split(",");

	query.department = {
		$in: departmentsArray
			.map((id) => id.trim())
			.filter(isValidObjectId)
			.map((id) => new mongoose.Types.ObjectId(id)),
	};
}
	if (reqData.userTypes) {
		query.userType = { $in: reqData.userTypes };
	}
	if (reqData.designations) {
		query.designation = { $in: reqData.designations };
	}
	if (reqData.teams) {
		query.team = { $in: reqData.teams };
	}
	if (reqData.reportsTos) {
		query.reportsTo = { $in: reqData.reportsTos };
	}
	if (reqData.withoutTeam === "true") {
		query.team = null;
	}
	if (reqData.createdAt) {
		query.createdAt = reqData.createdAt;
	}
	if (reqData.updatedAt) {
		query.updatedAt = reqData.updatedAt;
	}
	if (reqData.name) {
		query.name = { $regex: reqData.name, $options: "i" };
	}
	if (reqData.ids) {
		query._id = { $in: reqData.ids };
	}

	const page = parseInt(reqData.page) || 1;
	const limit = parseInt(reqData.limit) || 0;
	const skip = (page - 1) * limit;

	const sort = reqData.sort || "createdAt";
	const order = reqData.order === "desc" ? -1 : 1;
	const sortOrder = { [sort]: order };
	let selectFields = reqData.selectFields;
	let populateFields = reqData.populateFields;
	let originalPopulateFields = populateFields || "";
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

	if (populateFields) {
		populateFields = [...new Set(populateFields.split(",").filter(Boolean))];
		// originalPopulateFields = populateFields;
		if (populateFields.includes("permissions")) {
			if (!populateFields.includes("userPermissions")) {
				populateFields.push("userPermission");
			}
			if (!populateFields.includes("designations")) {
				populateFields.push("designation");
			}
		}
	}
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

	if (data.length > 0) {
		if (originalPopulateFields.includes("image")) {
			for (let i = 0; i < data.length; i++) {
				if (data[i].image && req) {
					data[i].image = await fileManager.transformFileObj(data[i].image, "download", req.get("host"), req.protocol);
				}
			}
		}
		if (originalPopulateFields.includes("eSignature")) {
			for (let i = 0; i < data.length; i++) {
				if (data[i].eSignature && req) {
					data[i].eSignature = await fileManager.transformFileObj(data[i].eSignature, "download", req.get("host"), req.protocol);
				}
			}
		}
		if (originalPopulateFields.includes("permissions")) {
			for (let i = 0; i < data.length; i++) {
				data[i] = await processPermissions(data[i], originalPopulateFields);
			}
		}
		if (originalPopulateFields.includes("userPermission")) {
			for (let i = 0; i < data.length; i++) {
				data[i] = await processUserPermissions(data[i]);
			}
		}
		if (originalPopulateFields.includes("designation")) {
			for (let i = 0; i < data.length; i++) {
				data[i] = await processDesignation(data[i]);
			}
		}
	}

	return paginationHandler.paginationResObj(page, totalPages, countData, data);
}

async function getUser(req, id, selectFields, populateFields, businessUnit) {
	return getUserByField(req, "_id", id, selectFields, populateFields, businessUnit);
}

async function getUserByEmail(req, email, selectFields, populateFields, businessUnit) {
	return getUserByField(req, "email", email, selectFields, populateFields, businessUnit);
}

async function getUsersByEmail(email) {
	try {
		const users = await mongoDbManager.findAll(Model, {
			email: { $regex: new RegExp(`^${email}$`, "i") },
			isDeleted: false
		})

			return users.map(user => {
			const { _id, ...rest } = user;
			return { ...rest, id: _id };
		});
	} catch (error) {
		throw error;
	}
}

async function getUserByEmployeeId(req, employeeId, selectFields, populateFields, businessUnit) {
	return getUserByField(req, "employeeId", employeeId, selectFields, populateFields, businessUnit);
}

async function getUserByBuUserId(req, buUserId, selectFields, populateFields, businessUnit) {
	return getUserByField(req, "buUserId", buUserId, selectFields, populateFields, businessUnit);
}

async function enableUser(id, businessUnit) {
	try {
		let query = {
			_id: id,
			// isEnabled: false,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isEnabled: true };
		return await mongoDbManager.updateOne(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function enableUsers(ids, businessUnit) {
	try {
		let query = {
			_id: { $in: ids },
			// isEnabled: false,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isEnabled: true };
		return await mongoDbManager.updateMany(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function disableUser(id, businessUnit) {
	try {
		let query = {
			_id: id,
			// isEnabled: true,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isEnabled: false };
		return await mongoDbManager.updateOne(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function disableUsers(ids, businessUnit) {
	try {
		let query = {
			_id: { $in: ids },
			// isEnabled: true,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isEnabled: false };
		return await mongoDbManager.updateMany(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function deleteUser(id, businessUnit) {
	try {
		let query = {
			_id: id,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isDeleted: true };
		return await mongoDbManager.updateOne(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function deleteUsers(ids, businessUnit) {
	try {
		let query = {
			_id: { $in: ids },
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		let updateObj = { isDeleted: true };
		return await mongoDbManager.updateMany(Model, query, updateObj);
	} catch (error) {
		throw error;
	}
}

async function updateUser(id, updateObject, businessUnit) {
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

async function updateUsers(ids, updateObject, businessUnit) {
	let query = {
		_id: { $in: ids },
		isDeleted: false
	};
	if (businessUnit) {
		query.businessUnit = businessUnit;
	}
	return await mongoDbManager.updateMany(Model, query, updateObject);
}
async function removeTeamFromUsers(userIds) {
	try {
		let query = {
			_id: { $in: userIds },
			isDeleted: false
		};
		return await mongoDbManager.updateMany(Model, query, { team: null });
	} catch (error) {
		throw error;
	}
}
// async function getTotalAndEnabledUsers() {
//     const aggregationPipeline = [
//         {
//             $group: {
//                 _id: null,
//                 totalUsers: { $sum: 1 },
//                 enabledUsers: {
//                     $sum: {
//                         $cond: [
//                             { $and: [{ $eq: ["$isDeleted", false] }, { $eq: ["$isEnabled", true] }] },
//                             1,
//                             0
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 _id: 0, // Exclude the _id field
//                 totalUsers: 1,
//                 enabledUsers: 1
//             }
//         }
//     ];
//     return await UserOperations.getUsersByAggregation(aggregationPipeline) || { totalUsers: 0, enabledUsers: 0 };;
// }
async function getTotalAndEnabledUsers(reqData, businessUnit) {
	try {
		let query = {
			isDeleted: false,
			$or: [
				{ isDraft: { $exists: false } },
				{ isDraft: false },
				{ isDraft: true, createdBy: reqData.userId }
			]
		};

		if (businessUnit) {
			query.businessUnit = businessUnit;
		}

		const totalUsers = await mongoDbManager.count(Model, query);

		query.isEnabled = true;

		const enabledUsers = await mongoDbManager.count(Model, query);

		return { totalUsers, enabledUsers };
	} catch (error) {
		console.error("Error in getUserStatistics:", error);
		return null;
	}
}

async function checkExistingEmployeeIdForBusinessUnit(employeeId, businessUnit) {
	try {
		const query = {
			employeeId: { $regex: new RegExp(`^${employeeId}$`, "i") },
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		const existingNameUser = await mongoDbManager.findOne(Model, query);
		return existingNameUser || false;
	} catch (error) {
		throw error;
	}
}

async function checkExistingEmailForBusinessUnit(email, businessUnit) {
	try {
		const query = {
			email: { $regex: new RegExp(`^${email}$`, "i") },
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		const existingNameUser = await mongoDbManager.findOne(Model, query);
		return existingNameUser || false;
	} catch (error) {
		throw error;
	}
}
async function checkExistingUser(id, businessUnit) {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return false;
		}
		const query = { _id: id, isDeleted: false };
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		const existingUser = await mongoDbManager.findOne(Model, query);
		return existingUser !== null;
	} catch (error) {
		throw error;
	}
}

const returnInvalidUserIds = async (ids, businessUnit, department) => {
	try {
		let invalidUserIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidUserIds.length > 0) {
			return invalidUserIds;
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		if (department) {
			query.department = department;
		}
		const existingUsers = await mongoDbManager.findManyWithPopulate(
			Model,
			query,
			null,
			null,
			null,
			"_id",
			[]
		);

		const existingUserIds = existingUsers.map((user) => user._id.toString());

		invalidUserIds.push(...ids.filter((id) => !existingUserIds.includes(id)));

		return Array.from(new Set(invalidUserIds));
	} catch (error) {
		throw error;
	}
};

const returnUsersWithoutTeam = async (ids, businessUnit, department) => {
	try {
		let invalidUserIdsWithoutTeam = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
		if (invalidUserIdsWithoutTeam.length > 0) {
			return invalidUserIdsWithoutTeam;
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false,
			team: null
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		if (department) {
			query.department = department;
		}
		const existingUsers = await mongoDbManager.findManyWithPopulate(
			Model,
			query,
			null,
			null,
			null,
			"_id",
			[]
		);
		const existingUserIds = existingUsers.map((user) => user._id.toString());

		invalidUserIdsWithoutTeam.push(...ids.filter((id) => !existingUserIds.includes(id)));

		return Array.from(new Set(existingUserIds));
	} catch (error) {
		throw error;
	}
};

const returnUsersWithSpecificTeam = async (ids, team, businessUnit, department) => {
	try {
		let invalidUserIdsWithSpecificTeam = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidUserIdsWithSpecificTeam.length > 0) {
			return invalidUserIdsWithSpecificTeam;
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false,
			team: team
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		if (department) {
			query.department = department;
		}
		const existingUsers = await User.find(query).select("_id");
		const existingUserIds = existingUsers.map((user) => user._id.toString());
		invalidUserIdsWithSpecificTeam.push(...ids.filter((id) => existingUserIds.includes(id)));
		return Array.from(new Set(invalidUserIdsWithSpecificTeam));
	} catch (error) {
		throw error;
	}
};

/**
 * Get all users linked to a specific authentication
 * @param {string} authId - The authentication ID
 * @returns {Promise<Array>} Array of users
 */
async function getUsersByAuthentication(authId) {
	
	try {
		const users = await mongoDbManager.findAll(Model, {
			userAuthentication: authId,
			isEnabled: true,
			isDeleted: false
		});
		return users.map(user => {
			const { _id, ...rest } = user;
			return { ...rest, id: _id };
		});
	} catch (error) {
		throw error;
	}
}

/**
 * Get a user by authentication ID and business unit ID
 * @param {string} authId - The authentication ID
 * @param {string} businessUnitId - The business unit ID
 * @returns {Promise<Object>} The user object
 */
async function getUserByAuthAndBusinessUnit(authId, businessUnitId) {
	try {
		const user = await mongoDbManager.findOne(Model, {
			userAuthentication: authId,
			businessUnit: businessUnitId,
			isEnabled: true,
			isDeleted: false
		}, "businessUnit", "businessUnit organization");

		if (!user) return null;

		const { _id, ...rest } = user;
		return { ...rest, id: _id };
	} catch (error) {
		throw error;
	}
}

module.exports = {
	createUser,
	getAllUsers,
	getUser,
	getUserByEmail,
	getUsersByEmail,
	getUserByEmployeeId,
	getUserByBuUserId,
	enableUser,
	enableUsers,
	disableUser,
	disableUsers,
	deleteUser,
	deleteUsers,
	updateUser,
	updateUsers,
	removeTeamFromUsers,
	getTotalAndEnabledUsers,
	checkExistingEmployeeIdForBusinessUnit,
	checkExistingEmailForBusinessUnit,
	checkExistingUser,
	returnInvalidUserIds,
	returnUsersWithoutTeam,
	returnUsersWithSpecificTeam,
	getUsersByAuthentication,
	getUserByAuthAndBusinessUnit
};

const datumCreateResponse = (datum) => {
	return {
		id: datum._id,
		name: datum.name,
		reportsTo: datum.reportsTo,
		department: datum.department
	};
};

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

function getCustomSelectFieldsOnPopulate(field, defaultSelectFields) {
	switch (field) {
		case "createdBy":
			return "_id name email";
		case "updatedBy":
			return "_id name email";
		case "designation":
			return "id name permissions";
		case "shift":
			return "id name shiftHours";
		case "userPermission":
			return "id positivePermissions negativePermissions";
		case "image":
			return "id name extension contentType size storageLocation moduleName moduleId";
		case "eSignature":
			return "id name extension contentType size storageLocation moduleName moduleId";
		default:
			return defaultSelectFields;
	}
}

async function processDesignation(datum) {
	// Initialize designation if it doesn't exist
	if (!datum.designation) {
		datum.designation = { id: "", name: "", permissions: [] };
	}
	if (!datum.designation.permissions) datum.designation.permissions = [];

	const designationPermissionsSet = new Set(datum.designation.permissions.map(String));
	const designationPermissions = [...designationPermissionsSet];

	// Fetch and transform designation permissions
	if (designationPermissions.length > 0) {
		const userNegativePermission = await permissionManager.getPermissions(
			designationPermissions,
			"name",
			"permissionGroup"
		);

		let modifiedDesignationPermissions = userNegativePermission.reduce(
			(acc, { id, name: permissionName, permissionGroup: { name: groupName } }) => {
				acc[groupName] ??= {};
				acc[groupName][permissionName] = { id };
				return acc;
			},
			{}
		);

		datum.designation.permissions = modifiedDesignationPermissions;
	} else {
		delete datum.designation.permissions;
	}

	return datum;
}

async function processUserPermissions(datum) {
	// Initialize userPermission if it doesn't exist
	if (!datum.userPermission) {
		datum.userPermission = {
			positivePermissions: [],
			negativePermissions: []
		};
	}
	if (!datum.userPermission.positivePermissions) datum.userPermission.positivePermissions = [];
	if (!datum.userPermission.negativePermissions) datum.userPermission.negativePermissions = [];

	// Concatenate and filter permissions
	let positivePermissions = [...datum.userPermission.positivePermissions];
	const negativePermissionsSet = new Set(datum.userPermission.negativePermissions.map(String));
	const negativePermissions = [...negativePermissionsSet];

	// Fetch and transform positive permissions
	if (positivePermissions.length > 0) {
		const userPositivePermission = await permissionManager.getPermissions(
			positivePermissions,
			"name",
			"permissionGroup"
		);

		let modifiedPositivePermissions = userPositivePermission.reduce(
			(acc, { id, name: permissionName, permissionGroup: { name: groupName } }) => {
				acc[groupName] ??= {};
				acc[groupName][permissionName] = { id };
				return acc;
			},
			{}
		);

		datum.userPermission.positivePermissions = modifiedPositivePermissions;
	}

	// Fetch and transform negative permissions
	if (negativePermissions.length > 0) {
		const userNegativePermission = await permissionManager.getPermissions(
			negativePermissions,
			"name",
			"permissionGroup"
		);

		let modifiedNegativePermissions = userNegativePermission.reduce(
			(acc, { id, name: permissionName, permissionGroup: { name: groupName } }) => {
				acc[groupName] ??= {};
				acc[groupName][permissionName] = { id };
				return acc;
			},
			{}
		);

		datum.userPermission.negativePermissions = modifiedNegativePermissions;
	}

	return datum;
}

async function processPermissions(datum, originalPopulateFields) {
	// Concatenate and filter permissions
	const allPermissions = [];
	if (datum.designation && datum.designation.permissions)
		allPermissions.push(...datum.designation.permissions);
	if (datum.userPermission && datum.userPermission.positivePermissions)
		allPermissions.push(...datum.userPermission.positivePermissions);

	let filteredPermissions = allPermissions;

	if (datum.userPermission && datum.userPermission.negativePermissions) {
		const negativePermissionsSet = new Set(datum.userPermission.negativePermissions.map(String));

		filteredPermissions = allPermissions.filter(
			(permission) => !negativePermissionsSet.has(String(permission))
		);
	}

	// Extract unique elements
	const uniquePermissions = [...new Set(filteredPermissions)];

	// Fetch user permissions
	const userPermission = await permissionManager.getPermissions(
		uniquePermissions,
		"name",
		"permissionGroup"
	);

	// Transform user permissions into desired structure
	const permission = userPermission.reduce(
		(acc, { id, name: permissionName, permissionGroup: { name: groupName } }) => {
			acc[groupName] ??= {};
			acc[groupName][permissionName] = { id };
			return acc;
		},
		{}
	);
	datum.permissions = permission;

	// Clean up datum if necessary
	if (!originalPopulateFields.split(",").includes("userPermission")) {
		if (datum.userPermission) delete datum.userPermission;
	}
	if (!originalPopulateFields.split(",").includes("designationPermissions")) {
		if (datum.designation && datum.designation.permissions) delete datum.designation.permissions;
	}
	if (!originalPopulateFields.split(",").includes("designation")) {
		if (datum.designation) delete datum.designation;
	}

	return datum;
}

async function getUserByField(req, field, value, selectFields = "", populateFields = "", businessUnit) {
	let query = {
		[field]: value,
		// isEnabled: true,
		isDeleted: false
	};
	let originalPopulateFields = populateFields;

	if (businessUnit) {
		query.businessUnit = businessUnit;
	}

	selectFields = selectFields ? [...new Set(selectFields.split(",")), "_id"].join(" ") : ["_id"];

	if (populateFields) {
		populateFields = [...new Set(populateFields.split(",").filter(Boolean))];
		if (populateFields.includes("permissions")) {
			if (!populateFields.includes("userPermissions")) {
				populateFields.push("userPermission");
			}
			if (!populateFields.includes("designations")) {
				populateFields.push("designation");
			}
		}
	}
	populateFields = populateFields ? getPopulateOptions(populateFields, "_id name") : [];

	let datum = await mongoDbManager.findOneWithPopulate(Model, query, selectFields, populateFields);

	if (datum) {
		const { _id, ...rest } = datum;
		datum = { ...rest, id: _id };
		if (datum.image && req) {
			datum.image = await fileManager.transformFileObj(datum.image, "download", req.get("host"), req.protocol);
		}
		if (datum.eSignature && req) {
			datum.eSignature = await fileManager.transformFileObj(datum.eSignature, "download", req.get("host"), req.protocol);
		}

		if (originalPopulateFields.includes("permissions")) {
			datum = await processPermissions(datum, originalPopulateFields);
		}
		if (originalPopulateFields.includes("userPermission")) {
			datum = await processUserPermissions(datum);
		}
		if (originalPopulateFields.includes("designation")) {
			datum = await processDesignation(datum);
		}
	}

	return datum;
}
