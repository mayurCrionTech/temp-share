const {
  SparesAndInventories,
  sparesAndInventory,
} = require("../../../models/mongoDB/assetManagement/sparesAndInventory_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = SparesAndInventories
const {Assets} = require("../../../models/mongoDB/assetManagement/asset_model");
const {
  fetchEngineerUserTypeByDepartment,
  getUserTypeAndNameUsingUserId,
} = require("../../../utils/socket/socketUserHandler")
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")
const {
	sendViaUserType,
  } = require('../../../utils/socket/socketHandler.js')
const mongoose = require("mongoose");
const ActivityManager = require("../../../managers/internalManagers/activityManagement/activity_manager");
const { Spares } = require("../../../models/mongoDB/spareManagement/spare_model.js");


async function createSpares(spareObject) {
  try {
    const spare = await mongoDbManager.insertOne(
      SparesAndInventories,
      spareObject
    );
    return spare;
  } catch (error) {
    throw error;
  }
}

async function createMultipleSpares(spareObject) {
  try {
    const createdspares = await mongoDbManager.insertMany(
      Model,
      spareObject
    );
    const createdSpareIds =  multipleCreateResponseObject(createdspares);
    return {createdspares,createdSpareIds};
  } catch (error) {
    throw error;
  }
}

async function spareDropdownConstants() {
  try {
    const cycleFrequency = Object.values(sparesAndInventory.cycleFrequencyType);
    const replacementFrequency = Object.values(
      sparesAndInventory.replacementFrequencyType
    );
    const quantity = Object.values(sparesAndInventory.quantityType)
    const dropdownConstants = {
      cycleFrequency,
      replacementFrequency,
      quantity
    };
    return dropdownConstants;
  } catch (error) {
    throw error;
  }
}

async function getAllSpares(reqData) {
  try {
    let query = {
      isActive: true,
      businessUnit : reqData.businessUnit
    };
    if (reqData.name) {
      query.name = { $regex: reqData.name, $options: "i" };
    }
    if (reqData.asset) {
      query.asset = reqData.asset;
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
      : "_id name quantity";

    populateFields = populateFields
      ? getPopulateOptions(populateFields, "_id generalDetails.name generalDetails.number name")
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

async function getSpare(id, name, asset, selectFields = "", populateFields = "", businessUnit) {
  try {
    let query = {
      isActive: true,
      businessUnit: businessUnit,
    };
    if (id){
      query._id = id
    }
    if (name){
      query.name = name
    }
    if (asset){
      query.asset = asset
    }
    selectFields = selectFields
      ? [...new Set(selectFields.split(",")), "_id"]
          // .filter((field) => field !== "userPassword")
          .join(" ")
      : ["_id"];
    populateFields = populateFields
      ? getPopulateOptions(populateFields, "_id generalDetails.name generalDetails.number name")
      : [];

    let datum = await mongoDbManager.findOneWithPopulate(
      Model,
      query,
      selectFields,
      populateFields
    );
    if (datum) {
        const { _id,  ...rest } = datum;
        const transformedResult = {
          ...rest,
          id: _id,
        };
        return transformedResult;
    } else return null;
  } catch (err) {
    throw err;
  }
}

async function checkExistingSpare(id){
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const existingSpare = await mongoDbManager.findOne(Model, {
      _id: id,
      isActive: true,
    });
    return existingSpare;
  }catch(error){
    throw error;
  }
}

async function checkExistingSpareByNameAndAsset(name, asset){
  try {
    let query = {
      isActive: true,
    }

    if (name) {query.name = name}
    if (asset) {query.asset = asset}
    const existingSpare = await mongoDbManager.findOne(Model, 
      query
    );
    return existingSpare
  }catch(error){
    throw error;
  }
}
async function checkExistingSpareByAssetId(assetId){
  try {
    const existingSpare = await mongoDbManager.findOne(Spares, {
      assets: { $in: [assetId] },
      isActive: true,
    });
    return existingSpare;
  }catch(error){
    throw error;
  }
}
async function checkExistingSpareName(sparesToBeChecked) {
  try {
    let spareNames = sparesToBeChecked.map((spare) => spare.name);
    let existingSpares = [];
    for (let spareName of spareNames) {
      const existingSpare = await mongoDbManager.findOne(Model, {
        name: spareName,
        isActive: true,
      });
      if (existingSpare) existingSpares.push(existingSpare);
    }
    return existingSpares;
  } catch (error) {
    throw error;
  }
}

async function updateSpare(spareIds,assetId) {
	try{
		const updatedSpare = await mongoDbManager.updateMany(Model,
			{ _id: { $in: spareIds } }, // Match documents with IDs in the spareIds array
			{ $set: { asset: assetId } } // Set the asset field to assetId
		  );
		return updatedSpare;
	}catch(error){
		throw error;
	}
}


async function editSpares(sparesToBeUpdated){
  try{
    sparesToBeUpdated = sparesToBeUpdated.map(async (spare)=>{
      const editedSpare = await mongoDbManager.updateOne(Model, {_id: spare.id}, spare)
      return editedSpare.acknowledged;
    })
    await Promise.all(sparesToBeUpdated);
  }catch(error){
    throw error
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
      ["_id","asset","name","businessUnit"],
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

async function totalStatusCount(businessUnit){
  try{
    let query = {
      isActive:true,
      businessUnit: new mongoose.Types.ObjectId(businessUnit)
    }
    const count = await mongoDbManager.count(Model,query);
    return {
      "activeSpares":count
    }
  }catch(error){
    throw error;
  }
}

async function handleNotificationForSpareCreation (createdSpares,reqUserId){
  try{
  for(let spareObj of createdSpares){
    console.log("spareObj", spareObj)
    if(spareObj.asset){
      const selectFields = ["generalDetails"]
      const findAsset_Department = await mongoDbManager.findOneWithPopulate(Assets, {
        _id: spareObj.asset,
        isDeleted: false,
      },selectFields);
      const sender = await getUserTypeAndNameUsingUserId(spareObj.createdBy);
    await sendNotification(
      "create",
      `has been created by ${sender.name}`,
      spareObj._id,
      spareObj.name,
      findAsset_Department.generalDetails.department,
      reqUserId,
      spareObj.businessUnit
    );
    }
  }
}
catch(err){
  console.log("err",err)
  throw err;
}
}

// async function handleNotificationForSpareEdit ( reqSpares, sparesObject, reqUserId ){
//   try{
//     for(let spareObj of sparesObject){
//       for(let reqSpare of reqSpares){
//       const newAsset = spareObj.asset ? spareObj.asset : reqSpare.asset
//       if(newAsset){
//         const selectFields = ["generalDetails"]
//         const findAsset_Department = await mongoDbManager.findOneWithPopulate(Assets, {
//           _id: newAsset,
//           isDeleted: false,
//         },selectFields);
//         if(findAsset_Department){
//         const sender = await getUserTypeAndNameUsingUserId(reqUserId);
//       await sendNotification(
//         "Spare Edited",
//         `${reqSpare.name}, has been edited by ${sender.name}`,
//         spareObj._id,
//         reqSpare.name,
//         findAsset_Department.generalDetails.department,
//         reqUserId
//       );
//     }}
//     else{
//       console.log("Notification can't be sent without asset department")
//     }
//       }
//     }
//   }
//   catch(err){
//     console.log("err",err)
//     throw err;
//   }
// }

async function handleNotificationForSpareEdit(reqSpares, sparesObject, reqUserId) {
  try {
    // Step 1: Collect unique asset IDs from both sparesObject and reqSpares
    const assetIds = new Set();
    sparesObject.forEach(spareObj => {
      if (spareObj.asset) assetIds.add(spareObj.asset);
    });
    reqSpares.forEach(reqSpare => {
      if (reqSpare.asset) assetIds.add(reqSpare.asset);
    });

    // Step 2: Fetch all unique assets in one call
    const selectFields = ["generalDetails"];
    const assets = await mongoDbManager.findManyWithPopulate(Assets, {
      _id: { $in: Array.from(assetIds) },
      isDeleted: false,
    },null,null,{},selectFields);

    if(assets.length > 0){
    // Create a mapping of assetId to asset object
    const assetMap = {};
    assets.forEach(asset => {
      assetMap[asset._id] = asset;
    });

    // Step 3: Fetch sender information once
    const sender = await getUserTypeAndNameUsingUserId(reqUserId);

    // Step 4: Iterate over sparesObject and reqSpares to send notifications
    for (let spareObj of sparesObject) {
      for (let reqSpare of reqSpares) {
        const newAssetId = spareObj.asset || reqSpare.asset;
        if (newAssetId && assetMap[newAssetId]) {
          const asset = assetMap[newAssetId];
          await sendNotification(
            "edit",
            `has been edited by ${sender.name}`,
            reqSpare._id,
            reqSpare.name,
            asset.generalDetails.department,
            reqUserId,
            reqSpare.businessUnit
          );
        }
      }
    }
  }
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}

async function handleNotificationForSpareDelete(reqSpares, spareArray, reqUserId) {
  try {
    // Step 1: Collect unique asset IDs from both sparesObject and reqSpares
    const assetIds = new Set();
    spareArray.forEach(spareId => {
      assetIds.add(spareId);
    });
    reqSpares.forEach(reqSpare => {
      if (reqSpare.asset) assetIds.add(reqSpare.asset);
    });

    // Step 2: Fetch all unique assets in one call
    const selectFields = ["generalDetails"];
    const assets = await mongoDbManager.findManyWithPopulate(Assets, {
      _id: { $in: Array.from(assetIds) },
      isDeleted: false,
    },null,null,{},selectFields);

    if(assets.length>0){
    // Create a mapping of assetId to asset object
    const assetMap = {};
    assets.forEach(asset => {
      assetMap[asset._id] = asset;
    });

    // Step 3: Fetch sender information once
    const sender = await getUserTypeAndNameUsingUserId(reqUserId);

    // Step 4: Iterate over sparesObject and reqSpares to send notifications
      for (let reqSpare of reqSpares) {
        const spareAsset = reqSpare.asset;
        if (spareAsset && assetMap[spareAsset]) {
          const asset = assetMap[spareAsset];
          await sendNotification(
            "delete",
            `has been deleted by ${sender.name}`,
            reqSpare._id,
            reqSpare.name,
            asset.generalDetails.department,
            reqUserId,
            reqSpare.businessUnit
          );
        }
    }
  }
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}

async function handleActivityForSpareCreate(createdSpares,reqUserId, businessUnit){
  try {
    for(let spareObj of createdSpares){
    const activityData = dataConstructor.constructActivity(
      `was created`,
      { id: spareObj._id, name: spareObj.name },
      "assets",
      reqUserId
    );
    await ActivityManager.createActivity(activityData, businessUnit);
  }
  } catch (err) {
    throw err;
  }
}

async function hanldeActivityForSpareEdit(reqSpares,reqUserId, businessUnit){
  try{
    for(let spareObj of reqSpares){
      const activityData = dataConstructor.constructActivity(
        `was Edited`,
        { id: spareObj._id, name: spareObj.name },
        "assets",
        reqUserId
      );
      await ActivityManager.createActivity(activityData, businessUnit);
    }
  }catch(error){
    console.log("error",error)
    throw error
  }
}

async function hanldeActivityForSpareDelete(reqSpares,reqUserId,businessUnit){
  try{
    for(let spareObj of reqSpares){
      const activityData = dataConstructor.constructActivity(
        `was Deleted`,
        { id: spareObj._id, name: spareObj.name },
        "assets",
        reqUserId
      );
      await ActivityManager.createActivity(activityData, businessUnit);
    }
  }catch(error){
    console.log("error",error)
    throw error
  }
}


module.exports = {
  createSpares,
  createMultipleSpares,
  spareDropdownConstants,
  getAllSpares,
  getSpare,
  checkExistingSpare,
  checkExistingSpareName,
  editSpares,
  deleteSpares,
  returnInvalidSpares,
  totalStatusCount,
  checkExistingSpareByNameAndAsset,
  handleNotificationForSpareCreation,
  handleNotificationForSpareEdit,
  handleNotificationForSpareDelete,
  handleActivityForSpareCreate,
  hanldeActivityForSpareEdit,
  hanldeActivityForSpareDelete,
  updateSpare,
  checkExistingSpareByAssetId
};

function multipleCreateResponseObject(createdObject) {
  const ids = createdObject.map((result) => result._id);
  return { ids };
}

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

function toModifyResponseStructure(data){
  data = data.map((result) => {
    const { _id, cycleFrequency, replacementFrequency, ...rest } = result;
    const transformedResult = {
      ...rest,
      id: _id,
      cycleFrequencyCount: cycleFrequency ? `${cycleFrequency.count}` : undefined,
      cycleFrequencyPeriod: cycleFrequency ? `${cycleFrequency.period}` : undefined,
      replacementFrequencyCount: replacementFrequency ? `${replacementFrequency.count}` : undefined,
      replacementFrequencyPeriod: replacementFrequency ? `${replacementFrequency.period}` : undefined
    };
    return transformedResult;
  });
  return data;
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
      "assets",
      reqUserId,
      businessUnit
    );
    const userTypes = await fetchEngineerUserTypeByDepartment(department);
    await sendViaUserType("notification", userTypes, data);
  } catch (err) {
    throw err;
  }
}