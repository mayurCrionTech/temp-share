const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const PermissionGroup = require("../../../models/mongoDB/organizationManagement/permissionGroup_model");
const Model = PermissionGroup;
const mongoose = require("mongoose");

async function createPermissionGroup(permissionGroupObject) {
  try {
    const datum = await mongoDbManager.insertOne(Model, permissionGroupObject);
    return permissionGroupCreateResponse(datum);
  } catch (error) {
    throw error;
  }
}

async function getAllPermissionGroups(reqData) {
  try {
    let query = {
      isEnabled: true,
      isDeleted: false,
    };

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

async function getPermissionGroup(
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
  } catch (error) {
    throw err;
  }
}


async function enablePermissionGroup(id) {
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

async function enablePermissionGroups(ids) {
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

async function disablePermissionGroup(id) {
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

async function disablePermissionGroups(ids) {
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

async function deletePermissionGroup(id) {
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

async function deletePermissionGroups(ids) {
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

async function updatePermissionGroup(id, updateObject) {
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

async function checkExistingNameForBusinessUnit(name) {
  const query = {
    name: { $regex: new RegExp(`^${name}$`, "i") },
    isDeleted: false,
  };
  const existingNamePermissionGroup = await mongoDbManager.findOne(Model, query);
  return existingNamePermissionGroup !== null;
}

async function checkExistingPermissionGroup(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  const query = { _id: id, isDeleted: false };
  const existingPermissionGroup = await mongoDbManager.findOne(Model, query);
  return existingPermissionGroup !== null;
}

async function returnInvalidPermissionGroups(ids) {
  let invalidPermissionGroups = ids.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidPermissionGroups.length > 0) {
    return invalidPermissionGroups;
  }

  const query = {
    _id: { $in: ids },
    isDeleted: false,
  };
  const existingPermissionGroups = await mongoDbManager.findManyWithPopulate(
    Model,
    query,
    null,
    null,
    null,
    "_id",
    []
  );

  const filterIds = existingPermissionGroups.map((permissionGroup) =>
    permissionGroup._id.toString()
  );

  invalidPermissionGroups.push(...ids.filter((id) => !filterIds.includes(id)));

  return Array.from(new Set(invalidPermissionGroups));
};

module.exports = {
  createPermissionGroup,
  getAllPermissionGroups,
  getPermissionGroup,
  //   getPermissionGroupByName,
  enablePermissionGroup,
  enablePermissionGroups,
  disablePermissionGroup,
  disablePermissionGroups,
  deletePermissionGroup,
  deletePermissionGroups,
  updatePermissionGroup,
  checkExistingNameForBusinessUnit,
  checkExistingPermissionGroup,
  returnInvalidPermissionGroups,
};

const permissionGroupCreateResponse = (permissionGroup) => {
  return {
    id: permissionGroup._id,
  };
};

const permissionGroupGetAllResponse = (permissionGroups) => {
  return permissionGroups.map((permissionGroup) => {
    return {
      id: permissionGroup._id,
      name: permissionGroup.name,
    };
  });
};
