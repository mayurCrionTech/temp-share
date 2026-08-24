const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Permission = require("../../../models/mongoDB/organizationManagement/permission_model");
const Model = Permission;
const mongoose = require("mongoose");

async function createPermission(createObject) {
  try {
    const datum = await mongoDbManager.insertOne(Model, createObject);
    return datumCreateResponse(datum);
  } catch (error) {
    throw error;
  }
}

async function getAllPermissions(reqData) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };
    if (reqData.name) {
      query.name = { $regex: reqData.name, $options: "i" };
    }

    if (reqData.permissionGroups) {
      query.permissionGroup = { $in: reqData.permissionGroups };
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
      const logicalOrder = [
        "create",
        "read",
        "update",
        "delete",
        "fillEntry",
        "updateFillEntry",
        "approve",
        "revise",
        
      ];

      data = data
        .map((perm) => ({
          ...perm,
          orderIndex: logicalOrder.indexOf(perm.name) >= 0
            ? logicalOrder.indexOf(perm.name)
            : 999 // unknown permissions go to the end
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(({ orderIndex, ...rest }) => rest); // remove helper field
      // ---- End Logical Sorting ----
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

async function getPermission(
  id,
  selectFields = "",
  populateFields = "",
) {
  try {
    let query = {
      _id: id,
      // isEnabled: true,
      isDeleted: false,
    };

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

async function getPermissions(
  ids,
  selectFields = "",
  populateFields = "",

) {
  try {
    let query = {
      _id: { $in: ids },
    };

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
      null,
      null,
      null,
      selectFields,
      populateFields
    );
    if (data) {
      data = data.map((result) => {
        const { _id, ...rest } = result;
        return { ...rest, id: _id };
      });
    }
    return data;
  } catch (error) {
    throw error;
  }
}


async function enablePermission(id) {
  try {
    let query = {
      _id: id,
      // isEnabled: false,
      isDeleted: false,
    };
    let updateObj = { isEnabled: true };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function enablePermissions(ids) {
  try {
    let query = {
      _id: { $in: ids },
      // isEnabled: false,
      isDeleted: false,
    };
    let updateObj = { isEnabled: true };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function disablePermission(id) {
  try {
    let query = {
      _id: id,
      // isEnabled: true,
      isDeleted: false,
    };
    let updateObj = { isEnabled: false };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function disablePermissions(ids) {
  try {
    let query = {
      _id: { $in: ids },
      // isEnabled: true,
      isDeleted: false,
    };
    let updateObj = { isEnabled: false };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function deletePermission(id) {
  try {
    let query = {
      _id: id,
      isDeleted: false,
    };

    let updateObj = { isDeleted: true };
    return await mongoDbManager.updateOne(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function deletePermissions(ids) {
  try {
    let query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    let updateObj = { isDeleted: true };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function updatePermission(id, updateObject) {
  try {
    let query = {
      _id: id,
      isDeleted: false,
    };
    return await mongoDbManager.updateOne(Model, query, updateObject);
  } catch (error) {
    throw error;
  }
}

async function checkExistingNameForPermissionGroup(
  name,
  permissionGroup,
) {
  try {
    const query = {
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
      permissionGroup: permissionGroup,
    };

    const existingNamePermission = await mongoDbManager.findOne(Model, query);
    return existingNamePermission !== null;
  } catch (error) {
    throw error;
  }
}

async function checkExistingPermission(id, permissionGroup) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const query = { _id: id, isDeleted: false };

    if (permissionGroup) {
      query.permissionGroup = permissionGroup;
    }

    const existingPermission = await mongoDbManager.findOne(Model, query);
    return existingPermission;
  } catch (error) {
    throw error;
  }
}

async function returnInvalidPermissions(ids) {
  try {
    let invalidPermissions = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidPermissions.length > 0) {
      return invalidPermissions;
    }
    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    const existingPermissions = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      "_id",
      []
    );

    const filterIds = existingPermissions.map((permission) =>
      permission._id.toString()
    );

    invalidPermissions.push(...ids.filter((id) => !filterIds.includes(id)));

    return Array.from(new Set(invalidPermissions));
  } catch (error) {
    throw error;
  }
}

async function transformPermissionsToGroupedObject(permissionIds) {
  const permission = await getPermissions(
    permissionIds,
    "name",
    "permissionGroup"
  );
  //
  let modifiedPermissions = await permission.reduce(
    (
      acc,
      { id, name: permissionName, permissionGroup: { name: groupName } }
    ) => {
      acc[groupName] ??= {};
      acc[groupName][permissionName] = { id };
      return acc;
    },
    {}
  );
  return modifiedPermissions;
}

module.exports = {
  createPermission,
  getAllPermissions,
  getPermission,
  getPermissions,
  //   getPermissionByName,
  enablePermission,
  enablePermissions,
  disablePermission,
  disablePermissions,
  deletePermission,
  deletePermissions,
  updatePermission,
  checkExistingNameForPermissionGroup,
  checkExistingPermission,
  returnInvalidPermissions,
  transformPermissionsToGroupedObject,
};

const datumCreateResponse = (department) => {
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
