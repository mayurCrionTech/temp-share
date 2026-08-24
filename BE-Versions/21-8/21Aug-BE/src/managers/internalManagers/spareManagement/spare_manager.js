/*
date              cr/qid      comments
22-march-2026     CR0001      Ids for selected dropdowns are added
*/
const {
  Spares
} = require("../../../models/mongoDB/spareManagement/spare_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = Spares
const User = require("../../../models/mongoDB/userManagement/user_model.js")
const {
  fetchEngineerUserTypeByDepartment,
  getUserTypeAndNameUsingUserId,
} = require("../../../utils/socket/socketUserHandler")
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")
const {
	sendViaUserType,
  } = require('../../../utils/socket/socketHandler.js')
const mongoose = require("mongoose");
const ActivityManager = require("../../../managers/internalManagers/activityManagement/activity_manager")


async function createSpare(spareObject) {
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


async function getAllSpares(reqData, userId) {
  try {
    const queryObj = queryBuilder(reqData, userId);
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
    const populateFields = ["asset", "approver"];
    const selecteFields = ["name","specification","quantity","units","minimumRequiredQuantity","status", "approver", "createdAt", "updatedAt"];
    // CR0001
    // const selecteFields = ["name","specification","quantity","units","unitsId","minimumRequiredQuantity","status", "approver", "createdAt", "updatedAt"];


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
        const { _id, name, specification, ...rest } = result;
        const combinedName = `${name || ''} - ${specification || ''}`.replace(/^-|-$/g, '');
        return { ...rest, name:combinedName, id: _id };
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


  async function getSpare(spareId, reqData, businessUnitId) {
    try {
      const queryObj = queryBuilder(reqData);
      const fieldMapping = fieldMappings();
      const populateFields = [
        "createdBy",
        "updatedBy",
        "approver",
        "asset",
        "images",
      ];
    
      const selectFields = [
        "name",
        "specification",
        "description",
        "status",
        "partNumber",
        "asset",
        "quantity",
        "units",
        // "unitsId", // CR0001
        "recommendedQuantity",
        "cost",
        "costUnits",
        "costUnitsId",
        "expiryDate",
        "minimumRequiredQuantity",
        "approver",
        "category",
        "isSupplierDetails",
        "supplierDetails",
        "images",
        "updatedBy",
        "createdBy",
        "createdAt",
        "updatedAt",
      ];
    
      spareId = new mongoose.Types.ObjectId(spareId);
    
      const datum = await mongoDbManager.buildSingleAggregationPipeline(
        Model,
        spareId,
        queryObj.query,
        fieldMapping,
        populateFields,
        selectFields
      );
    
      if (datum) {
         const { _id, name, specification, ...rest } = datum;
        const combinedName = `${name || ''} - ${specification || ''}`.replace(/^-|-$/g, '');
        return { ...rest, name:combinedName, id: _id };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error fetching detailed Spare:", err);
      throw err;
    }
  }


async function checkExistingSpare(query, id) {
  try {
    if(id){
      if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
          }
    }
    const existingSpare = await mongoDbManager.findOne(Model, query);
    return existingSpare;
  } catch (error) {
    throw error;
  }
}

async function statusCount(businessUnit){
  try{
    let query = {
      isActive:true,
      businessUnit: new mongoose.Types.ObjectId(businessUnit),
       $expr: {
        $lt: ["$quantity", "$minimumRequiredQuantity"]
      }
    }
    const count = await mongoDbManager.count(Model,query);
    return {
      "overUtilised":count
    }
  }catch(error){
    throw error;
  }
}

async function approveSpare(spareId){
  try{
    const result = await mongoDbManager.updateOne(Model, { _id: spareId, status: "pendingForApproval" },
  { $set: { status: "approved" } });
    if(result.acknowledged){
      return result
    }
    else{
      throw "Not Approved! Try after some time";
    }
  }catch(error){
    throw error;
  }
}

async function reviseSpare(spareId){
  try{
    const result = await mongoDbManager.updateOne(Model, { _id: spareId, status: "pendingForApproval" },
  { $set: { status: "resubmit" } });
    if(result.acknowledged){
      return result
    }
    else{
      throw "Not Rejected! Try after some time";
    }
  }catch(error){
    throw error;
  }
}

async function updateSpare(spareId,updateObj) {
  try{
    const updatedSpare = await mongoDbManager.updateOne(Model,
      { _id: spareId }, // Match documents with IDs in the spareIds array
      { $set: updateObj } // Set the asset field to assetId
      );
    return updatedSpare;
  }catch(error){
    throw error;
  }
}


async function deleteSpares(ids, userId) {
  try {
    let query = {
      isActive: true,
      _id: { $in: ids },
    };
    let updateObj = { isActive: false ,updatedBy: userId};
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function returnInvalidSpares(ids) {
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

async function handleNotificationForSpareCreation (spareObj,reqUserId){
  try{
    if(spareObj.createdBy){
      const findCreator_Department = await User.findOne({
        _id: spareObj.createdBy,
        isDeleted: false,
      });
      const sender = await getUserTypeAndNameUsingUserId(spareObj.createdBy);
      const combinedName = `${spareObj.name} - ${spareObj.specification}`

    await sendNotification(
      "create",
      `has been created by ${sender.name}`,
      spareObj._id,
      combinedName,
      findCreator_Department.department,
      reqUserId,
      spareObj.businessUnit
    );
  }
}
catch(err){
  console.log("err",err)
  throw err;
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

async function handleNotificationForSpareEdit(reqSpareObj, spareObject, reqUserId) {
  try {
    // Step 1: Collect asset ID from either spareObject or reqSpare
    const creatorId =  reqSpareObj.createdBy;
    const name = spareObject.name+spareObject.specification;
    // if(spareObject.name && spareObject.specification){
    //   name = spareObject.name+spareObject.specification
    // }
    // if (spareObject.name && reqSpare.specification){
    //   name = spareObject.name+reqSpare.specification
    // }
    // if (reqSpare.name && spareObject.specification){
    //   name = reqSpare.name+spareObject.specification
    // }
    // if(reqSpare.name && reqSpare.specifictaion){
    //   name = reqSpare.name+reqSpare.specification
    // }

    if (!creatorId) return; // No asset associated, skip

    // Step 2: Fetch the asset
    const selectFields = ["createdBy"];
    const user = await mongoDbManager.findOne(
      User,
      { _id: creatorId, isDeleted: false }
    );

    if (!user) return; // Asset not found, skip

    // Step 3: Fetch sender info
    const sender = await getUserTypeAndNameUsingUserId(reqUserId);

    // Step 4: Send notification
    await sendNotification(
      "edit",
      `has been edited by ${sender.name}`,
      reqSpareObj._id,
      name,
      user.department,
      reqUserId,
      reqSpareObj.businessUnit
    );

  } catch (err) {
    console.error("Error in handleNotificationForSpareEdit:", err);
    throw err;
  }
}

// async function handleNotificationForSpareDelete(reqSpares, reqUserId) {
//   try {
//     // Step 1: Collect unique asset IDs from both sparesObject and reqSpares
//     const assetIds = new Set();
//     spareArray.forEach(spareId => {
//       assetIds.add(spareId);
//     });
//     reqSpares.forEach(reqSpare => {
//       if (reqSpare.asset) assetIds.add(reqSpare.asset);
//     });

//     // Step 2: Fetch all unique assets in one call
//     const selectFields = ["createdBy"];
//     const users = await mongoDbManager.findManyWithPopulate(
//       User,
//       { _id: creatorId, isDeleted: false },null,null,{},
//       selectFields
//     );
//     const assets = await mongoDbManager.findManyWithPopulate(Assets, {
//       _id: { $in: Array.from(assetIds) },
//       isDeleted: false,
//     },null,null,{},selectFields);

//     if(assets.length>0){
//     // Create a mapping of assetId to asset object
//     const assetMap = {};
//     assets.forEach(asset => {
//       assetMap[asset._id] = asset;
//     });

//     // Step 3: Fetch sender information once
//     const sender = await getUserTypeAndNameUsingUserId(reqUserId);

//     // Step 4: Iterate over sparesObject and reqSpares to send notifications
//       for (let reqSpare of reqSpares) {
//         const spareAsset = reqSpare.asset;
//         if (spareAsset && assetMap[spareAsset]) {
//           const asset = assetMap[spareAsset];
//           await sendNotification(
//             "delete",
//             `has been deleted by ${sender.name}`,
//             reqSpare._id,
//             reqSpare.name,
//             users.department,
//             reqUserId,
//             reqSpare.businessUnit
//           );
//         }
//     }
//   }
//   } catch (err) {
//     console.log("err", err);
//     throw err;
//   }
// }

async function handleNotificationForSpareDelete(reqSpares, reqUserId) {
  try {
    if (!Array.isArray(reqSpares) || reqSpares.length === 0) return;

    // Step 1: Fetch all spare documents by their IDs
    const spares = await mongoDbManager.findManyAndPopulate(Spares,
    { _id: { $in: reqSpares }, isActive: true }, {createdBy:1, businessUnit:1}, "createdBy"
    )
    // Step 2: Get sender information
    const sender = await getUserTypeAndNameUsingUserId(reqUserId);

    // Step 3: Send notification for each spare
    for (const spare of spares) {
      const department = spare.createdBy?.department;
      if (!department) continue; // Skip if department is missing

      await sendNotification(
        "delete",
        `has been deleted by ${sender.name}`,
        spare._id,
        spare.name,
        department,
        reqUserId,
        spare.businessUnit
      );
    }
  } catch (err) {
    console.error("handleNotificationForSpareDelete error:", err);
    throw err;
  }
}



module.exports = {
    createSpare,
    getAllSpares,
    getSpare,
    checkExistingSpare,
    statusCount,
    approveSpare,
    reviseSpare,
    updateSpare,
    deleteSpares,
    returnInvalidSpares,
    handleNotificationForSpareCreation,
    handleNotificationForSpareEdit,
    handleNotificationForSpareDelete,

}



function fieldMappings() {
  return {
    asset: {
      localField: "asset",
      collection: "assets",
      fieldsToInclude: ["generalDetails.name", "generalDetails.number", "id"], // Example fields to include
    },
    approver: {
      localField: "approver",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
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
    images: {
      localField: "images",
      collection: "files",
      isArray: true,
      fieldsToInclude: [
        "_id",
        "name",
        "extension",
        "contentType",
        "size",
        "storageLocation",
        "moduleName",
        "moduleId",
        "businessUnit",
      ], // Example fields to include
    },
  };
}

function queryBuilder(reqData,userId) {
  const query = {
    isActive: true,
    ...(reqData.name && {
      name: { $regex: reqData.name, $options: "i" },
    }),
    ...(reqData.asset && mongoose.Types.ObjectId.isValid(reqData.asset) &&  {
      asset: new mongoose.Types.ObjectId(reqData.asset),
    }),
    ...(reqData.businessUnit && {
        businessUnit: new mongoose.Types.ObjectId(reqData.businessUnit)
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
  // if (userId) {
  //   query["$or"] = [
  //     { createdBy: new mongoose.Types.ObjectId(userId) }, // Fetch all data created by the user
  //     {
  //       $and: [
  //         { approver: new mongoose.Types.ObjectId(userId) }, // User is in assignees array
  //         { status: { $nin: ["draft"] } }, // Exclude draft status
  //       ],
  //     },
  //     // { startAt: { $lte: new Date() } }, // Or data with startAt <= current date
  //     // { status: { $nin: ["draft"] } },
  //   ];
  // }

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
