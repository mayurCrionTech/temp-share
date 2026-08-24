const {
  AssetHistory,
} = require("../../../models/mongoDB/assetManagement/assetHistory_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const DataHandler = require("../../common/DataObjectConstructor_manager");
const Model = AssetHistory;
const mongoose = require("mongoose");
const { workOrder } = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");

async function createAssetHistoryManager(createDataArray) {
  try {
    const datum = await mongoDbManager.insertMany(Model, createDataArray);
    return datum;
  } catch (error) {
    throw error;
  }
}

async function fetchAssetHistoryManager(assetId, reqData, businessUnit) {
  try {
    let data;
    // const queryBefore = { eventDate: { $lte: date } };
    // const queryAfter = { eventDate: { $gt: date } };
    const query = {businessUnit : businessUnit};
    if(assetId){
      query.asset = assetId
      // queryBefore.asset = assetId;
      // queryAfter.asset = assetId;
    }
    const page = parseInt(reqData.page) || 1;
    const limit = parseInt(reqData.limit) || 0;
    const range = parseInt(reqData.range) || 5;
    const skip = (page - 1) * limit;
    const sort = reqData.sort || "eventDate";
    const order = reqData.order === "asc" ? -1 : 1;
    let countData = await mongoDbManager.count(Model, query);
    const selectFields = ["name", "description", "asset", "status", "moduleId", "moduleName", "eventDate"];
     const populate = [
      { path: "asset", select: "generalDetails.name" },
      { path: "moduleId", select: "name" }
    ]; 
    const sortOrder = { [sort]: order };
    if (limit === 0 && page > 1) {
      // Return an appropriate response for your use case
      return paginationHandler.paginationResObj(page, 1, countData, []);
    }
    // if(reqData.currentDate){
    //   const date = reqData.currentDate;
    //   // if (isNaN(reqData.currentDate)) {
    //   //   return "Invalid date format.";
    //   // }
    //   let dataBefore = await mongoDbManager.findManyWithPopulate(Model,queryBefore,range, skip,{ eventDate: -1 },selectFields)
    //   dataBefore.reverse();
    //   const dataAfter = await mongoDbManager.findManyWithPopulate(Model,queryAfter,range, skip,{ eventDate: 1 },selectFields)
    //   data  = [...dataBefore, ...dataAfter]
    //   // countData = data.length;
    // }
    // else{
      data = await mongoDbManager.findManyWithPopulate(
        Model,
        query,
        limit,
        skip,
        sortOrder,
        selectFields,
        populate// for history subjectline navigation
      );
    // }
    // if (data) {
    //   data = data.map((result) => {
    //     const { _id, ...rest } = result;
    //     return { ...rest, id: _id };
    //   });
    // }

    if (data) {
      data = data.map((result) => {
      const assetName =result.asset?.generalDetails?.name || null;
      const workOrderName =result.moduleId?.name || null;
      const moduleIdValue =result.moduleId?._id?.toString() || result.moduleId?.id || result.moduleId || null;
      const assetId = result.asset?._id?.toString() || result.asset || null;

    return {
      name: result.name,
      description: result.description,
      status: result.status,
      moduleId: moduleIdValue,
      moduleName: result.moduleName,
      asset:assetId.id.toString(),
      assetName,
      workOrderName,
      eventDate: result.eventDate,
      id: result._id,
    };
  });
}// for history subjectline navigation
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

// async function updateAssetHistoryManager(assetId, reqObject) {
//   const objectToBeCreated = [];
//   if (reqObject?.specifications?.warrantyDetails?.warrantyEndDate) {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "warrantyEndDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   if (reqObject?.specifications?.calibrationDetails?.lastCalibrationDate) {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "lastCalibrationDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   if (reqObject?.specifications?.calibrationDetails?.lastAuditDate) {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "lastAuditDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   if (reqObject?.specifications?.calibrationDetails?.corrosionCheckDate) {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "corrosionCheckDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   if (reqObject?.specifications?.manufacturingDetails?.installationDate) {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "installationDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   if (reqObject?.status == "Breakdown") {
//     const objectToBeCreatedForHistory = DataHandler.constructHistory(
//       "assetBreakdownDate",
//       "sample description",
//       assetId
//     );
//     objectToBeCreated.push(objectToBeCreatedForHistory);
//   }
//   await createAssetHistoryManager(objectToBeCreated);
// }


async function updateAssetHistoryManager(assetId, reqObject, description, businessUnit) {
  const historyFields = [
    {
      path: 'specifications.warrantyDetails.warrantyEndDate',
      description: description,
      status: "planned",
      fieldName: 'warrantyEndDate',
      eventDate: reqObject.specifications?.warrantyDetails?.warrantyEndDate,
    },
    {
      path: 'specifications.calibrationDetails.lastCalibrationDate',
      description: description,
      status: "executed",
      fieldName: 'lastCalibrationDate',
      eventDate: reqObject.specifications?.calibrationDetails?.lastCalibrationDate,
    },
    {
      path: 'specifications.calibrationDetails.lastAuditDate',
      description: description,
      status: "executed",
      fieldName: 'lastAuditDate',
      eventDate: reqObject.specifications?.calibrationDetails?.lastAuditDate,
    },
    {
      path: 'specifications.calibrationDetails.corrosionCheckDate',
      description: description,
      status: "executed",
      fieldName: 'corrosionCheckDate',
      eventDate: reqObject.specifications?.calibrationDetails?.corrosionCheckDate,
    },
    {
      path: 'specifications.manufacturingDetails.installationDate',
      description: description,
      status: "executed",
      fieldName: 'installationDate',
      eventDate: reqObject.specifications?.manufacturingDetails?.installationDate,
    },
    {
      path: 'status',
      description: description,
      status: "executed",
      fieldName: 'assetBreakdownDate',
      condition: (value) => value === 'Breakdown',
      eventDate: new Date(),
    },
  ];

  const objectToBeCreated = historyFields
    .filter(({ path, condition }) => {
      const value = path.split('.').reduce((o, k) => (o || {})[k], reqObject);
      return value && (!condition || condition(value));
    })
    .map(({ fieldName, description, eventDate, status }) =>
      DataHandler.constructHistory(fieldName, description, assetId, eventDate, status, null, "assets", businessUnit)
    );
  await createAssetHistoryManager(objectToBeCreated);
}

const checkIfAssetHistoryExists = async (asset, description, eventDate) => {
  try{
    const result = await mongoDbManager.findOne(AssetHistory,{asset, description, eventDate})
    return result
  }catch(error){
    throw error;
  }
}  

const createAssetHistory = async (fieldName, description, assetId, eventDate, status, workOrderId, businessUnit) => {
  try{
    const objectToBeCreated = DataHandler.constructHistory(fieldName, description, assetId, eventDate, status, workOrderId, "workOrders", businessUnit)
    await createAssetHistoryManager(objectToBeCreated);
  }catch(error){
    throw error;
  }
}

const updateAssetHistoryByWorkOrderId = async (workOrderId, updateObject) => {
  try{
    const updated = await mongoDbManager.updateOne(AssetHistory, {moduleId: workOrderId}, updateObject)
    return updated;
  }catch(error){
    throw error;
  }
}

const updateAssetHistoryByDescription = async (description, updateObject) => {
  try{
    const updated = await mongoDbManager.updateOne(AssetHistory, {description: description}, updateObject)
    return updated;
  }catch(error){
    throw error;
  }
}

const updateStatus = async () => {
  try{
    const currentDate = new Date();
    const updates = await mongoDbManager.updateMany(AssetHistory, {moduleName:"assets", name: "warrantyEndDate", eventDate: {$lte: currentDate}}, { $set: { status: "missed" } })
    return updates;
  }catch(error){
    throw error;
  }
}

module.exports = {
  createAssetHistoryManager,
  fetchAssetHistoryManager,
  updateAssetHistoryManager,
  checkIfAssetHistoryExists,
  createAssetHistory,
  updateAssetHistoryByWorkOrderId,
  updateAssetHistoryByDescription,
  updateStatus,
};
