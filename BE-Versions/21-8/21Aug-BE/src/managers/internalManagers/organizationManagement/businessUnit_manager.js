// organizationManagement.db.js

const { mongoDbManager } = require("../../dBManagers");
const BusinessUnit = require("../../../models/mongoDB/organizationManagement/businessUnit_model");
const paginationHandler = require("../../common/paginationHandler_manager");
const userManager = require("../userManagement/user_manager");
const mongoose = require("mongoose");
const Model = BusinessUnit;
async function createBusinessUnit(businessUnitObject) {
  try {
    const businessUnit = await mongoDbManager.insertOne(
      Model,
      businessUnitObject
    );
    return businessUnitCreateResponse(businessUnit);
  } catch (err) {
    console.error("Error creating BusinessUnit:", err.message, err.stack);
    throw err;
  }
}
async function checkExistingBusinessUnit(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const existingBusinessUnit = await mongoDbManager.findOne(Model, {
      _id: id,
      isDeleted: false,
    });
    return existingBusinessUnit !== null;
  } catch (err) {
    throw err;
  }
}

async function getAllBusinessUnits(reqData, businessUnit) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };

    if (reqData.name) {
      query.name = { $regex: reqData.name, $options: "i" };
    }
    if (reqData.shortName) {
      query.shortName = { $regex: reqData.shortName, $options: "i" };
    }
    if (businessUnit) {
      query._id = businessUnit;
    }
     if (reqData.organization) {
      query.organization = reqData.organization;
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
      data = data.map((result) => {
        const { _id, ...rest } = result;
        return { ...rest, id: _id };
      });
    }

    const totalPages =
      countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);

    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      data
    );
  } catch (err) {
    throw err;
  }
}

async function getBusinessUnit(id, selectFields = "", populateFields = "") {

  try {
    let query = {
      // isEnabled : true,
      isDeleted: false,
      _id: id,
    };
    selectFields = selectFields
    ? [...new Set(selectFields.split(",")), "_id"]
    // .filter((field) => field !== "userPassword")
    .join(" ")
    : ["_id"];
    populateFields = populateFields
    ? getPopulateOptions(populateFields, "_id name allowedDomains isDomainRestricted")
    : [];
    
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

async function returnInvalidBusinessUnits(ids) {
  try {
    let invalidBusinessUnits = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidBusinessUnits.length > 0) {
      return invalidBusinessUnits;
    }
    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    const existingBusinessUnits = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      "_id",
      []
    );
    // const existingBusinessUnits = await BusinessUnit.find().select('_id');

    const validBusinessUnits = existingBusinessUnits.map(
      (existingBusinessUnit) => existingBusinessUnit._id.toString()
    );

    // Use spread (...) to add individual elements instead of an array
    invalidBusinessUnits.push(
      ...ids.filter((id) => !validBusinessUnits.includes(id))
    );

    return Array.from(new Set(invalidBusinessUnits));
  } catch (err) {
    throw err;
  }
}

async function returnNewBuUserIdAndName(req, id, selectFields, populateFields, businessUnit) {
	let query = {
		// isEnabled : true,
    isDeleted: false,
    _id: id,
	};
  
  selectFields = selectFields
		? [...new Set(selectFields.split(",")), "_id"].join(" ")
    : ["name", "shortName", "_id", "usersCount"];
  
  populateFields = populateFields ? getPopulateOptions(populateFields, "_id name") : [];

	businessUnit = await mongoDbManager.findOneWithPopulate(Model, query, selectFields);
	let buUserId = businessUnit.shortName + (businessUnit.usersCount + 1);
  const existingBuUserId = await userManager.getUserByBuUserId(req, buUserId);
	// const existingBuUserId = await UserDbOperations.getUser({ buUserId: buUserId });
  if (existingBuUserId != null) {
    throw new Error("Failed! BuUserId  already exists!")
	}

	return {
		buUserId,
		name: businessUnit.name
	};
}

async function getBusinessUnitByName(name, selectFields, organizationId) {
  let query = {
    // isEnabled : true,
    isDeleted: false,
    name: name,
  };
  if (organizationId) {
    query.organization = organizationId;
  }
  selectFields = selectFields
    ? [...new Set(selectFields.split(",")), "name", "shortName", "_id"].join(
        " "
      )
    : "name shortName _id";

  return await mongoDbManager.findOneWithPopulate(Model, query, selectFields);
}
async function getBusinessUnitByShortName(shortName, selectFields, organizationId) {
  let query = {
    // isEnabled : true,
    isDeleted: false,
    shortName: shortName,
  };
   if (organizationId) {
    query.organization = organizationId;
  }
  selectFields = selectFields
    ? [...new Set(selectFields.split(",")), "name", "shortName", "_id"].join(
        " "
      )
    : "name shortName _id";

  return await mongoDbManager.findOneWithPopulate(Model, query, selectFields);
}

async function enableBusinessUnit(id) {
  try {
    let query = {
      isDeleted: false,
      _id: id,
    };
    let updateObj = { isEnabled: true };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function enableBusinessUnits(ids) {
  try {
    let query = {
      isDeleted: false,
      _id: { $in: ids },
    };
    let updateObj = { isEnabled: true };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function disableBusinessUnit(id) {
  try {
    let query = {
      isDeleted: false,
      _id: id,
    };
    let updateObj = { isEnabled: false };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function disableBusinessUnits(ids) {
  try {
    let query = {
      isDeleted: false,
      _id: { $in: ids },
    };
    let updateObj = { isEnabled: false };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function deleteBusinessUnit(id) {
  try {
    let query = {
      isDeleted: false,
      _id: id,
    };
    let updateObj = { isDeleted: true };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function deleteBusinessUnits(ids) {
  try {
    let query = {
      isDeleted: false,
      _id: { $in: ids },
    };
    let updateObj = { isDeleted: true };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function updateBusinessUnit(id, updateObj) {
  try {
    let query = {
      isDeleted: false,
      _id: id,
    };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}
async function updateBusinessUnitUserCountByOne(id) {
  let query = {
    isDeleted: false,
    _id: id,
  };
  let businessUnitObject = {
    $inc: { usersCount: 1 },
  };
  return await mongoDbManager.updateOne(Model, query, businessUnitObject);
}

module.exports = {
  createBusinessUnit,
  getAllBusinessUnits,
  getBusinessUnit,
  returnNewBuUserIdAndName,
  enableBusinessUnit,
  enableBusinessUnits,
  disableBusinessUnit,
  disableBusinessUnits,
  deleteBusinessUnit,
  deleteBusinessUnits,
  updateBusinessUnit,
  updateBusinessUnitUserCountByOne,
  getBusinessUnitByName,
  checkExistingBusinessUnit,
  getBusinessUnitByShortName,
  returnInvalidBusinessUnits,
};

const businessUnitCreateResponse = (businessUnit) => {
  return {
    id: businessUnit._id,
  };
};

// const businessUnitGetAllResponse = (businessUnits) => {
//   return businessUnits.map((businessUnit) => {
//     return {
//       id: businessUnit._id,
//       name: businessUnit.name,
//       shortName: businessUnit.shortName,
//     };
//   });
// };

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
