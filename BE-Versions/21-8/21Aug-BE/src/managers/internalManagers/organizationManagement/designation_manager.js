const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const permissionManager = require("./permission_manager");

const Designation = require("../../../models/mongoDB/organizationManagement/designation_model");
const Model = Designation;
const mongoose = require("mongoose");

async function createDesignation(createObject) {
  try {
    const datum = await mongoDbManager.insertOne(Model, createObject);
    return datumCreateResponse(datum);
  } catch (error) {
    throw error;
  }
}

async function getAllDesignations(reqData, businessUnit) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    if (reqData.userTypes) {
      query.userType = { $in: reqData.userTypes };
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
    let originalPopulateFields = populateFields || [];
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

    populateFields = populateFields
      ? getPopulateOptions(populateFields, "_id name")
      : [];

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
			data = await Promise.all(
				data.map(async (datum) => {
					if (datum && originalPopulateFields.includes("permissions")) {
						// Concatenate and filter permissions
						let permissions = [...datum.permissions];
						let permissionIds = permissions.map((permission) => permission.id);
						let modifiedPermissions = await permissionManager.transformPermissionsToGroupedObject(
							permissionIds
						);
						datum.permissions = modifiedPermissions;
					}
					const { _id, ...rest } = datum;
					return { ...rest, id: _id };
				})
			);
		}

    const totalPages =
      countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);

    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      data
    );
  } catch (error) {
    throw error;
  }
}

async function getDesignation(
  id,
  selectFields = "",
  populateFields = "",
  businessUnit
) {
  let originalPopulateFields = populateFields || [];
  let query = {
    _id: id,
    // isEnabled: true,
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }

  selectFields = selectFields
    ? [...new Set(selectFields.split(",")), "_id"]
        // .filter((field) => field !== "userPassword")
        .join(" ")
    : ["_id"];
  populateFields = populateFields
    ? getPopulateOptions(populateFields, "_id name")
    : [];
  let datum = await mongoDbManager.findOneWithPopulate(
    Model,
    query,
    selectFields,
    populateFields
  );
  if (datum) {
    const { _id, ...rest } = datum;
    datum = { ...rest, id: _id };
  }
  if (originalPopulateFields.includes("permissions") && datum) {
		// Concatenate and filter permissions
		let permissions = [...datum.permissions];
		let permissionIds = permissions.map((permission) => permission.id);
		let modifiedPermissions = await permissionManager.transformPermissionsToGroupedObject(
			permissionIds
		);
		datum.permissions = modifiedPermissions;
	}
  return datum;
}

async function getDesignationByName(name, businessUnit) {
  let query = {
    name: name,
    // isEnabled: true,
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  return await mongoDbManager.findOneWithPopulate(Model, query, "", []);
}

async function enableDesignation(id, businessUnit) {
  try {
    let query = {
      _id: id,
      // isEnabled: false,
      isDeleted: false,
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

async function enableDesignations(ids, businessUnit) {
  try {
    let query = {
      _id: { $in: ids },
      // isEnabled: false,
      isDeleted: false,
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

async function disableDesignation(id, businessUnit) {
  try {
    let query = {
      _id: id,
      // isEnabled: true,
      isDeleted: false,
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

async function disableDesignations(ids, businessUnit) {
  try {
    let query = {
      _id: { $in: ids },
      // isEnabled: true,
      isDeleted: false,
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

async function deleteDesignation(id, businessUnit) {
  try {
    let query = {
      _id: id,
      isDeleted: false,
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

async function deleteDesignations(ids, businessUnit) {
  try {
    let query = {
      _id: { $in: ids },
      isDeleted: false,
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

async function updateDesignation(id, updateObject, businessUnit) {
  try {
    let query = {
      _id: id,
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    return await mongoDbManager.updateOne(Model, query, updateObject);
  } catch (error) {
    throw error;
  }
}

//updateDesignations

// async function updateDesignations( updateObject, businessUnit) {
//     let query = {
//         _id: {$in: ids},
//         isDeleted: false
//     };
//     if(businessUnit) {
//         query.businessUnit = businessUnit;
//     }
//     return await DesignationOperations.updateDesignation(query, updateObject);
// }

async function updateDesignations(req) {
  try {
    const bulkUpdateOperations = [];
    for (const designation of req.body.designations) {
      const designationReqObj = {
        permissions: designation.permissions || [],
        updatedBy: req.userId,
      };
      const query = {
        _id: designation.id,
      };
      // if(req.businessUnit) {
      //     query.businessUnit = req.businessUnit;
      // }
      bulkUpdateOperations.push({
        updateOne: {
          filter: query,
          update: designationReqObj,
        },
      });
    }
    return await mongoDbManager.bulkWrite(Model, bulkUpdateOperations);
  } catch (error) {
    throw error;
  }
}

async function checkExistingNameForUserType(name, userType, businessUnit) {
  try {
    const query = {
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
      userType: userType,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    const existingNameDesignation = await mongoDbManager.findOne(Model, query);
    return existingNameDesignation !== null;
  } catch (error) {
    throw error;
  }
}

const returnInvalidDesignations = async (ids, businessUnit) => {
  try {
    let invalidDesignations = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidDesignations.length > 0) {
      return invalidDesignations;
    }
    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    const existingDesignations = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      "_id",
      []
    );

    const filterIds = existingDesignations.map((designation) =>
      designation._id.toString()
    );

    invalidDesignations.push(...ids.filter((id) => !filterIds.includes(id)));

    return Array.from(new Set(invalidDesignations));
  } catch (error) {
    throw error;
  }
};

async function checkExistingDesignation(id, businessUnit, userType) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const query = { _id: id, isDeleted: false };

    if (businessUnit) {
      query.businessUnit = businessUnit;
    }

    if (userType) {
      query.userType = userType;
    }

    const existingDesignation = await mongoDbManager.findOne(Model, query);
    return existingDesignation;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createDesignation,
  getAllDesignations,
  getDesignation,
  enableDesignation,
  enableDesignations,
  disableDesignation,
  disableDesignations,
  deleteDesignation,
  deleteDesignations,
  updateDesignation,
  getDesignationByName,
  updateDesignations,
  checkExistingNameForUserType,
  returnInvalidDesignations,
  checkExistingDesignation,
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
