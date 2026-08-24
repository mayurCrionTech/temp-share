const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const UserType = require("../../../models/mongoDB/organizationManagement/userType_model");
const Model = UserType;
const mongoose = require("mongoose");

async function createUserType(userTypeObject) {
  try {
    const datum = await mongoDbManager.insertOne(Model, userTypeObject);
    return datumCreateResponse(datum);
  } catch (error) {
    throw error;
  }
}

async function getAllUserTypes(reqData, businessUnit) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    if (reqData.departments) {
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
  } catch (error) {
    throw error;
  }
}

async function getUserType(
  id,
  selectFields = "",
  populateFields = "",
  businessUnit
) {
  try {
    let query = {
      // isEnabled : true,
      isDeleted: false,
      _id: id,
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
      return { ...rest, id: _id };
    } else return null;
  } catch (err) {
    throw err;
  }
}

// async function getUserTypeByName(name, businessUnit) {
//   let query = {
//     name: name,
//     // isEnabled: true,
//     isDeleted: false,
//   };
//   if (businessUnit) {
//     query.businessUnit = businessUnit;
//   }
//   return await UserTypeOperations.getUserType(query);
// }

async function enableUserType(id, businessUnit) {
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

async function enableUserTypes(ids, businessUnit) {
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

async function disableUserType(id, businessUnit) {
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

async function disableUserTypes(ids, businessUnit) {
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

async function deleteUserType(id, businessUnit) {
  let query = {
    _id: id,
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  let updateObj = { isDeleted: true };
  return await mongoDbManager.updateOne(Model, query, updateObj);
}

async function deleteUserTypes(ids, businessUnit) {
  let query = {
    _id: { $in: ids },
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  let updateObj = { isDeleted: true };
  return await mongoDbManager.updateMany(Model, query, updateObj);
}

async function updateUserType(id, updateObject, businessUnit) {
  let query = {
    _id: id,
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  return await mongoDbManager.updateOne(Model, query, updateObject);
}

async function checkExistingNameForDepartment(name, department, businessUnit) {
  const query = {
    name: { $regex: new RegExp(`^${name}$`, "i") },
    isDeleted: false,
    department: department,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  const existingNameUserType = await mongoDbManager.findOne(Model, query);
  return existingNameUserType !== null;
}

async function checkExistingUserType(id, businessUnit, department) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const query = { _id: id, isDeleted: false };

  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  if (department) {
    query.department = department;
  }

  const existingUserType = await mongoDbManager.findOne(Model, query);
  return existingUserType;
}

const returnInvalidUserTypes = async (ids, businessUnit) => {
  let invalidUserTypes = ids.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidUserTypes.length > 0) {
    return invalidUserTypes;
  }
  const query = {
    _id: { $in: ids },
    isDeleted: false,
  };
  if (businessUnit) {
    query.businessUnit = businessUnit;
  }
  const existingUserTypes = await mongoDbManager.findManyWithPopulate(
    Model,
    query,
    null,
    null,
    null,
    "_id",
    []
  );

  const filterIds = existingUserTypes.map((userType) =>
    userType._id.toString()
  );

  invalidUserTypes.push(...ids.filter((id) => !filterIds.includes(id)));

  return Array.from(new Set(invalidUserTypes));
};

module.exports = {
  createUserType,
  getAllUserTypes,
  getUserType,
  //   getUserTypeByName,
  enableUserType,
  enableUserTypes,
  disableUserType,
  disableUserTypes,
  deleteUserType,
  deleteUserTypes,
  updateUserType,
  checkExistingUserType,
  checkExistingNameForDepartment,
  returnInvalidUserTypes,
};

const datumCreateResponse = (datum) => {
  return {
    id: datum._id,
  };
};

const userTypeGetAllResponse = (userTypes) => {
  return userTypes.map((userType) => {
    return {
      id: userType._id,
      name: userType.name,
    };
  });
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

