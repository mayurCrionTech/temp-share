const { mongoDbManager } = require("../../dBManagers/index");
const WorkOrderTask = require("../../../models/mongoDB/maintenanceManagement/workOrderTask_model");
const {
  workOrders,
} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");
const mongoose = require("mongoose");
const paginationHandler = require("../../common/paginationHandler_manager");
const fileManager = require("../../internalManagers/fileSystem/fileSystem_manager");


async function createWorkOrderTasksManager(workOrderTasksObject, workOrderId) {
  try {
    const workOrderTasks = await mongoDbManager.insertMany(
      WorkOrderTask,
      workOrderTasksObject
    );
    const taskIds = workOrderTasks.map((task) => task._id);
    await updateWorkOrderWhenTaskAdded(workOrderId, taskIds);
    return taskIds;
  } catch (error) {
    throw error;
  }
}

async function updateWorkOrderWhenTaskAdded(workOrderId, taskIds) {
  try {
    const updateWorkOrderWithTaskId = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId, isDeleted: false },
      { $push: { tasks: { $each: taskIds } } }
    );
    return updateWorkOrderWithTaskId;
  } catch (error) {
    throw error;
  }
}

async function updateStatus(taskId,taskObject) {
  try {
    const updateStatus = await mongoDbManager.updateOne(
      WorkOrderTask,
      { _id: taskId },
      { $set: taskObject }
    );
    return updateStatus;
  } catch (error) {
    throw error;
  }
}

async function fetchTaskDetails(taskId, reqQuery, reqHost, reqProtocol) {
  try {
    let page = reqQuery.page ? parseInt(reqQuery.page, 10) : 0;
    let limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 200;
    const sort = reqQuery.sort || "createdAt";
    const order = reqQuery.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 200;
    const task = new mongoose.Types.ObjectId(taskId);
    const fieldMapping = fieldMappings();
    const populateFields = ["createdBy", "updatedBy", "images"];

    const selectFields = [
      "description",
      "order",
      "isCompleted",
      "images",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt",
    ];
    let data = await mongoDbManager.buildSingleAggregationPipeline(
      WorkOrderTask,
      task,
      {},
      fieldMapping,
      populateFields,
      selectFields
    );
    const fileDocuments = [];
    if (data.images && data.images.length > 0) {
      fileDocuments.push(
        ...(await Promise.all(
          data.images.map((document) =>
            fileManager.transformFileObj(document, "view", reqHost, reqProtocol)
          )
        ))
      );
    }
    const countData = fileDocuments.length;
    const totalPages =
      countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);
    const skip = (page - 1) * limit;
    const paginatedImages = fileDocuments.slice(skip, skip + limit);
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

async function checkExistingWorkOrderTask(query) {
  try {
    const existingWorkOrder = await mongoDbManager.findOne(
      WorkOrderTask,
      query
    );
    return existingWorkOrder;
  } catch (error) {
    throw error;
  }
}

// async function editWorkOrderTasks(workOrderId,updateArray){
//   try {
//     let existingWorkOrder
//     for(let updateObj of updateArray){
//       let query = {
//         workOrderId: workOrderId,
//         _id: updateObj.id
//       }
//       existingWorkOrder = await mongoDbManager.updateOne(WorkOrderTask, query, {$set:{
//         "description": updateObj.description,
//         "index": updateObj.index,
//         "updatedBy": updateObj.updatedBy,
//         "updatedAt": updateObj.updatedAt
//       }});
//     }
//     console.log("existingWorkOrder",existingWorkOrder)
//     return existingWorkOrder;
//   } catch (error) {
//     throw error;
//   }
// }

async function editWorkOrderTasks(workOrderId, updateArray) {
  try {
    const bulkOps = updateArray.map((updateObj) => ({
      updateOne: {
        filter: {
          workOrderId: workOrderId,
          _id: updateObj.id,
        },
        update: {
          $set: {
            description: updateObj.description,
            order: updateObj.order,
            updatedBy: updateObj.updatedBy,
            updatedAt: updateObj.updatedAt,
          },
        },
      },
    }));

    const result = await mongoDbManager.bulkWrite(WorkOrderTask, bulkOps);
    return result;
  } catch (error) {
    throw error;
  }
}

async function deleteTasks(workOrderId, taskIds, userId) {
  try {
    let query = {
      workOrderId: workOrderId,
      _id: { $in: taskIds },
    };
    const existingWorkOrder = await mongoDbManager.updateMany(
      WorkOrderTask,
      query,
      {
        $set: {
          isDeleted: true,
          updatedBy: userId,
          updatedAt: Date.now(),
        },
      }
    );
    await updateWorkOrderWhenTaskDeleted(workOrderId, taskIds);
    return existingWorkOrder;
  } catch (error) {
    throw error;
  }
}

async function updateWorkOrderWhenTaskDeleted(workOrderId, taskIds) {
  try {
    const updateWorkOrderWithTaskId = await mongoDbManager.updateOne(
      workOrders,
      { _id: workOrderId, isDeleted: false },
      { $pull: { tasks: { $in: taskIds } } } // Use $pull to remove specific IDs
    );
    return updateWorkOrderWithTaskId;
  } catch (error) {
    throw error;
  }
}

async function returnInvalidTaskIds(ids, workOrderId) {
  try {
    let invalidTaskIds = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidTaskIds.length > 0) {
      return { invalidTaskIds };
    }

    const query = {
      _id: { $in: ids },
      workOrderId: workOrderId,
      isDeleted: false,
    };

    const existingTasks = await mongoDbManager.findManyWithPopulate(
      WorkOrderTask,
      query,
      null,
      null,
      null,
      ["_id", "name"],
      []
    );

    const existingTaskIds = existingTasks.map((asset) => asset._id.toString());

    invalidTaskIds.push(...ids.filter((id) => !existingTaskIds.includes(id)));
    const inValidArray = Array.from(new Set(invalidTaskIds));
    return { existingTasks, inValidArray };
  } catch (error) {
    throw error;
  }
}

async function updateWorkOrderTasksWhenImagesAdded (taskId, imageIds){
  try{
    if (!Array.isArray(imageIds)) {
      imageIds = [imageIds];
    }
    const updateWorkOrderTaskWithImageId = await mongoDbManager.updateOne(
      WorkOrderTask,
      { _id: taskId, isDeleted: false }, // Cast workOrderId to ObjectId
      { $push: { images: { $each: imageIds } } } // Use $each to push the array
    );
    return updateWorkOrderTaskWithImageId;
  }catch(error){
    throw error;
  }
}

module.exports = {
  createWorkOrderTasksManager,
  checkExistingWorkOrderTask,
  updateStatus,
  editWorkOrderTasks,
  deleteTasks,
  returnInvalidTaskIds,
  fetchTaskDetails,
  updateWorkOrderTasksWhenImagesAdded,
};

function fieldMappings() {
  return {
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
      ], // Example fields to include
    },
    updatedBy: {
      localField: "updatedBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
      isArray: false
  },
  createdBy: {
      localField: "createdBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
      isArray: false
  },
  };
}
