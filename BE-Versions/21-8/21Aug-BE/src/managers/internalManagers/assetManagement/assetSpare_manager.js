const {AssetSpare} = require("../../../models/mongoDB/assetManagement/assetSpare_model")
const Model = AssetSpare;
const{Spares} = require("../../../models/mongoDB/spareManagement/spare_model")
const {Assets} = require("../../../models/mongoDB/assetManagement/asset_model.js")
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const { default: mongoose } = require("mongoose");
const {
  fetchEngineerUserTypeByDepartment,
  getUserTypeAndNameUsingUserId,
} = require("../../../utils/socket/socketUserHandler")
const {
	sendViaUserType,
  } = require('../../../utils/socket/socketHandler.js')
const User = require("../../../models/mongoDB/userManagement/user_model.js")
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")


async function createAssetSpare(spareObject) {
  try {
    const spare = await mongoDbManager.insertOne(
      Model,
      spareObject
    );
    return spare;
  } catch (error) {
    throw error;
  }
}

async function addRecommendedQuantity(assetSpareId) {
  try {
    if (!assetSpareId) {
      throw new Error("AssetSpare ID is required.");
    }

    // 1. Aggregate the specific AssetSpare by ID
    const spareRecommendation = await mongoDbManager.aggregation(Model,[
      {
        $match: {
          _id: new mongoose.Types.ObjectId(assetSpareId),
          minimumRequiredQuantity: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$spare",
          totalToAdd: { $sum: "$minimumRequiredQuantity" }
        }
      }
    ]);

    // 2. If there's a valid recommendation, update the corresponding spare
    if (spareRecommendation.length > 0) {
      const { _id, totalToAdd } = spareRecommendation[0];

      await mongoDbManager.updateOne(Spares,
        { _id },
        { $inc: { recommendedQuantity: totalToAdd } }
      );

      return { message: `Recommended quantity incremented for spare ${_id}.` };
    } else {
      return { message: "No applicable minimumRequiredQuantity found or invalid AssetSpare ID." };
    }
  } catch (error) {
    throw error;
  }
}

async function updateAssetSpare (assetId, assetSpareId, updateObj, newMinimumQuantity, oldMinimumQuantity ){
   try{
      const updatedSpare = await mongoDbManager.updateOne(Model,
        { _id: assetSpareId, asset: assetId }, // Match documents with IDs in the spareIds array
        { $set: updateObj } // Set the asset field to assetId
        );
        if(newMinimumQuantity){
          await updateAssetSpareMinimumQuantity(assetSpareId, updateObj.spare, newMinimumQuantity, oldMinimumQuantity )
        }
      return updatedSpare;
    }catch(error){
      throw error;
    }
}

async function updateAssetSpareMinimumQuantity(assetSpareId, spareId, newMinimumRequiredQuantity, oldQuantity) {
  try {

    if (!assetSpareId || typeof newMinimumRequiredQuantity !== 'number') {
      throw new Error("AssetSpare ID and new minimumRequiredQuantity are required.");
    }
    const delta = newMinimumRequiredQuantity - oldQuantity;

    // 3. Adjust the corresponding Spare's recommendedQuantity
    if (delta !== 0) {
      await mongoDbManager.updateOne(
        Spares,
        { _id: spareId },
        { $inc: { recommendedQuantity: delta } }
      );
    }

    return { message: "AssetSpare updated and Spare's recommendedQuantity adjusted." };
  } catch (error) {
    throw error;
  }
}


async function getAllAssetSpare(reqData, asset) {
  try {
    const queryObj = queryBuilder(reqData, asset);
    const fieldMapping = fieldMappings();
    const countData = await mongoDbManager.count(Model, queryObj.query);

        if (queryObj.page === null && queryObj.limit === null) {
          queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
          queryObj.page = 1; // Set page to 1 if no page is provided
        } else if (queryObj.page === null) {
          queryObj.page = 1; // Set default page to 1 if not provided
        } else if (queryObj.limit === null) {
          queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
        }
    
        if (queryObj.limit === 0 && queryObj.page > 1) {
          return paginationHandler.paginationResObj(
            queryObj.page,
            1,
            countData,
            []
          );
        }
    const populateFields = ["spare","asset"];
    const selecteFields = ["spare","minimumRequiredQuantity","unit","cycleFrequency","replacementFrequency"];


    let data = await mongoDbManager.fetchAllAndPopulate(
      Model,
      queryObj.query,
      fieldMapping,
      queryObj.limit,
      queryObj.page,
      queryObj.sortOrder,
      populateFields,
      selecteFields
    );

    if (data) {
  data = data.map((result) => {
    const { _id, spare, ...rest } = result;

    let updatedSpare = spare;
    if (spare && typeof spare === "object") {
      const combinedName = `${spare.name || ''} - ${spare.specification || ''}`.replace(/^-|-$/g, '');
      updatedSpare = {
        ...spare,
        name: combinedName
      };
      delete updatedSpare.specification; // optional: remove specification if no longer needed separately
    }

    return {
      ...rest,
      id: _id,
      spare: updatedSpare
    };
  });
}
    const totalPages =
      countData === 0
        ? 0
        : queryObj.limit === 0
        ? 1
        : Math.ceil(countData / queryObj.limit);

    return paginationHandler.paginationResObj(
      queryObj.page,
      totalPages,
      countData,
      data
    );
  } catch (err) {
    throw err;
  }
}

async function checkExistingAssetSpare(query, id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const existingSpareAsset = await mongoDbManager.findOne(Model, query);
    return existingSpareAsset;
  } catch (error) {
    throw error;
  }
}

async function deleteAssetSpare(ids) {
  try {
    const query = {
      _id: { $in: ids },
      isActive: true,
    };

    const updateObj = { isActive: false };

    const result = await mongoDbManager.updateMany(Model, query, updateObj);

    if (result.modifiedCount !== 0) {
      await subtractRecommendedQuantity(ids); 
    }

    return { message: "Asset spares deleted and recommended quantities updated." };
  } catch (error) {
    throw error;
  }
}


async function returnInvalidAssetSpares(ids) {
  try { 
    let invalidSpares = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    
    if (invalidSpares.length > 0) {
      return invalidSpares;
    }
    const query = {
      _id: { $in: ids },
      isActive: true,
    };
    const existingSpares = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      ["_id","quantity","name","businessUnit"],
      []
    );
    const validSpares = existingSpares.map(
      (existingSpare) => existingSpare._id.toString()
    );

    invalidSpares.push(
      ...ids.filter((id) => !validSpares.includes(id))
    );

    const invalidSpareArray = Array.from(new Set(invalidSpares));
    return  { existingSpares , invalidSpareArray }
   
  } catch (err) {
    throw err;
  }
}

async function subtractRecommendedQuantity(assetSpareIds) {
  try {
    if (!Array.isArray(assetSpareIds) || assetSpareIds.length === 0) {
      throw new Error("AssetSpare ID array is required and must not be empty.");
    }

    // Convert to ObjectIds
    const objectIds = assetSpareIds.map(id => new mongoose.Types.ObjectId(id));

    // 1. Aggregate all specified AssetSpares
    const spareAdjustments = await mongoDbManager.aggregation(Model, [
      {
        $match: {
          _id: { $in: objectIds },
          minimumRequiredQuantity: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$spare",
          totalToSubtract: { $sum: "$minimumRequiredQuantity" }
        }
      }
    ]);

    // 2. Update each spare by subtracting the corresponding total
    const updatePromises = spareAdjustments.map(({ _id, totalToSubtract }) =>
      mongoDbManager.updateOne(
        Spares,
        { _id },
        { $inc: { recommendedQuantity: -totalToSubtract } }
      )
    );

    await Promise.all(updatePromises);

    return { message: "Recommended quantities decremented for affected spares." };
  } catch (error) {
    throw error;
  }
}


async function handleNotificationForMinimumRequiredQuantityReach(assetSpareObj,reqUserId){
  try{
    const spareObj = await mongoDbManager.findOne(Spares,{_id: assetSpareObj.spare, isActive: true})
    if(spareObj.createdBy){
      console.log("spareObj.createdBy", spareObj.createdBy)
      const selectFields = ["createdBy"]
      const findCreator_Department = await mongoDbManager.findOneWithPopulate(User, {
        _id: spareObj.createdBy,
        isDeleted: false,
      },selectFields);
      // const sender = await mongoDbManager.findOne(Assets,{_id: assetSpareObj.asset, isActive: true})
    await sendNotification(
      "minimumLevelReached",
      `has reached the minimumQuantity ${assetSpareObj.minimumRequiredQuantity} greater than spare minimumQuantity ${spareObj.minimumRequiredQuantity}`,
      spareObj._id,
      spareObj.name,
      findCreator_Department.department,
      reqUserId,
      spareObj.businessUnit
    );
  }
  }catch(error){
    console.log("err",error)
    throw error;
  }
}


async function sendNotification(
  title,
  message,
  id,
  name,
  department,
  reqUserId,
  businessUnit
) {
  try {
    const data = dataConstructor.constructNotification(
      title,
      message,
      { id: id, name: name },
      "spares",
      reqUserId,
      businessUnit
    );
    const userTypes = await fetchEngineerUserTypeByDepartment(department);
    await sendViaUserType("notification", userTypes, data);
  } catch (err) {
    throw err;
  }
}

async function updateAssetInSpare (spareId, assetId){
  try{
    if (spareId && assetId) {
     await mongoDbManager.updateOne(Spares,
       { _id: spareId },
       { $addToSet: { assets: assetId } } // avoids duplicates
     );
   }
  }catch(error){
    throw error;
  }
}


module.exports ={
    createAssetSpare,
    getAllAssetSpare,
    addRecommendedQuantity,
    updateAssetSpare,
    checkExistingAssetSpare,
    deleteAssetSpare,
    returnInvalidAssetSpares,
    subtractRecommendedQuantity,
    handleNotificationForMinimumRequiredQuantityReach,
    updateAssetInSpare,


}


function fieldMappings() {
  return {
    spare: {
      localField: "spare",
      collection: "spares",
      fieldsToInclude: ["name", "specification", "id", "units"], // Example fields to include
    },
    asset: {
      localField: "asset",
      collection: "assets",
      fieldsToInclude: ["generalDetails", "id"], // Example fields to include
    },
    updatedBy: {
      localField: "updatedBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    createdBy: {
      localField: "createdBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
  };
}

function queryBuilder(reqData, asset) {
  const query = {
    isActive: true,
    asset: new mongoose.Types.ObjectId(asset),
    ...(reqData.spare && mongoose.Types.ObjectId.isValid(reqData.spare) &&  {
      spare: new mongoose.Types.ObjectId(reqData.spare),
    }),
    ...(reqData.status &&
      typeof reqData.status === "string" && {
        status: {
          $in: reqData.status.split(",").map((p) => new RegExp(`^${p.trim()}$`, "i")),
        },
      }),
    ...(reqData.createdAt && { createdAt: reqData.createdAt }),
    ...(reqData.updatedAt && { updatedAt: reqData.updatedAt }),
  };

//   if (userId) {
//     query["$or"] = [
//       { createdBy: new mongoose.Types.ObjectId(userId) }, 
//     ];
//   }

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
    sortOrder,
  };
}