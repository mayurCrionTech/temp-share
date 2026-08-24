/*
date            qid / cr#         comments
10-mar-2026     CR0002           filteration for workorder

*/
const {
  workOrders,
  workOrder,
} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");
const Team = require("../../../models/mongoDB/userManagement/team_model");
const {
  generateVersionNumber,
} = require("../../../utils/generateVersionNumber");
const { mongoDbManager } = require("../../dBManagers/index");
const paginationHandler = require("../../common/paginationHandler_manager");
const mongoose = require("mongoose");
const fileManager = require("../../internalManagers/fileSystem/fileSystem_manager");
const partsRequiredManager = require("../../internalManagers/maintenanceManagement/workOrderPartRequired_manager");
const partsReplacedManager = require("../../internalManagers/maintenanceManagement/workOrderPartReplaced_manager");
const toolsRequiredManager = require("../../internalManagers/maintenanceManagement/workOrderToolRequired_manager");
const consumablesManager = require("../../internalManagers/maintenanceManagement/workOrderConsumable_manager");
const sparesAndInventoryManager = require("../../internalManagers/assetManagement/sparesAndInventory_manager");
const DueDateRequest = require("../../../models/mongoDB/maintenanceManagement/workOrderDueDateRequest_model"); 
const PartsReplaced = require("../../../models/mongoDB/maintenanceManagement/workOrderPartReplaced_model"); 
const PartsRequired = require("../../../models/mongoDB/maintenanceManagement/workOrderPartRequired_model"); 
const ToolsRequired = require("../../../models/mongoDB/maintenanceManagement/workOrderToolRequired_model"); 
const Consumables = require("../../../models/mongoDB/maintenanceManagement/workOrderConsumable_model"); 
const assetHistory_manager = require("../assetManagement/assetHistory_manager");
const { MaintenancePlan } = require("../../../models/mongoDB/maintenanceManagement/maintenancePlan_model");
const { DateTime, Duration } = require("luxon");
const { sendViaUserID } = require("../../../utils/socket/socketHandler");
const {
  constructNotification,
} = require("../../common/DataObjectConstructor_manager");
const User = require("../../../models/mongoDB/userManagement/user_model");
const Asset = require("../../../models/mongoDB/assetManagement/asset_model");// CR0002 ["Added Asset model reference to support assetName-based filtering in work orders."]


async function createWorkOrder(workOrderObject, userId) {
  try {
    console.log("workOrderObject",workOrderObject)
    workOrderObject.number = await generateWorkOrderNumber();
    const workOrder = await mongoDbManager.insertOne(
      workOrders,
      workOrderObject
    );
    if(workOrderObject.addToAssetHistory){
      await assetHistory_manager.updateAssetHistoryByDescription(workOrder.name,{moduleId: workOrder._id})
    }
        if (workOrderObject.documents && workOrderObject.documents.length > 0) {
          await fileManager.updateFilePaths(
            null,
            workOrderObject.documents,
            "workorders",
            workOrder._id,
            userId
          );
        }
        if(workOrderObject.images && workOrderObject.images.length >0){
          await fileManager.updateFilePaths(
            null,
            workOrderObject.images,
            "workorders",
            workOrder._id,
            userId
          );
        }
        if(workOrder.status != "draft"){
          await handleSendNotification(workOrder.assignees, workOrder._id, workOrder.name, userId, workOrder.businessUnit)
        }
    return workOrder;
  } catch (error) {
    throw error;
  }
}

async function generateWorkOrderNumber() {
  try {
    const lastWONumber = await mongoDbManager.count(workOrders, {
      isDeleted: false,
    }); // Generates the workorder Number based on the count of workorder.
    let currentVersion = "00001";
    if (lastWONumber !== null) {
      currentVersion = await generateVersionNumber(lastWONumber);
    }
    const woNumber = "WO-" + currentVersion;
    return woNumber;
  } catch (error) {
    throw error;
  }
}

async function editWorkOrder(updateObject, WorkOrderId) {
  try {
    const query = {
      _id: WorkOrderId,
      isDeleted: false,
    };
    return await mongoDbManager.updateOne(workOrders, query, updateObject);
  } catch (error) {
    throw error;
  }
}

async function getSpareOfWorkOrder(workOrderId, businessUnit) {
  try {
    workOrderId = new mongoose.Types.ObjectId(workOrderId);
    const datum = await mongoDbManager.buildSingleAggregationPipeline(
      workOrders,
      workOrderId,
      {},
      {},
      [],
      ["asset"]
    );
    if (datum.asset) {
      const sparesList = await sparesAndInventoryManager.getAllSpares({
        asset: datum.asset,
        businessUnit: businessUnit
      });
      return sparesList;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}

//CR0002
//start(sumit)

async function getAllWorkOrders(reqData, userId, businessUnitId) {
    try {
 
        // ── Pre-lookup: resolve assetName → matching asset ObjectIds ──────────
if (reqData.assetName) {


const matchingAssets = await Asset.Assets.find(
  {
    "generalDetails.name": { $regex: reqData.assetName, $options: "i" },
    isDeleted: false
  },
  { _id: 1 }
);

  if (!matchingAssets.length) {
    return paginationHandler.paginationResObj(1, 0, 0, []);
  }

  reqData.assetIds = matchingAssets.map((a) => a._id);
}
 
        // ── Pre-lookup: resolve assigneeName → matching user ObjectIds ────────

if (reqData.assigneeName) {
    const matchingUsers = await User.find(
        { name: { $regex: reqData.assigneeName.trim(), $options: 'i' }, isDeleted: false },
        { _id: 1 }
    );
    if (!matchingUsers.length) {
        return paginationHandler.paginationResObj(1, 0, 0, []);
    }
    reqData.assigneeIds = matchingUsers.map((u) => u._id);
}
 
        // ── Everything below is unchanged from your original ──────────────────
        const queryObj = queryBuilder(reqData, userId, businessUnitId);
        const fieldMapping = fieldMappings();
        const countData = await mongoDbManager.count(workOrders, queryObj.query);
 
        if (queryObj.page === null && queryObj.limit === null) {
            queryObj.limit = countData || 1;
            queryObj.page  = 1;
        } else if (queryObj.page === null) {
            queryObj.page  = 1;
        } else if (queryObj.limit === null) {
            queryObj.limit = countData;
        }
 
        if (queryObj.limit === 0 && queryObj.page > 1) {
            return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
        }
 
        const populateFields = ["asset", "assignees"];
        const selectFields   = [
            "name", "number", "priority", "startAt", "endAt",
            "createdAt", "asset", "assignees", "updatedAt", "status", "addToAssetHistory",
        ];
 
        let data = await mongoDbManager.fetchAllAndPopulate(
            workOrders,
            queryObj.query,
            fieldMapping,
            queryObj.limit,
            queryObj.page,
            queryObj.sortOrder,
            populateFields,
            selectFields
        );
 
        if (data) {
            data = data.map((result) => {
                const { _id, ...rest } = result;
                return { ...rest, id: _id };
            });
        }
 
        const totalPages =
            countData === 0      ? 0 :
            queryObj.limit === 0 ? 1 :
            Math.ceil(countData / queryObj.limit);
 
        return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
 
    } catch (error) {
        throw error;
    }
}
 
//end(sumit)


async function getWorkOrder(workOrderId, reqData,  reqHost, reqProtocol, businessUnitId) {
  try {
    const datum = await buildWorkOrderData(workOrderId, reqData,  reqHost, reqProtocol, businessUnitId);

    if (!datum) {
      throw new Error("Work order not found");
    }

    // Fetch additional related data
    const [getPartsRequired, getPartsReplaced, getToolsRequired, getConsumables] = await Promise.all([
      partsRequiredManager.getPartsRequired(reqData, workOrderId, businessUnitId),
      partsReplacedManager.getPartsReplaced(reqData, workOrderId, businessUnitId, reqHost, reqProtocol),
      toolsRequiredManager.getToolsRequired(reqData, workOrderId, businessUnitId),
      consumablesManager.getConsumables(reqData, workOrderId, businessUnitId),
    ]);

    // Add additional data to the response
    datum.spareRequested = getPartsRequired;
    datum.spareReplaced = getPartsReplaced;
    datum.toolsRequired = getToolsRequired;
    datum.consumables = getConsumables;

    return datum;
  } catch (err) {
    console.error("Error fetching detailed work order:", err);
    throw err;
  }
}

async function getCopyWorkOrderDetails(workOrderId, reqData, businessUnitId) {
  try {
    const datum = await buildWorkOrderData(workOrderId, reqData, null, null, businessUnitId);
    return datum;
  } catch (err) {
    console.error("Error fetching basic work order details:", err);
    throw err;
  }
}

async function buildWorkOrderData(workOrderId, reqData, reqHost, reqProtocol, businessUnitId) {
  const queryObj = queryBuilder(reqData, null, businessUnitId);
  const fieldMapping = fieldMappings();
  const populateFields = [
    "departments",
    "createdBy",
    "updatedBy",
    "asset",
    "assignees",
    "tasks",
    // "existingTeams",
    "documents",
    "images",
  ];

  const selectFields = [
    "name",
    "number",
    "updatedBy",
    "createdBy",
    "createdAt",
    "updatedAt",
    "status",
    "description",
    "asset",
    "departments",
    "priority",
    "startAt",
    "endAt",
    "estimatedDays",
    "estimatedHours",
    "assignees",
    "existingTeams",
    "localTeams",
    "tasks",
    "isWorkPermitRequired",
    "isMaintenanceScheduled",
    "documents",
    "images",
    "lastStatus",
    "requestExtensionCount",
    "addToAssetHistory",
    "businessUnit"
  ];

  workOrderId = new mongoose.Types.ObjectId(workOrderId);

  const datum = await mongoDbManager.buildSingleAggregationPipeline(
    workOrders,
    workOrderId,
    queryObj.query,
    fieldMapping,
    populateFields,
    selectFields
  );

  if (datum) {
    if (datum.tasks) {
      await Promise.all(datum.tasks.map(async (task) => {
          if (task.images && task.images.length > 0) {
              task.images = await Promise.all(
                  task.images.map(image => fileManager.getFile(image, "download", businessUnitId, reqHost, reqProtocol))
              );
          }
      }));
  }
    if (datum.existingTeams && Array.isArray(datum.existingTeams)) {
      datum.existingTeams = await Promise.all(
        datum.existingTeams.map(async (team) => {
          const populatedTeam = await Team.findById(team.id).select('name');
          return {
            id: populatedTeam._id || null,
            name: populatedTeam.name || null,
            noOfMembersRequired: team.noOfMembersRequired || null,
          };
        })
      );
    }
    const { _id, ...rest } = datum;
    return { id: _id, ...rest};
  } else {
    return null;
  }
}

async function getImagesForWorkOrder(workOrderId, reqQuery, reqHost, reqProtocol, businessUnitId) {
  try {
    let page = reqQuery.page ? parseInt(reqQuery.page, 10) : 0;
    let limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 200;
    const sort = reqQuery.sort || "createdAt";
    const order = reqQuery.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 200;

    const getWorkOrderImage = await getWorkOrder(workOrderId, reqQuery, reqHost, reqProtocol, businessUnitId);
    if(!getWorkOrderImage.images){
      getWorkOrderImage.images = []
    }
    // Ensure images is always an array
    let imagesArray = Array.isArray(getWorkOrderImage.images) 
      ? getWorkOrderImage.images 
      : [getWorkOrderImage.images];

    if (imagesArray.length > 0) {
      const fileDocuments = [];
      for (let document of imagesArray) {
        const image = await fileManager.transformFileObj(
          document,
          "download",
          reqHost,
          reqProtocol
        );
        fileDocuments.push(image);
      }
      imagesArray = fileDocuments; // Assign transformed documents to the array
    }

    const countData = imagesArray.length;
    const totalPages =
      countData === 0
        ? 0
        : limit === 0
        ? 1
        : Math.ceil(countData / limit);
    const skip = (page - 1) * limit;

    // Paginate the images array
    const paginatedImages = imagesArray.slice(skip, skip + limit);

    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      paginatedImages
    );
  } catch (error) {
    throw error;
  }
}


async function updateExpiredStatus() {
  try {
    // Find records where endAt is less than the current date and status is not "expired"
    const recordsToUpdate = await mongoDbManager.findAll(workOrders, {
      isDeleted: false,
      endAt: { $lt: new Date() },
      status: { $nin: ["draft", "completed", "expired"] }, // Ensures we don't update if it's Draft and Expired
    });
    if (recordsToUpdate.length === 0) {
      return;
    }
    const bulkOps = recordsToUpdate.map((record) => ({
      updateOne: {
        filter: { _id: record._id },
        update: {
          $set: {
            status: "expired",
            lastStatus: record.status, // Set lastStatus to the current status
          },
        },
      },
    }));

    // Execute bulk write operation
    const result = await mongoDbManager.bulkWrite(workOrders, bulkOps);
    if (result.modifiedCount > 0){
      const assetHistoryPromises = recordsToUpdate.map((record) =>
        assetHistory_manager.updateAssetHistoryByWorkOrderId(record._id,{
          $set:{
            status: "missed",
            name: "WorkOrderExpired",
            eventDate: record.endAt
          }
        }
        //   "WorkOrderExpired",         // Event Type
        //   record.name,                // WorkOrder Name
        //   record.asset,               // Asset ID
        //   new Date(),                 // Event Date
        //   "executed"                  // Status
        )
      );
      await Promise.all(assetHistoryPromises); 
    }
    return result;
  } catch (error) {
    console.error("Error updating expired status:", error);
    throw error;
  }
}

async function updateWorkOrderWhenImagesAdded(workOrderId, imageIds) {
  try {
    // Ensure imageIds is an array; if it's a string, convert it to an array
    if (!Array.isArray(imageIds)) {
      imageIds = [imageIds];
    }
    const updateWorkOrderWithImageId = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId, isDeleted: false }, // Cast workOrderId to ObjectId
      { $push: { images: { $each: imageIds } } } // Use $each to push the array
    );
    return updateWorkOrderWithImageId;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

async function checkExistingWorkOrder(query) {
  try {
    const existingWorkOrder = await mongoDbManager.findOne(workOrders, query);
    return existingWorkOrder;
  } catch (error) {
    throw error;
  }
}

async function acceptWorkOrder(workOrderId,userId) {
  try {
    const workOrderObj = await mongoDbManager.findOne(workOrders, {_id:workOrderId, isDeleted: false})
      const updateData = {
        status: "accepted",
        updatedBy: userId,
        updatedAt: Date.now(),
      };
      if (!workOrderObj.acceptTime) {
        updateData.acceptTime = new Date();
      }
    const updateStatus = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId },
      {
        $set: updateData,
      }
    );
     if (workOrderObj && updateStatus.modifiedCount > 0) {
      await SendNotificationForStatusUpdate(true, workOrderObj.createdBy.toString(), "accepted", userId, workOrderObj.name, workOrderObj._id, userId, workOrderObj.businessUnit )
     }
    return updateStatus;
  } catch (error) {
    throw error;
  }
}

async function holdWorkOrder(workOrderId,userId, workOrderObj) {
  try {
    const updateStatus = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId },
      {
        $set: {
          status: "onHold",
          updatedBy: userId,
          updatedAt: Date.now(),
        },
      }
    );
    if (workOrderObj && updateStatus.modifiedCount > 0) {
      await SendNotificationForStatusUpdate(true, workOrderObj.createdBy.toString(), "put On Hold", userId, workOrderObj.name, workOrderObj._id, userId, workOrderObj.businessUnit )
     }
    return updateStatus;
  } catch (error) {
    throw error;
  }
}

async function completeWorkOrder(workOrderId,userId) {
  try {
    const workOrder = await mongoDbManager.findOne(workOrders, { _id: workOrderId, isDeleted: false })
      const updateData = {
        status: "completed",
        updatedBy: userId,
        updatedAt: Date.now(),
      };
      if (!workOrder.completeTime) {
        updateData.completeTime = new Date();
      }
    const updateStatus = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId },
      {
        $set: updateData,
      }
    );
    if (updateStatus.modifiedCount > 0) {
      if (workOrder?.maintenanceId) {
        await updateMaintenancePlanStatus(workOrder.maintenanceId);
      }
      // const workorderData = await mongoDbManager.findOne(workOrders,{_id:workOrderId},{name:1})
      // await assetHistory_manager.createAssetHistory("WorkOrderCompleted", workorderData.name, workOrder.asset, Date.now(), "executed")
      await assetHistory_manager.updateAssetHistoryByWorkOrderId(workOrderId,{status:"executed", name: "WorkOrderCompleted", eventDate: new Date()});
      await SendNotificationForStatusUpdate(true, workOrder.createdBy.toString(), "completed", userId, workOrder.name, workOrder._id, userId, workOrder.businessUnit )
    }
    return updateStatus;
  } catch (error) {
    console.log("error", error)
    throw error;
  }
}

async function countWorkOrderStatus(reqQuery, businessUnitId, userId) {
  try {
    const returnObj = {
      totalWorkOrders: 0,
      completedWorkOrders: 0,
      onHoldWorkOrders: 0,
      acceptedWorkOrders: 0,
      expiredWorkOrders: 0,
      scheduledWorkOrders: 0,
      draftWorkOrders: 0,
    };

    const { asset } = reqQuery;

    // Build the match query
    const matchQuery = { isDeleted: false , businessUnit: new mongoose.Types.ObjectId(businessUnitId)};
    if (userId){
      matchQuery["$or"] = [
        { createdBy: new mongoose.Types.ObjectId(userId) }, // Fetch all data created by the user
        {
          $and: [
            { assignees: new mongoose.Types.ObjectId(userId) }, // User is in assignees array
            { startAt: { $lte: new Date() } }, // Only allow if startAt is in the past or now
            { status: { $nin: ["draft"] } }, // Exclude draft status
          ],
        },
        // { startAt: { $lte: new Date() } }, // Or data with startAt <= current date
        // { status: { $nin: ["draft"] } },
      ];
    }
    if (asset) {
      matchQuery.asset = new mongoose.Types.ObjectId(asset); // Adjust according to your actual field name
    }

    const aggregationPipeline = [
      { $match: matchQuery },
      {
        $facet: {
          totalWorkOrders: [{ $count: "count" }],
          completedWorkOrders: [
            { $match: { status: workOrder.status.completed } },
            { $count: "count" },
          ],
          onHoldWorkOrders: [
            { $match: { status: workOrder.status.onHold } },
            { $count: "count" },
          ],
          acceptedWorkOrders: [
            { $match: { status: workOrder.status.accepted } },
            { $count: "count" },
          ],
          expiredWorkOrders: [
            { $match: { status: workOrder.status.expired } },
            { $count: "count" },
          ],
          scheduledWorkOrders: [
            { $match: { status: workOrder.status.scheduled } },
            { $count: "count" },
          ],
          draftWorkOrders: [
            { $match: { status: workOrder.status.draft } },
            { $count: "count" },
          ],
        },
      },
    ];

    const results = await mongoDbManager.aggregation(
      workOrders,
      aggregationPipeline
    );

    const getCount = (arr) => (arr.length > 0 ? arr[0].count : 0);

    returnObj.totalWorkOrders = getCount(results[0].totalWorkOrders);
    returnObj.completedWorkOrders = getCount(results[0].completedWorkOrders);
    returnObj.onHoldWorkOrders = getCount(results[0].onHoldWorkOrders);
    returnObj.acceptedWorkOrders = getCount(results[0].acceptedWorkOrders);
    returnObj.expiredWorkOrders = getCount(results[0].expiredWorkOrders);
    returnObj.scheduledWorkOrders = getCount(results[0].scheduledWorkOrders);
    returnObj.draftWorkOrders = getCount(results[0].draftWorkOrders);

    return returnObj;
  } catch (error) {
    throw error;
  }
}

function fetchConstants() {
  const workOrderStatus = Object.values(workOrder.status);
  const workOrderPriority = Object.values(workOrder.priority);
  return {
    status: workOrderStatus,
    priority: workOrderPriority,
  };
}

async function updateStatusAfterDueDateApproval(workOrderId, lastStatus, newEndDate){
  try{
    const updateStatus = await mongoDbManager.updateOne(workOrders,{_id: workOrderId},{
      $set:{status:  lastStatus, endAt: newEndDate},
      $inc: {requestExtensionCount: 1} 
    })
    // if (updateStatus.modifiedCount > 0) {
    //   // const workorderData = await mongoDbManager.findOne(workOrders,{_id:workOrderId},{name:1})
    //   // await assetHistory_manager.createAssetHistory("WorkOrderCompleted", workorderData.name, workOrder.asset, Date.now(), "executed")
    //   await assetHistory_manager.updateAssetHistoryByWorkOrderId(workOrderId,{status:"executed", name: "WorkOrderExtended"})
    // }
  }catch{
    throw error;
  }
}

async function deleteWorkOrder(workOrderIdsToBeDeleted, userId) {
  try {
    // Reusable update function
    const updateDocuments = (collection, filterField) => {
      return mongoDbManager.updateMany(
        collection,
        { [filterField]: { $in: workOrderIdsToBeDeleted } },
        {
          $set: {
            isDeleted: true,
            updatedBy: userId,
            updatedAt: new Date(),
          }
        }
      );
    };

    // Perform all updates in parallel
    const [workOrderUpdated, workOrderTasks, workOrderDueDateRequest] = await Promise.all([
      updateDocuments(workOrders, '_id'),
      updateDocuments(DueDateRequest, 'workOrderId'),
      updateDocuments(PartsReplaced, 'workOrder'),
      updateDocuments(PartsRequired, 'workOrder'),
      updateDocuments(ToolsRequired, 'workOrder'),
      updateDocuments(Consumables, 'workOrder'),

    ]);

    return workOrderUpdated;
  } catch (error) {
    throw error;
  }
}

async function returnInvalidWorkOrderIds(ids) {
  try {
    let invalidWorkOrderIds = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidWorkOrderIds.length > 0) {
      return { invalidWorkOrderIds };
    }

    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };

    const existingWorkOrders = await mongoDbManager.findManyWithPopulate(
      workOrders,
      query,
      null,
      null,
      null,
      ["_id", "name"],
      []
    );

    const existingWorkOrderIds = existingWorkOrders.map((asset) => asset._id.toString());

    invalidWorkOrderIds.push(...ids.filter((id) => !existingWorkOrderIds.includes(id)));
    const inValidArray = Array.from(new Set(invalidWorkOrderIds));
    return { existingWorkOrders, inValidArray };
  } catch (error) {
    throw error;
  }
}

async function editDocuments(workOrderId,workOrderDocuments,newDocumentIds){
  try{
    const currentDocumentIds = workOrderDocuments || []; // Document IDs from the DB
    // Identify document IDs to add (those in newDocumentIds but not in currentDocumentIds)
    const documentIdsToAdd = newDocumentIds.filter(docId => !currentDocumentIds.includes(docId));

    // Identify document IDs to remove (those in currentDocumentIds but not in newDocumentIds)
    const documentIdsToRemove = currentDocumentIds.filter(docId => !newDocumentIds.includes(docId));

    // Perform the updates in separate operations
    
        if (documentIdsToRemove.length > 0) {
          await mongoDbManager.updateOne(
            workOrders,
            { _id: workOrderId },
            { $pull: { documents: { $in: documentIdsToRemove } } }     // Remove missing document IDs
          );
        }
    if (documentIdsToAdd.length > 0) {
      await mongoDbManager.updateOne(
        workOrders,
        { _id: workOrderId },
        { $addToSet: { documents: { $each: documentIdsToAdd } } }  // Add new document IDs
      );
    }

  }catch(error){
    throw error;
  }
}


async function updateMaintenancePlanStatus(maintenancePlanId){
  try {
    // Fetch the maintenance plan details
    const maintenanceDetail = await mongoDbManager.findOne(MaintenancePlan, { _id: maintenancePlanId }, { recurrenceDetails: 1, startAt: 1, endAt: 1 });
    if (!maintenanceDetail) return;

    let recurDetails = {
      frequency: maintenanceDetail.recurrenceDetails?.frequency || 1,
      timePeriod: maintenanceDetail.recurrenceDetails?.timePeriod || "hour",
    };

    const startDate = convertDateFormat(maintenanceDetail.startAt);
    const endDate = convertDateFormat(maintenanceDetail.endAt);
    const { intervals } = await calculateEntryTimes(startDate, endDate, recurDetails, false);
    const completedWorkOrdersCount = await mongoDbManager.count(workOrders, {
      maintenanceId: maintenancePlanId,
      status: "completed",
    });
    if (completedWorkOrdersCount >= intervals.length) {
      await mongoDbManager.updateOne(MaintenancePlan, { _id: maintenancePlanId }, { $set: { status: "completed" } });
    }
  } catch (error) {
    console.error("Error updating maintenance plan status:", error);
    throw error;
  }
};


module.exports = {
  createWorkOrder,
  checkExistingWorkOrder,
  editWorkOrder,
  getAllWorkOrders,
  updateExpiredStatus,
  getWorkOrder,
  acceptWorkOrder,
  holdWorkOrder,
  completeWorkOrder,
  countWorkOrderStatus,
  getSpareOfWorkOrder,
  fetchConstants,
  updateWorkOrderWhenImagesAdded,
  updateStatusAfterDueDateApproval,
  getImagesForWorkOrder,
  deleteWorkOrder,
  returnInvalidWorkOrderIds,
  editDocuments,
  getCopyWorkOrderDetails,
};

function fieldMappings() {
  return {
    asset: {
      localField: "asset",
      collection: "assets",
      fieldsToInclude: ["generalDetails.name", "generalDetails.number", "id"], // Example fields to include
    },
    departments: {
      localField: "departments",
      collection: "departments",
      isArray: true,
      fieldsToInclude: ["name", "id"], // Example fields to include
    },
    assignees: {
      localField: "assignees",
      collection: "users",
      isArray: true, // Adding this flag for array handling
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
    tasks: {
      localField: "tasks",
      collection: "workOrderTasks",
      isArray: true,
      fieldsToInclude: ["description", "order", "isCompleted", "images", "id", "createdAt"], // Example fields to include
    },
    documents: {
      localField: "documents",
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

//CR0002

/*

  . Added proper date-range filtering for `createdAt` and `endAt` via
     separate From / To params sent by the frontend:
       createdAtFrom, createdAtTo  →  createdAt: { $gte, $lte }
       endAtFrom,     endAtTo      →  endAt:     { $gte, $lte }
 
 
  . Removed the broken legacy `createdAt` / `updatedAt` direct-equality
     lines that referenced the undefined `req` object.
*/

// Builds a MongoDB query object based on request parameters for filtering work orders.
function queryBuilder(reqData, userId, businessUnitId) {

  // ── Date range sub-queries ─────────────────────────────────────────────────
  const createdAtRange = {};
  if (reqData.createdAtFrom) createdAtRange.$gte = new Date(reqData.createdAtFrom);
  if (reqData.createdAtTo)   createdAtRange.$lte = new Date(reqData.createdAtTo);

  const endAtRange = {};
  if (reqData.endAtFrom) endAtRange.$gte = new Date(reqData.endAtFrom);
  if (reqData.endAtTo)   endAtRange.$lte = new Date(reqData.endAtTo);

  const query = {
    isDeleted: false,

    // String regex filters
    ...(reqData.name && {
      name: { $regex: reqData.name, $options: "i" },
    }),
    ...(reqData.number && {
      number: { $regex: reqData.number, $options: "i" },
    }),
    ...(reqData.priority && {
      priority: { $regex: reqData.priority, $options: "i" },
    }),

    // Asset: use pre-resolved IDs from assetName lookup, fallback to direct ObjectId
    ...(reqData.assetIds
      ? { asset: { $in: reqData.assetIds } }
      : reqData.asset && mongoose.Types.ObjectId.isValid(reqData.asset)
        ? { asset: new mongoose.Types.ObjectId(reqData.asset) }
        : {}
    ),

    // Assignees: use pre-resolved IDs from assigneeName lookup
    ...(reqData.assigneeIds && reqData.assigneeIds.length > 0 && {
      assignees: { $in: reqData.assigneeIds },
    }),

    ...(reqData.maintenanceId && mongoose.Types.ObjectId.isValid(reqData.maintenanceId) && {
      maintenanceId: new mongoose.Types.ObjectId(reqData.maintenanceId),
    }),
    ...(reqData.department && mongoose.Types.ObjectId.isValid(reqData.department) && {
      departments: { $in: [new mongoose.Types.ObjectId(reqData.department)] },
    }),
    ...(businessUnitId && {
      businessUnit: new mongoose.Types.ObjectId(businessUnitId),
    }),
    ...(reqData.status && typeof reqData.status === "string" && {
      status: {
        $in: reqData.status.split(",").map((s) => new RegExp(`^${s.trim()}$`, "i")),
      },
    }),

    // Date range filters
    ...(Object.keys(createdAtRange).length > 0 && { createdAt: createdAtRange }),
    ...(Object.keys(endAtRange).length > 0      && { endAt: endAtRange }),
  };
  if (userId) {
    query["$or"] = [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      {
        $and: [
          { assignees: new mongoose.Types.ObjectId(userId) },
          { startAt: { $lte: new Date() } },
          { status: { $nin: ["draft"] } },
        ],
      },
    ];
  }

  // ── Pagination & sort ────
  const page      = reqData.page  ? parseInt(reqData.page,  10) : null;
  const limit     = reqData.limit ? parseInt(reqData.limit, 10) : null;
  const skip      = page && limit ? (page - 1) * limit : 0;
  const sort      = reqData.sort  || "createdAt";
  const order     = reqData.order === "asc" ? 1 : -1;
  const sortOrder = { [sort]: order };

  return { query, skip, page, limit, sortOrder };
}

//end

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromJSDate(date);
  }
  return null;
};

const calculateEntryTimes = async (
  rangeStart,
  rangeEnd,
  recurDetails,
  isEntryStarted
) => {
  const frequency = recurDetails.frequency;
  const timePeriod = recurDetails.timePeriod;
  let duration;
  switch (timePeriod) {
    case "hour":
      duration = Duration.fromObject({ hours: frequency });
      break;
    case "day":
      duration = Duration.fromObject({ days: frequency });
      break;
    case "week":
      duration = Duration.fromObject({ weeks: frequency });
      break;
    case "month":
      duration = Duration.fromObject({ months: frequency });
      break;
    case "year":
      duration = Duration.fromObject({ years: frequency });
      break;
    default:
      throw new Error("Invalid time period");
  }
  let intervals = [];
  if (!isEntryStarted) {
    intervals.push(rangeStart);
  }
  let nextInterval = rangeStart.plus(duration);
  while (nextInterval <= rangeEnd) {
    intervals.push(nextInterval);
    nextInterval = nextInterval.plus(duration);
  }
  return {intervals,nextInterval} ;
};


async function handleSendNotification(assignees, id, name, userId, businessUnit) {
  // console.log('notificationsHasToSend:', notificationsHasToSend)
    try {
      const notificationBody = await constructNotification(
        `assign`,
        `has been assigned to you.`,
        {
          id: id,
          name: name,
        },
        "workOrders",
        userId,
        businessUnit
      );
      await sendViaUserID("notification", assignees[0].toString(), notificationBody);
    } catch (error) {
      console.error(`Failed to send notification to user ${assignee}:`, error);
    }
}

async function SendNotificationForStatusUpdate (updateFlag, userIdTosend, entryStatus, doer, name, id, userId, businessUnit ) {
  try{
    const userObj = await mongoDbManager.findOne(User, {_id:doer, isDeleted: false}, {name:1})
    const notificationBody = await constructNotification(
        `statusChange`,
        `has been ${entryStatus} by ${userObj.name}.`,
        {
          id: id,
          name: name,
        },
        "workOrders",
        userId,
        businessUnit
      );
      if (updateFlag && mongoose.Types.ObjectId.isValid(userIdTosend)) {
        await sendViaUserID("notification", userIdTosend, notificationBody);
      }
  }catch(error){
    throw error;
  }
}

