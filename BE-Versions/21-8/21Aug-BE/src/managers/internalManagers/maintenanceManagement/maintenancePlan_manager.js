/*
date            qid / cr#         comments
15-mar-2026     CR0002           filteration for MAINTANANCE

*/
const {
    maintenancePlan,
    MaintenancePlan,
  } = require("../../../models/mongoDB/maintenanceManagement/maintenancePlan_model");
  const MaintenancePlanVersion = require("../../../models/mongoDB/maintenanceManagement/maintenancePlanVersion_model")
  const {Task} = require("../../../models/mongoDB/maintenanceManagement/tasks_model")
  const WorkOrderTasks = require("../../../models/mongoDB/maintenanceManagement/workOrderTask_model");
  const {
    generateVersionNumber,
  } = require("../../../utils/generateVersionNumber");
  const { mongoDbManager } = require("../../dBManagers/index");
  const paginationHandler = require("../../common/paginationHandler_manager");
  const mongoose = require("mongoose");
  const fileManager = require("../../internalManagers/fileSystem/fileSystem_manager");
  const taskLibraryManager = require("../../internalManagers/maintenanceManagement/taskLibrary_manager");
  const Team = require("../../../models/mongoDB/userManagement/team_model");
const User = require("../../../models/mongoDB/userManagement/user_model");// ["Added User model reference to support assignee name-based filtering in maintenance plans."]
const { updateOne } = require("../../../models/mongoDB/userManagement/user_model");
const { Assets } = require("../../../models/mongoDB/assetManagement/asset_model");
  
  
  async function createMaintenancePlan(maintenancePlanObject, userId, reqProtocol, reqGetHost) {
    try {
        maintenancePlanObject.number = await generateMaintenancePlanNumber();
      const createdMaintenancePlan = await mongoDbManager.insertOne(
        MaintenancePlan,
        maintenancePlanObject
      );
      await updateAsset(createdMaintenancePlan)
      maintenancePlanObject.maintenanceId = createdMaintenancePlan._id
      maintenancePlanObject.version = await generateMaintenanceVersionNumber(createdMaintenancePlan._id)
      maintenancePlanObject.documents = await updateFiles(createdMaintenancePlan, "documents",userId, reqProtocol, reqGetHost)
      maintenancePlanObject.images = await updateFiles(createdMaintenancePlan, "images",userId, reqProtocol, reqGetHost)
      const createdMaintenancePlanVersion = await mongoDbManager.insertOne(MaintenancePlanVersion,maintenancePlanObject)
      await updateFilePathsForPlan(createdMaintenancePlanVersion,  createdMaintenancePlanVersion._id, userId,"documents");
      await updateFilePathsForPlan(createdMaintenancePlanVersion,  createdMaintenancePlanVersion._id, userId,"images");
      return {createdMaintenancePlan, createdMaintenancePlanVersion};
    } catch (error) {
      throw error;
    }
  }
  const updateAsset = async (createdMaintenancePlan) => {
    try {
      // Update the asset's isMaintenancePresent field
      const result = await mongoDbManager.updateOne(
        Assets,
        { _id: createdMaintenancePlan.asset },
        { $set: { isMaintenancePresent: true } } // Use $set for clarity
      );
  
      // Optionally log or handle the result
      console.log("Asset update result:", result);
  
      // Return the result if needed by the caller
      return result;
    } catch (error) {
      console.error("Error updating asset:", error.message);
      throw error; // Rethrow to propagate the error
    }
  };
  

  const updateFilePathsForPlan = async (planObj, id, userId,fileType ) => {
    try {
        if (planObj[fileType] && planObj[fileType].length > 0) {
          await fileManager.updateFilePaths(
            null,
            planObj[fileType],
            "maintenancePlans",
            id,
            userId
          );
        }
    } catch (error) {
      throw error;
    }
  };

  async function updateFiles(maintenancePlanObject, fileType, userId, reqProtocol, reqGetHost) {
    try {
      const createdFileIds = [];
      const files = maintenancePlanObject[fileType]; // Dynamically access "documents" or "images"
      if (files && files.length > 0) {
        // Copy files to the desired location
        const createCopyFiles = await fileManager.copyToLocation(
          null,
          userId,
          "uploads",
          files
        );
  
        // Transform and collect created file IDs
        for (let file of createCopyFiles) {
          await fileManager.transformFileObj(file, "view", reqGetHost, reqProtocol);
          createdFileIds.push(file.id);
        }
        return createdFileIds;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }
  
  
  async function generateMaintenancePlanNumber() {
    try {
      const lastMaintenancePlanNumber = await mongoDbManager.count(MaintenancePlan, {
        isDeleted: false,
      }); // Generates the workorder Number based on the count of workorder.
      let currentVersion = "00001";
      if (lastMaintenancePlanNumber !== null) {
        currentVersion = await generateVersionNumber(lastMaintenancePlanNumber);
      }
    //   const planNumber = currentVersion;
      return currentVersion;
    } catch (error) {
      throw error;
    }
  }

  async function generateMaintenanceVersionNumber(maintenanceId) {
    try {
      const lastMaintenancePlanNumber = await mongoDbManager.count(MaintenancePlanVersion, {
        isDeleted: false, maintenanceId: maintenanceId
      }); // Generates the workorder Number based on the count of workorder.
      let currentVersion = "00001";
      if (lastMaintenancePlanNumber !== null) {
        currentVersion = await generateVersionNumber(lastMaintenancePlanNumber);
      }
    //   const planNumber = currentVersion;
      return currentVersion;
    } catch (error) {
      throw error;
    }
  }

  async function createTasksForMaintenancePlan(reqData, maintenanceId, maintenanceVersionId, userId, businessUnit){
    try{
        if (reqData.tasks || reqData.tasksToBeAdded) {
          if(maintenanceId){
            const tasksObj = createTasksObject(reqData, maintenanceId, userId, businessUnit);
            const createdTasks =
              await taskLibraryManager.createTasks(
                tasksObj
              );
              await updateMaintenancePlanWhenTaskAdded(maintenanceId, createdTasks)
          }
          if(maintenanceVersionId){
              const taskObjVersion = createTasksObject(reqData, maintenanceVersionId, userId, businessUnit);
                const createdTaskVersions =
                await taskLibraryManager.createTasks(
                  taskObjVersion
                );
              await updateMaintenancePlanVersionWhenTaskAdded(maintenanceVersionId, createdTaskVersions)
            }
          } else {
            return {};
          }
    }catch(error){
        throw error;
    }
}

async function updateMaintenancePlanWhenTaskAdded(id, taskIds) {
    try {
      const updateWithTaskId = await mongoDbManager.updateOne(
        MaintenancePlan,
        { _id: id, isDeleted: false },
        { $push: { tasks: { $each: taskIds } } }
      );
      return updateWithTaskId;
    } catch (error) {
      throw error;
    }
  }
  
  async function updateMaintenancePlanVersionWhenTaskAdded(id, taskIds) {
    try {
      const updateWithTaskId = await mongoDbManager.updateOne(
        MaintenancePlanVersion,
        { _id: id, isDeleted: false },
        { $push: { tasks: { $each: taskIds } } }
      );
      return updateWithTaskId;
    } catch (error) {
      throw error;
    }
  }


  async function editMaintenancePlan(updateObject, maintenanceId, userId, reqProtocol, reqGetHost, reqBody) {
    try {
      const query = {
        _id: maintenanceId,
        isDeleted: false,
      };
     const updatedMaintenance = await mongoDbManager.findOneAndUpdate(MaintenancePlan, query, updateObject);
     if(reqBody.documents && reqBody.documents.length > 0){
      await updateFilePathsForPlan(updateObject,  maintenanceId, userId,"documents");
    }
    if(reqBody.images && reqBody.images.length > 0){
      await updateFilePathsForPlan(updateObject,  maintenanceId, userId,"images");
    }
     updateObject.maintenanceId = maintenanceId
     updateObject.version = await generateMaintenanceVersionNumber(maintenanceId)
     updateObject.documents = await updateFiles(updateObject, "documents", userId, reqProtocol, reqGetHost)
     updateObject.images = await updateFiles(updateObject, "images",userId, reqProtocol, reqGetHost)
     const createdMaintenancePlanVersion = await mongoDbManager.insertOne(MaintenancePlanVersion,updateObject)
     await updateFilePathsForPlan(createdMaintenancePlanVersion,  createdMaintenancePlanVersion._id, userId,"documents");
      await updateFilePathsForPlan(createdMaintenancePlanVersion,  createdMaintenancePlanVersion._id, userId,"images");
     return createdMaintenancePlanVersion
    } catch (error) {
      throw error;
    }
  }

// Builds a MongoDB query object based on request parameters for filtering maintenance plans.

//CR0002

//start
  async function getAllMaintenancePlans(reqData, userId, businessUnitId) {
    try {
      // ── Resolve text filter values → ObjectIds before passing to queryBuilder ──

      // Assigned User: frontend sends a name string; DB stores ObjectIds.
      if (reqData.assignees) {
        const matchingUsers = await User.find({
          name: { $regex: reqData.assignees.trim(), $options: "i" },
        }).select("_id");
        reqData.assigneeIds = matchingUsers.map((u) => u._id);
      }

      // Team: frontend sends a name string; DB stores [{id: ObjectId, ...}].
      if (reqData.existingTeams) {
        const matchingTeams = await Team.find({
          name: { $regex: reqData.existingTeams.trim(), $options: "i" },
        }).select("_id");

        reqData.teamIds = matchingTeams.map((t) => t._id);

        //  if no team found →  no result
        if (reqData.teamIds.length === 0) {
          return paginationHandler.paginationResObj(1, 0, 0, []);
        }
      }

      // Department: frontend sends a name string (not an ObjectId).
      if (reqData.departments) {
        if (mongoose.Types.ObjectId.isValid(reqData.departments)) {
          // Caller sent a raw ObjectId — wrap it directly (e.g. programmatic use)
          reqData.departmentIds = [reqData.departments];
        } else {
          // Name-based lookup: resolve department name string → ObjectId(s).
          // BUG 9 FIX: Use mongoose.models with both common casings ('Department' or 'departments').
          const DepartmentModel = mongoose.models.Department || mongoose.models.departments;
          if (DepartmentModel) {
            const matchingDepts = await DepartmentModel.find({
              name: { $regex: reqData.departments.trim(), $options: "i" },
            }).select("_id");
            reqData.departmentIds = matchingDepts.map((d) => d._id);
          }
        }
      }
      //end

      const queryObj = queryBuilder(reqData, userId, null, businessUnitId);
      const fieldMapping = fieldMappings();
      const countData = await mongoDbManager.count(MaintenancePlan, queryObj.query);
  
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
        return paginationHandler.paginationResObj(
          queryObj.page,
          1,
          countData,
          []
        );
      }
  
      const populateFields = ["asset", "assignees", "departments"];
  
      const selectFields = [
        "name",
        "number",
        "priority",
        // CR0001
        // "priorityId",
        "startAt",
        "endAt",
        "createdAt",
        "asset",
        "assignees",
        "updatedAt",
        "status",
        "localTeams",
        "existingTeams",
        "departments",
        "addToAssetHistory",
        "isRecurrence",
        "recurrenceDetails.frequency",
        "scheduledTime",
      ];
  
      let data = await mongoDbManager.fetchAllAndPopulate(
        MaintenancePlan,
        queryObj.query,
        fieldMapping,
        queryObj.limit,
        queryObj.page,
        queryObj.sortOrder,
        populateFields,
        selectFields
      );
  
      if (data) {
        if (Array.isArray(data)) {
          data = await Promise.all(
            data.map(async (item) => {
              if (item.existingTeams && Array.isArray(item.existingTeams)) {
                item.existingTeams = await Promise.all(
                  item.existingTeams.map(async (team) => {
                    const populatedTeam = await Team.findById(team.id).select('name');
                    return {
                      id: populatedTeam?._id || null,
                      name: populatedTeam?.name || null,
                      noOfMembersRequired: team.noOfMembersRequired || null,
                    };
                  })
                );
              }
              const { _id, ...rest } = item;
              return {id: _id , ...rest};
            })
          );
        }
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
    } catch (error) {
      throw error;
    }
  }
  
  async function getMaintenancePlan(maintenancePlanId, reqData, businessUnitId) {
    try {
      const queryObj = queryBuilder(reqData, null, null, businessUnitId);
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
        // CR0001
        // "priorityId",
        "startAt",
        "endAt",
        "estimatedDays",
        "estimatedHours",
        "assignees",
        "existingTeams",
        "localTeams",
        "tasks",
        "isRecurrence",
        "recurrenceDetails",
        "scheduledTime",
        "isWorkPermitRequired",
        "isMaintenanceScheduled",
        "documents",
        "images",
        "addToAssetHistory",
      ];
    
      maintenancePlanId = new mongoose.Types.ObjectId(maintenancePlanId);
    
      const datum = await mongoDbManager.buildSingleAggregationPipeline(
        MaintenancePlan,
        maintenancePlanId,
        queryObj.query,
        fieldMapping,
        populateFields,
        selectFields
      );
    
      if (datum) {
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
        return { ...rest, id: _id };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error fetching detailed maintenancePlan:", err);
      throw err;
    }
  }
  
  async function getMaintenancePlanVersion(versionId, reqData, businessUnitId) {
    try {
      const queryObj = queryBuilder(reqData,null,null,businessUnitId);
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
        // CR0001
        // "priorityId",
        "startAt",
        "endAt",
        "estimatedDays",
        "estimatedHours",
        "assignees",
        "existingTeams",
        "localTeams",
        "tasks",
        "isRecurrence",
        "recurrenceDetails",
        "scheduledTime",
        "isWorkPermitRequired",
        "isMaintenanceScheduled",
        "documents",
        "images",
       
      ];
    
      versionId = new mongoose.Types.ObjectId(versionId);
    
      const datum = await mongoDbManager.buildSingleAggregationPipeline(
        MaintenancePlanVersion,
        versionId,
        queryObj.query,
        fieldMapping,
        populateFields,
        selectFields
      );
    
      if (datum) {
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
        return {  id: _id, ...rest};
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error fetching detailed maintenancePlan:", err);
      throw err;
    }
  }

  async function getImagesForMaintenancePlan(maintenanceId,reqQuery,reqHost,reqProtocol) {
    try {
      const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 0;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 200;
    const skip = page && limit ? (page - 1) * limit : 0;
    const sort = reqQuery.sort || "createdAt";
    const order = reqQuery.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };
  
      const getMaintenanceImage = await getMaintenancePlan(
        maintenanceId,
        reqQuery
      );
      if (getMaintenanceImage.images && getMaintenanceImage.images.length > 0) {
        const fileDocuments = [];
        for (let document of getMaintenanceImage.images) {
          const images = await fileManager.transformFileObj(
            document,
            "download",
            reqHost,
            reqProtocol
          );
          fileDocuments.push(images);
        }
        getMaintenanceImage.images = fileDocuments;
      }
      if(!getMaintenanceImage.images){
        getMaintenanceImage.images = []
      }
  
      let countData = getMaintenanceImage.images.length;
  
      const totalPages =
        countData === 0
          ? 0
          : limit === 0
          ? 1
          : Math.ceil(countData / limit);
  
      return paginationHandler.paginationResObj(
        page,
        totalPages,
        countData,
        getMaintenanceImage.images
      );
  
    } catch (error) {
      throw error;
    }
  }
  
  async function updateExpiredStatus() {
    try {
      // Find records where endAt is less than the current date and status is not "expired"
      const recordsToUpdate = await mongoDbManager.findAll(MaintenancePlan, {
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
      const result = await mongoDbManager.bulkWrite(MaintenancePlan, bulkOps);
  
      return result;
    } catch (error) {
      console.error("Error updating expired status:", error);
      throw error;
    }
  }
  
  async function updateMaintenanceWhenImagesAdded(maintenanceId, imageIds) {
    try {
      // Ensure imageIds is an array; if it's a string, convert it to an array
      if (!Array.isArray(imageIds)) {
        imageIds = [imageIds];
      }
      const updateWithImageId = await mongoDbManager.updateOne(
        MaintenancePlan,
        { _id: maintenanceId, isDeleted: false }, // Cast workOrderId to ObjectId
        { $push: { images: { $each: imageIds } } } // Use $each to push the array
      );
      return updateWithImageId;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
  
  async function checkExistingMaintenancePlan(query) {
    try {
      const existingPlan = await MaintenancePlan.findOne(query).populate("tasks");
      return existingPlan;
    } catch (error) {
      throw error;
    }
  }

  async function checkExistingMaintenancePlanVersion(query) {
    try {
      const existingPlan = await mongoDbManager.findOne(MaintenancePlanVersion, query);
      return existingPlan;
    } catch (error) {
      throw error;
    }
  }
  
  async function getVersions(reqData, maintenanceId, businessUnitId) {
    try {
      const queryObj = queryBuilder(reqData, null , maintenanceId, businessUnitId);
      const fieldMapping = fieldMappings();
      const countData = await mongoDbManager.count(MaintenancePlanVersion, queryObj.query);
  
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
        return paginationHandler.paginationResObj(
          queryObj.page,
          1,
          countData,
          []
        );
      }
  
      const selectFields = [
        "name",
        "number",
        "version",
        "priority",
        // CR0001
        // "priorityId",
        "startAt",
        "endAt",
        "createdAt",
        "updatedAt",
        "status",
      ];
  
      let data = await mongoDbManager.fetchAllAndPopulate(
        MaintenancePlanVersion,
        queryObj.query,
        {},
        queryObj.limit,
        queryObj.page,
        queryObj.sortOrder,
        [],
        selectFields
      );
  
      if (data) {
        data = data.map((result) => {
          const { _id, ...rest } = result;
          return {  id: _id , ...rest};
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
    } catch (error) {
      throw error;
    }
  }

  async function countMaintenanceStatus(reqQuery, businessUnitId) {
    try {
      const returnObj = {
        totalMaintenancePlans: 0,
        scheduledMaintenancePlans: 0,
        draftMaintenancePlans: 0,
      };
  
      const { asset } = reqQuery;
  
      // Build the match query
      const matchQuery = { isDeleted: false ,businessUnit: new mongoose.Types.ObjectId(businessUnitId)};
      if (asset) {
        matchQuery.asset = asset; // Adjust according to your actual field name
      }
  
      const aggregationPipeline = [
        { $match: matchQuery },
        {
          $facet: {
            totalMaintenancePlans: [{ $count: "count" }],
            scheduledMaintenancePlans: [
              { $match: { status: "scheduled" } },
              { $count: "count" },
            ],
            draftMaintenancePlans: [
              { $match: { status: "draft" } },
              { $count: "count" },
            ],
          },
        },
      ];
  
      const results = await mongoDbManager.aggregation(
        MaintenancePlan,
        aggregationPipeline
      );
  
      const getCount = (arr) => (arr.length > 0 ? arr[0].count : 0);
  
      returnObj.totalMaintenancePlans = getCount(results[0].totalMaintenancePlans);
      returnObj.scheduledMaintenancePlans = getCount(results[0].scheduledMaintenancePlans);
      returnObj.draftMaintenancePlans = getCount(results[0].draftMaintenancePlans);
  
      return returnObj;
    } catch (error) {
      throw error;
    }
  }
  
  function fetchConstants() {
    // const workOrderStatus = Object.values(workOrder.status);
    const planPriority = Object.values(maintenancePlan.priority);
    return {
    //   status: workOrderStatus,
      priority: planPriority,
    };
  }
  
  async function deleteMaintenance(maintenanceIdsToBeDeleted, userId) {
    try {
      // Reusable update function
      const updateDocuments = (collection, filterField) => {
        return mongoDbManager.updateMany(
          collection,
          { [filterField]: { $in: maintenanceIdsToBeDeleted } },
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
      const [maintenancePlanUpdated] = await Promise.all([
        updateDocuments(MaintenancePlan, '_id'),
        updateDocuments(Task, 'maintenancePlan'),
        updateDocuments(MaintenancePlanVersion, 'maintenanceId')
      ]);
  
      return maintenancePlanUpdated;
    } catch (error) {
      throw error;
    }
  }
  
  async function returnInvalidMaintenanceIds(ids) {
    try {
      let invalidMaintenanceIds = ids.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
  
      if (invalidMaintenanceIds.length > 0) {
        return { invalidMaintenanceIds };
      }
  
      const query = {
        _id: { $in: ids },
        isDeleted: false,
      };
  
      const existingMaintenances = await mongoDbManager.findManyWithPopulate(
        MaintenancePlan,
        query,
        null,
        null,
        null,
        ["_id", "name"],
        []
      );
  
      const existingMaintenanceIds = existingMaintenances.map((asset) => asset._id.toString());
  
      invalidMaintenanceIds.push(...ids.filter((id) => !existingMaintenanceIds.includes(id)));
      const inValidArray = Array.from(new Set(invalidMaintenanceIds));
      return { existingMaintenances, inValidArray };
    } catch (error) {
      throw error;
    }
  }
  
  async function editDocuments(maintenanceId,maintenanceDocuments,newDocumentIds){
    try{
  //     const currentDocumentIds = maintenanceDocuments || []; // Document IDs from the DB
  //     console.log("currentDocumentIds",currentDocumentIds)
  //     console.log("newDocumentIds",newDocumentIds)// Identify document IDs to add (those in newDocumentIds but not in currentDocumentIds)
  //     const documentIdsToAdd = currentDocumentIds.filter(docId => !newDocumentIds.includes(docId));
  // console.log("documentIdsToAdd",documentIdsToAdd)
  //     // Identify document IDs to remove (those in currentDocumentIds but not in newDocumentIds)
  //     const documentIdsToRemove = newDocumentIds.filter(docId => currentDocumentIds.includes(docId) );
  // console.log("documentIdsToRemove",documentIdsToRemove)
  //     // Perform the updates in separate operations
      
  //         if (documentIdsToRemove.length > 0) {
  //           console.log(123456)
  //           await mongoDbManager.updateOne(
  //             MaintenancePlan,
  //             { _id: maintenanceId },
  //             { $pull: { documents: { $in: documentIdsToRemove } } }     // Remove missing document IDs
  //           );
  //         }
  //     if (documentIdsToAdd.length > 0) {

  //         console.log(876543)
  //       await mongoDbManager.updateOne(
  //         MaintenancePlan,
  //         { _id: maintenanceId },
  //         { $addToSet: { documents: { $each: documentIdsToAdd } } }  // Add new document IDs
  //       );
  //     }

      await mongoDbManager.updateOne(
        MaintenancePlan,
        { _id: maintenanceId },
        { $set: { documents:  newDocumentIds  } }     // Remove missing document IDs
      );
  
    }catch(error){
      throw error;
    }
  }

  async function editTasks(reqData, maintenancePlanId, userId, businessUnitId){
    try{
        let editedTasks;
        if (reqData.tasksToBeEdited) {
          const tasksObjs = editTasksObject(reqData, userId);
          editedTasks = await taskLibraryManager.editTaskLibraryTasks(
            null,
            maintenancePlanId,
            tasksObjs
          );

        }
        if (reqData.tasksToBeAdded) {
            editedTasks = await createTasksForMaintenancePlan(reqData, maintenancePlanId, null, userId,businessUnitId)
        }
        if (reqData.tasksDeleted) {
            editedTasks = await taskLibraryManager.deleteTasks(
              reqData.tasksDeleted,
              maintenancePlanId,
              null,
              userId
            );
            await updateMaintenancePlanWhenTaskDeleted(maintenancePlanId,reqData.tasksDeleted)
        }
        const maintenanceUpdatedTasks = await MaintenancePlan.findOne({_id:maintenancePlanId}).populate("tasks")
        return maintenanceUpdatedTasks;
    }catch(error){
        throw error
    }
}
  
async function updateMaintenancePlanWhenTaskDeleted(id, taskIds) {
  try {
    const updateWithTaskId = await mongoDbManager.updateOne(
      MaintenancePlan,
      { _id: id, isDeleted: false },
      { $pull: { tasks: { $in: taskIds } } }
    );
    return updateWithTaskId;
  } catch (error) {
    throw error;
  }
}

  
  module.exports = {
    createMaintenancePlan,
    checkExistingMaintenancePlan,
    checkExistingMaintenancePlanVersion,
    editMaintenancePlan,
    getAllMaintenancePlans,
    updateExpiredStatus,
    getMaintenancePlan,
    countMaintenanceStatus,
    fetchConstants,
    updateMaintenanceWhenImagesAdded,
    getMaintenancePlanVersion,
    getImagesForMaintenancePlan,
    deleteMaintenance,
    returnInvalidMaintenanceIds,
    editDocuments,
    getVersions,
    createTasksForMaintenancePlan,
    editTasks,
    updateFilePathsForPlan,
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
        collection: "tasks",
        isArray: true,
        fieldsToInclude: ["description", "order", "id"], // Example fields to include
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
        ], // Example fields to include
      },
      images: {
        localField: "images",
        collection: "files",
        isArray : true,
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
      // documents: {
      //   localField: "documents",
      //   collection: "files",
      //   isArray: true,
      //   fieldsToInclude: [
      //     "_id",
      //     "name",
      //     "extension",
      //     "contentType",
      //     "size",
      //     "storageLocation",
      //     "moduleName",
      //     "moduleId",
      //   ], // Example fields to include
      // },
      // images: {
      //   localField: "images",
      //   collection: "files",
      //   isArray: true,
      //   fieldsToInclude: [
      //     "_id",
      //     "name",
      //     "extension",
      //     "contentType",
      //     "size",
      //     "storageLocation",
      //     "moduleName",
      //     "moduleId",
      //   ], // Example fields to include
      // },
      existingTeams: {
        localField: "existingTeams", // Reference the id within existingTeams
        collection: "teams",
        fieldsToInclude: ["name", "id"],
      },
    };
  }
  
  // Builds a MongoDB query object based on request parameters for filtering maintenance plans.
  
  //start
  
  //CR0002
  function queryBuilder(reqData, userId, maintenanceId, businessUnitId) {
    // ── Date range helpers ──────────────────────────────────────────────────────
    // MUI sends ISO strings; we match the entire calendar day in UTC.
    const buildDayRange = (isoString) => {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      const start = new Date(d);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setUTCHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    };

    const createdAtRange  = reqData.createdAt  ? buildDayRange(reqData.createdAt)  : null;
    const updatedAtRange  = reqData.updatedAt  ? buildDayRange(reqData.updatedAt)  : null;
    //End

    const query = {
      isDeleted: false,
      ...(businessUnitId && {
        "businessUnit": new mongoose.Types.ObjectId(businessUnitId)
      }),
      ...(reqData.name && {
        name: { $regex: reqData.name, $options: "i" },
      }),
      ...(reqData.number && {
        number: { $regex: reqData.number, $options: "i" },
      }),
      ...(maintenanceId && {
            "maintenanceId": new mongoose.Types.ObjectId(maintenanceId)
          }),
      //start
      //CR0002

      // FIX: was `reqData.department` (singular) — frontend sends `departments` (plural).
      // Also switched from raw ObjectId match to pre-resolved IDs (name search).
      ...(reqData.departmentIds?.length && {
        departments: { $in: reqData.departmentIds.map(id => new mongoose.Types.ObjectId(id)) },
      }),//End
      ...(reqData.asset && mongoose.Types.ObjectId.isValid(reqData.asset) &&  {
        asset: new mongoose.Types.ObjectId(reqData.asset),
          }),
      ...(reqData.status &&
            typeof reqData.status === "string" && {
              status: {
                $in: reqData.status.split(",").map((p) => new RegExp(`^${p.trim()}$`, "i")),
              },
            }),
      ...(reqData.priority && {
        priority: { $regex: reqData.priority, $options: "i" },
      }),
      //start
      //CR0002

      //FIX: Assignees filter was completely missing.
      // `assignees` stores ObjectIds; the frontend sends a name string.
      // getAllMaintenancePlans resolves names→IDs and passes them as `reqData.assigneeIds`.
      ...(reqData.assigneeIds?.length && {
        assignees: { $in: reqData.assigneeIds.map(id => new mongoose.Types.ObjectId(id)) },
      }),

      //FIX: existingTeams filter was completely missing.
      // `existingTeams` is stored as [{id: ObjectId, noOfMembersRequired}], NOT plain ObjectIds,
      // so we must query the nested `id` field.
      ...(reqData.teamIds?.length && {
        "existingTeams.id": { $in: reqData.teamIds.map(id => new mongoose.Types.ObjectId(id)) },
      }),

      //FIX: was `req.createdAt` / `req.updatedAt` — `req` does not exist in this scope.
      // Corrected to `reqData`, and now uses a proper day-range query instead of exact-timestamp match.
      ...(createdAtRange && { createdAt: createdAtRange }),
      ...(updatedAtRange && { updatedAt: updatedAtRange }), 
      //End
    };
    if (userId) {
      query["$or"] = [
        { createdBy: new mongoose.Types.ObjectId(userId) }, // Fetch all data created by the user
        { startAt: { $lte: new Date() } }, // Or data with startAt <= current date
        { status: { $nin: ["draft"] } },
      ];
    }
  
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
  

  function createTasksObject(reqData, maintenancePlanId, userId, businessUnit) {
    const tasks = reqData.tasks || reqData.tasksToBeAdded;
    if (!Array.isArray(tasks)) {
      return [];
    }
    const taskObjects = tasks.map((task) => ({
      description: task.description || task.name, 
      order: task.order,
      businessUnit: businessUnit,
      maintenancePlan: maintenancePlanId, 
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
    description: task.description || task.name, // Task description from req.body.tasks
    order: task.order,
    updatedBy: userId, // User who updated
    updatedAt: Date.now(), // User who created
  }));

  // Return the array of task objects
  return taskObjects;
}