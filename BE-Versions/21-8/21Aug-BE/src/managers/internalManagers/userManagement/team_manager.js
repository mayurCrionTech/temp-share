const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Team = require("../../../models/mongoDB/userManagement/team_model");
const Model = Team;
const mongoose = require("mongoose");

async function createTeam(teamObject) {
	try {
		const datum = await mongoDbManager.insertOne(Model, teamObject);
		return datumCreateResponse(datum);
	} catch (err) {
		throw err;
	}
}

async function getAllTeams(reqData, businessUnit) {
	try {
		let query = {
			isEnabled: true,
			isDeleted: false
		};
		if (businessUnit) {
			query.businessUnit = businessUnit;
		}
		// if (reqData.departments) {
		// 	query.department = { $in: reqData.departments };
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

async function getTeam(id, selectFields = "", populateFields = "", businessUnit) {
	try {
		let query = {
			_id: id,
			// isEnabled: true,
			isDeleted: false
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

async function enableTeam(id, businessUnit) {
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

async function enableTeams(ids, businessUnit) {
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

async function disableTeam(id, businessUnit) {
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

async function disableTeams(ids, businessUnit) {
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

async function deleteTeam(id, businessUnit) {
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

async function deleteTeams(ids, businessUnit) {
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

async function updateTeam(id, updateObject, businessUnit) {
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

async function appendUsersToTeam(teamId, users, businessUnit) {
	let query = {
		_id: teamId,
		isDeleted: false
	};
	if (businessUnit) {
		query.businessUnit = businessUnit;
	}
	const updateObject = {
		$push: {
			users: {
				$each: users
			}
		}
	};
	return await mongoDbManager.updateOneEntireDocument(Model, query, updateObject);
}

async function removeUsersFromTeam(teamId, users, businessUnit) {
	let query = {
		_id: teamId,
		isDeleted: false
	};
	if (businessUnit) {
		query.businessUnit = businessUnit;
	}
	const updateObject = {
		$pull: { users: { $in: users } }
	};
	return await mongoDbManager.updateOneEntireDocument(Model, query, updateObject);
}

async function removeUsersFromTeams(usersToDelete) {
	let query = { users: { $in: usersToDelete } };

	let updateObj = { $pull: { users: { $in: usersToDelete } } };

	return await mongoDbManager.updateManyEntireDocument(Model, query, updateObj);
}

async function returnUsersFromTeams(teamsObjs) {
	const users = [];
	teamsObjs.forEach((team) => {
		users.push(...team.users);
	});
	return users;
}

async function checkExistingNameForBusinessUnit(name, department) {
	const query = {
		name: { $regex: new RegExp(`^${name}$`, "i") },
		isDeleted: false
	};
	if (department) {
		query.department = department;
	}
	const existingNameTeam = await mongoDbManager.findOne(Model, query);
	return existingNameTeam !== null;
}

async function checkExistingTeam(id, department) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return false;
	}
	const query = { _id: id, isDeleted: false };
	if (department) {
		query.department = department;
	}
	const existingTeam = await mongoDbManager.findOne(Model, query);
	return existingTeam !== null;
}

const returnInvalidTeams = async (ids, department) => {
	let invalidTeams = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

	if (invalidTeams.length > 0) {
		return invalidTeams;
	}

	const query = {
		_id: { $in: ids },
		isDeleted: false
	};
	if (department) {
		query.department = department;
	}
	const existingTeams = await mongoDbManager.findManyWithPopulate(
		Model,
		query,
		null,
		null,
		null,
		"_id",
		[]
	);

	const filterIds = existingTeams.map((team) => team._id.toString());

	invalidTeams.push(...ids.filter((id) => !filterIds.includes(id)));

	return Array.from(new Set(invalidTeams));
};

const returnValidAndInvalidTeams = async (ids, department) => {
	let invalidTeams = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

	if (invalidTeams.length > 0) {
		return invalidTeams;
	}

	const query = {
		_id: { $in: ids },
		isDeleted: false
	};
	if (department) {
		query.department = department;
	}
	const existingTeams = await mongoDbManager.findManyWithPopulate(
		Model,
		query,
		null,
		null,
		null,
		"_id users",
		[]
	);

	const filterIds = existingTeams.map((team) => team._id.toString());

	invalidTeams.push(...ids.filter((id) => !filterIds.includes(id)));

	let validAndInvalidTeams = {
		validTeams: existingTeams,
		invalidTeams: Array.from(new Set(invalidTeams))
	};
	return validAndInvalidTeams;
};

async function getTeamByName(name, selectFields, populateFields, businessUnit) {
	return getTeamByField("name", name, selectFields, populateFields, businessUnit);
}

module.exports = {
	createTeam,
	getAllTeams,
	getTeam,
	enableTeam,
	enableTeams,
	disableTeam,
	disableTeams,
	deleteTeam,
	deleteTeams,
	updateTeam,
	appendUsersToTeam,
	removeUsersFromTeam,
	returnUsersFromTeams,
	removeUsersFromTeams,
	checkExistingNameForBusinessUnit,
	checkExistingTeam,
	returnInvalidTeams,
	returnValidAndInvalidTeams,
	getTeamByName
};

const datumCreateResponse = (datum) => {
	return {
		id: datum._id
	};
};


function getPopulateOptions(
	populateFieldsInput,
	defaultSelectFields = "_id name"
  ) {
	// Split the input string into an array, remove duplicates, and filter out empty strings
	let populateFields = [
	  ...new Set(populateFieldsInput.split(",").filter(Boolean)),
	];
  
	// Initialize an array to hold the populate objects
	let populateOptions = [];
  
	// Populate each field with the default select fields
	populateFields.forEach((field) => {
	  if (Model.schema.path(field)) {
		// Get the select fields for the current field
		let selectFields = getCustomSelectFieldsOnPopulate(
		  field,
		  defaultSelectFields
		);
  
		// Push the populate object into the options array
		populateOptions.push({ path: field, select: selectFields });
	  }
	});
  
	return populateOptions;
  }
  
  function getCustomSelectFieldsOnPopulate(field, defaultSelectFields) {
	switch (field) {
	  case "createdBy":
		return "_id name"; // Custom select fields for createdBy
	  // Add more cases as needed
	  default:
		return defaultSelectFields;
	}
  }
  


async function getTeamByField(field, value, selectFields = "", populateFields = "", department, businessUnit) {
	let query = {
		[field]: value,
		// isEnabled: true,
		isDeleted: false
	};
	let originalPopulateFields = populateFields;

	if (businessUnit) {
		query.businessUnit = businessUnit;
	}

	if (department) {
		query.department = department;
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
