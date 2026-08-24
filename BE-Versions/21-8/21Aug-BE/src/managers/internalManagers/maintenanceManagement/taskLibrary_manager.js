/*
date              cr/qid      comments
24-march-2026     CR0001      1) Updated - ref of asset category removed for - dropdown api & replaced by dropdown_options

date            qid / cr#         comments
13-mar-2026     CR0002           filteration for task

*/
const { TaskLibrary } = require("../../../models/mongoDB/maintenanceManagement/taskLibrary_model");
const {Task} = require("../../../models/mongoDB/maintenanceManagement/tasks_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = TaskLibrary;
const mongoose = require("mongoose");
const {
    generateVersionNumber,
  } = require("../../../utils/generateVersionNumber");



async function createTaskLibrary(createObj) {
    try {
        createObj.number = await generateTaskLibraryNumber();
        const datum = await mongoDbManager.insertOne(Model, createObj);
        return { id: datum._id };
    } catch (error) {
        throw error;
    }
}

async function generateTaskLibraryNumber() {
  try {
    const lastTskNumber = await mongoDbManager.count(Model, {
      isDeleted: false,
    });
    let currentVersion = "00001";
    if (lastTskNumber !== null) {
      currentVersion = await generateVersionNumber(lastTskNumber);
    }
    const tskNumber = "TSK-" + currentVersion;
    console.log("tskNumber", tskNumber);
    return tskNumber;
  } catch (error) {
    throw error;
  }
}


async function createTasksForTaskLibrary(reqData, taskLibraryId, userId, businessUnitId){
    try{
        if (reqData.tasks) {
            const tasksObj = createTasksObject(reqData, taskLibraryId, userId, businessUnitId);
            const createdTasks =
              await createTasks(
                tasksObj
              );
            return createdTasks;
          } else {
            return {};
          }
    }catch(error){
        throw error;
    }
}

async function getTaskLibraryCount(businessUnitId){
    try{
        const count = await mongoDbManager.count(Model, {"isDeleted": false, businessUnit: businessUnitId})
        return count;
    }catch(error){
        throw error
    }
}

async function createTasks (tasksObj){
        try {
            const tasks = await mongoDbManager.insertMany(
              Task,
              tasksObj
            );
            const taskIds = tasks.map((task) => task._id);
            return taskIds;
            return tasks;
          } catch (error) {
            throw error;
          }

}

async function updateTaskLibrary(id, updateObj) {
    try {
        const query = {
            _id: id,
            isDeleted: false,
        };
        const datum = await mongoDbManager.updateOne(Model, query, updateObj);
        return datum;
    } catch (error) {
        throw error;
    }
}

async function editTaskLibraryTasks(taskLibraryId, maintenancePlanId, updateArray) {
    try {
        // Build the bulk operations array
        const bulkOps = updateArray.map((updateObj) => {
            const filter = {
                _id: updateObj.id,
                ...(taskLibraryId && { taskLibrary: taskLibraryId }),
                ...(maintenancePlanId && { maintenancePlan: maintenancePlanId }),
            };

            return {
                updateOne: {
                    filter: filter,
                    update: {
                        $set: {
                            description: updateObj.description,
                            order: updateObj.order,
                            updatedBy: updateObj.updatedBy,
                            updatedAt: updateObj.updatedAt,
                        },
                    },
                },
            };
        });

        // Execute the bulk write operation
        const result = await mongoDbManager.bulkWrite(Task, bulkOps);
        return result;
    } catch (error) {
        throw error;
    }
}



async function deleteTaskLibraries(ids,userId) {
    try {
        const deleteResults = await mongoDbManager.updateMany(
            Model,
            { _id: { $in: ids } },
            { $set: { isDeleted: true, updatedBy: userId, updatedAt: Date.now() } }
        );
        const deleteTasks = await mongoDbManager.updateMany(
            Task,
            { taskLibrary: { $in: ids } },
            { $set: { isDeleted: true, updatedBy: userId, updatedAt: Date.now() } }
        );
        return deleteResults;
    } catch (error) {
        throw error;
    }
}

async function deleteTasks(taskIds, taskLibraryId, maintenancePlanId, userId) {
    try {
        // Determine the filter based on provided IDs
        const filter = { 
            _id: { $in: taskIds },
            isDeleted: false, 
            ...(taskLibraryId && { taskLibrary: taskLibraryId }),
            ...(maintenancePlanId && { maintenancePlan: maintenancePlanId })
        };

        // Perform the update operation
        const deleteTasks = await mongoDbManager.updateMany(
            Task,
            filter,
            { $set: { isDeleted: true, updatedBy: userId, updatedAt: Date.now() } }
        );

        return deleteTasks;
    } catch (error) {
        throw error;
    }
}

async function editTasks(reqData, taskLibraryId, userId, businessUnit){
    try{
        let editedTasks;
        if (reqData.tasksToBeEdited) {
          const tasksObjs = editTasksObject(reqData, userId);
          editedTasks = await editTaskLibraryTasks(
            taskLibraryId,
            null,
            tasksObjs
          );
        }
        if (reqData.tasksToBeAdded) {
          const createTasksObj = createTasksObject(reqData, taskLibraryId, userId, businessUnit);
          editedTasks =
            await createTasks(
                createTasksObj,
            );
        }
        if (reqData.tasksDeleted) {
          editedTasks = await deleteTasks(
            reqData.tasksDeleted,
            taskLibraryId,
            null,
            userId
          );
        }
        return editedTasks;
    }catch(error){
        throw error
    }
}

const returnInvalidTaskLibraryIds = async (ids) => {
    try {
        let invalidTaskLibraryIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

        if (invalidTaskLibraryIds.length > 0) {
            return invalidTaskLibraryIds;
        }

        const query = {
            _id: { $in: ids },
            isDeleted: false
        };

        const existingTaskLibraries = await mongoDbManager.findManyWithPopulate(
            Model,
            query,
            null,
            null,
            null,
            "_id",
            []
        );

        const existingTaskLibraryIds = existingTaskLibraries.map((tasklibrary) => tasklibrary._id.toString());

        invalidTaskLibraryIds.push(...ids.filter((id) => !existingTaskLibraryIds.includes(id)));

        return Array.from(new Set(invalidTaskLibraryIds));
    } catch (error) {
        throw error;
    }
};

const getTaskLibraries = async (reqData, businessUnitId) => {
    try {
        //CR0002
        //Start
        //query the assetCategories collection for documents whose
        // name matches the search string, collect their _ids, and store them in
        // reqData.assetCategoryIds so queryBuilder can use $in on ObjectIds.
        if (reqData.assetCategory) {
            const assetCategoryCollection = mongoose.connection.collection("assetCategories");
            const matchingCategories = await assetCategoryCollection
                .find(
                    { name: { $regex: reqData.assetCategory, $options: "i" } },
                    { projection: { _id: 1 } }
                )
                .toArray();
            // If name matched nothing → [] → $in:[] → zero results (correct behaviour)
            reqData.assetCategoryIds = matchingCategories.map((c) => c._id);
        }
        //End
        const queryObj = queryBuilder(reqData, null, businessUnitId);
        const fieldMapping = fieldMappings();
        const countData = await mongoDbManager.count(Model, queryObj.query);

        // Handle cases where either page or limit is not provided
        if (queryObj.page === null && queryObj.limit === null) {
            queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
            queryObj.page = 1; // Set page to 1 if no page is provided
        } else if (queryObj.page === null) {
            queryObj.page = 1; // Set default page to 1 if not provided
        } else if (queryObj.limit === null) {
            queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
        }

        if (queryObj.limit === 0 && queryObj.page > 1) {
            return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
        }

        const populateFields = ["assetCategory","createdBy","updatedBy"];

        const selectFields = ["name","description","number", "assetCategory","createdBy","updatedBy"];

        let data = await mongoDbManager.fetchAllAndPopulate(
            Model,
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

        const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

        return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
    } catch (error) {
        throw error;
    }
};

async function getTaskLibrary(taskLibraryId, reqData, businessUnitId) {

    try {
        taskLibraryId = new mongoose.Types.ObjectId(taskLibraryId);
        const queryObj = queryBuilder(reqData, null, businessUnitId);
        const fieldMapping = fieldMappings();
        const populateFields = ["assetCategory","createdBy","updatedBy"];

        const selectFields = ["name","description","number", "assetCategory","createdBy","updatedBy", "createdAt", "updatedAt"];
        let datum = await mongoDbManager.buildSingleAggregationPipeline(
            Model,
            taskLibraryId,
            queryObj.query,
            fieldMapping,
            populateFields,
            selectFields
        );
        let tasks = await mongoDbManager.findManyWithPopulate(
            Task,
            {taskLibrary:taskLibraryId, "isDeleted": false, businessUnit: new mongoose.Types.ObjectId(businessUnitId)},
            queryObj.limit,
            queryObj.skip,
            queryObj.sortOrder,
            "_id description order",
            []
        );
        tasks = tasks.map((task) => {
            const { _id, ...rest } = task;
            return { id: _id, ...rest };
        });
        datum.tasks = tasks

        if (datum) {
            const { _id, ...rest } = datum;
            return { id: _id , ...rest};
        } else return null;
    } catch (err) {
        throw err;
    }
}

async function checkExistingTaskLibrary(query) {
    try {
        const existingTaskLibrary = await mongoDbManager.findOne(Model, query);

        return existingTaskLibrary;
    } catch (error) {
        throw error;
    }
}

async function checkExistingTaskLibraryTask(query) {
    try {
        const existingTaskLibraryTask = await mongoDbManager.findOne(Task, query);

        return existingTaskLibraryTask;
    } catch (error) {
        throw error;
    }
}

const returnInvalidTaskIds = async (ids, taskLibraryId, maintenancePlanId) => {
    try {
        // Filter out invalid ObjectIds
        let invalidTaskIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
        
        if (invalidTaskIds.length > 0) {
            return { inValidArray: invalidTaskIds };
        }

        // Build the query dynamically based on the provided IDs
        const query = {
            _id: { $in: ids },
            ...(taskLibraryId && { taskLibrary: taskLibraryId }),
            ...(maintenancePlanId && { maintenancePlan: maintenancePlanId }),
            isDeleted: false
        };

        // Fetch existing tasks matching the query
        const existingTasks = await mongoDbManager.findManyWithPopulate(
            Task,
            query,
            null,
            null,
            null,
            "_id",
            []
        );

        // Get existing task IDs as strings
        const existingIds = existingTasks.map((task) => task._id.toString());

        // Find IDs that are not present in the existing tasks
        invalidTaskIds.push(...ids.filter((id) => !existingIds.includes(id)));

        // Remove duplicates from the invalid IDs
        const invalidTasks = Array.from(new Set(invalidTaskIds));
        return { invalidTaskIds: invalidTasks,existingTasks};
    } catch (error) {
        throw error;
    }
};


module.exports = {
    createTaskLibrary,
    returnInvalidTaskIds,
    checkExistingTaskLibraryTask,
    updateTaskLibrary,
    deleteTaskLibraries,
    returnInvalidTaskLibraryIds,
    getTaskLibraries,
    getTaskLibrary,
    checkExistingTaskLibrary,
    createTasksForTaskLibrary,
    getTaskLibraryCount,
    editTasks,
    createTasks,
    deleteTasks,
    editTaskLibraryTasks,
};



function createTasksObject(reqData, taskLibraryId, userId, businessUnitId) {
    const tasks = reqData.tasks || reqData.tasksToBeAdded;
    if (!Array.isArray(tasks)) {
      return [];
    }
    const taskObjects = tasks.map((task) => ({
      description: task.description, 
      order: task.order,
      taskLibrary: taskLibraryId, 
      businessUnit: businessUnitId,
      updatedBy: userId, // User who updated
      createdBy: userId, // User who created
    }));
    // Return the array of task objects
    return taskObjects;
  }

  function editTasksObject(reqData, userId){
    const tasks  = reqData.tasksToBeEdited;
  if (!Array.isArray(tasks)) {
    return [];
  }
  const taskObjects = tasks.map((task) => ({
    id: task.id,
    description: task.description, // Task description from req.body.tasks
    order: task.order,
    updatedBy: userId, // User who updated
    updatedAt: Date.now(), // User who created
  }));

  // Return the array of task objects
  return taskObjects;
}

function fieldMappings() {
    return {
        // CR0001
        assetCategory: {
            localField: "assetCategory",
            // collection: "assetCategories",
            collection: "dropdown_options",
            // fieldsToInclude: ["name", "id"], // Example fields to include
            fieldsToInclude: ["value", "id"], // Example fields to include
            isArray: false,
        },
        businessUnit: {
            localField: "businessUnit",
            collection: "businessUnits",
            fieldsToInclude: ["name", "id"], // Example fields to include
            isArray: false // Indicate this should not be forced into an array
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

function queryBuilder(reqData, taskLibraryId, businessUnitId) {
    const query = {
        isDeleted: false,
        //START
        //CR0002
        ...(taskLibraryId && {
            "taskLibrary": taskLibraryId
        }),
        ...(businessUnitId && {
            "businessUnit": new mongoose.Types.ObjectId(businessUnitId)
        }),
        ...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),

        ...(reqData.number && { number: { $regex: reqData.number.trim(), $options: "i" } }),

        ...(reqData.assetCategoryIds !== undefined && {
            assetCategory: { $in: reqData.assetCategoryIds }
        }),
        //END
        //CR0002
        ...(reqData.businessUnits && { businessUnit: { $in: reqData.businessUnits } }),
        ...(reqData.createdAt && { createdAt: reqData.createdAt }),
        ...(reqData.updatedAt && { updatedAt: reqData.updatedAt })
    };

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
        sortOrder
    };
}
