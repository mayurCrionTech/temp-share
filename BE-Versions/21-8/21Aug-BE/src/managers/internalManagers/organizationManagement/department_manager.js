const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Department = require("../../../models/mongoDB/organizationManagement/department_model");
const Model = Department;
const mongoose = require("mongoose");

async function createDepartment(departmentObject) {
  try {
    const department = await mongoDbManager.insertOne(Model, departmentObject);
    return departmentCreateResponse(department);
  } catch (error) {
    throw error;
  }
}

async function getAllDepartments(reqData, businessUnit) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
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

async function getDepartment(
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

// async function getDepartmentByName(name, businessUnit) {

//     let query = {
//         // isEnabled : true,
//         isDeleted : false,
//         name : name
//     };
//     if(businessUnit) {
//         query.businessUnit = businessUnit;
//     }
//     return await DepartmentOperations.getDepartment(query);
// }

async function enableDepartment(id, businessUnit) {
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

async function enableDepartments(ids, businessUnit) {
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

async function disableDepartment(id, businessUnit) {
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

async function disableDepartments(ids, businessUnit) {
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

async function deleteDepartment(id, businessUnit) {
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

async function deleteDepartments(ids, businessUnit) {
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

async function updateDepartment(id, updateObject, businessUnit) {
  try {
      let query = {
          _id: id,
          isDeleted: false
      };
      if(businessUnit) {
          query.businessUnit = businessUnit;
      }
      return await mongoDbManager.updateOne(Model, query, updateObject);
  } catch (error) {
    throw error;
  }
}

async function checkExistingNameForBusinessUnit(name, businessUnit) {
  try {
    const query = {
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    const existingNameDepartment = await mongoDbManager.findOne(Model, query);
    return existingNameDepartment !== null;
  } catch (error) {
    throw error;
  }
}

async function checkExistingDepartment(id, businessUnit) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const query = { _id: id, isDeleted: false };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    const existingDepartment = await mongoDbManager.findOne(Model, query);
    return existingDepartment !== null;
  } catch (error) {
    throw error;
  }
}

async function returnInvalidDepartments(ids, businessUnit) {
  try {
    let invalidDepartments = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidDepartments.length > 0) {
      return invalidDepartments;
    }

    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    const existingDepartments = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      "_id",
      []
    );

    const filterIds = existingDepartments.map((department) =>
      department._id.toString()
    );

    invalidDepartments.push(...ids.filter((id) => !filterIds.includes(id)));

    return Array.from(new Set(invalidDepartments));
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartment,
  // getDepartmentByName,
  enableDepartment,
  enableDepartments,
  disableDepartment,
  disableDepartments,
  deleteDepartment,
  deleteDepartments,
  updateDepartment,
  checkExistingNameForBusinessUnit,
  checkExistingDepartment,
  returnInvalidDepartments,
};

const departmentCreateResponse = (department) => {
  return {
    id: department._id,
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
