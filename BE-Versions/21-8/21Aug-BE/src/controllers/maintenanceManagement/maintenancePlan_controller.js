const maintenancePlanManager = require("../../managers/internalManagers/maintenanceManagement/maintenancePlan_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const taskLibraryManager = require("../../managers/internalManagers/maintenanceManagement/taskLibrary_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const workOrderTaskManager = require("../../managers/internalManagers/maintenanceManagement/workOrderTask_manager");

exports.createMaintenancePlan = async (req, res) => {
  try {
    const planObj = createMaintenancePlanObject(req);
    const createdPlan = await maintenancePlanManager.createMaintenancePlan(
        planObj, req.userId, req.protocol, req.get("host")
    );
    if (!createdPlan) {
      return apiResponseHandler.errorResponse(
        error,
        req,
        res,
        "Some internal server error",
        500
      );
    }
    if(req.body.documents){
      await maintenancePlanManager.updateFilePathsForPlan(createdPlan.createdMaintenancePlan,  createdPlan.createdMaintenancePlan._id, req.userId,"documents");
    }
    if(req.body.images){
      await maintenancePlanManager.updateFilePathsForPlan(createdPlan.createdMaintenancePlan,  createdPlan.createdMaintenancePlan._id, req.userId,"images");
    }
    if (req.body.tasks) {
      const createdTask = await maintenancePlanManager.createTasksForMaintenancePlan(
        req.body,
        createdPlan.createdMaintenancePlan._id,
        createdPlan.createdMaintenancePlanVersion._id,
        req.userId,
        req.businessUnit
      );
    }
    const responseObject = { id: createdPlan.createdMaintenancePlan._id };
    const message = "MaintenancePlan created successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      201,
      responseObject
    );
  } catch (error) {
    console.log("Error creating MaintenancePlan:", error);
    if ((error.name = "ValidationError")) {
      return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              "Validation Failed",
              400,
              {
        "validation Error": "Check all entries are correct",
      }
            );
      // return apiResponseHandler.errorResponse(res, "Validation Failed", 400, {
      //   "validation Error": "Check all entries are correct",
      // });
    }
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.addImage = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const { name } = req.body;
    const createdFile = await fileManager.uploadFile(
      req.file,
      name,
      "maintenancePlans",
      req.maintenancePlan,
      req.userId
    );
    let responseObj;
    if (returnMetaData && returnMetaData != "false") {
      responseObj = await fileManager.transformFileObj(createdFile);
    } else {
      responseObj = { id: createdFile._id };
    }
    if (
      createdFile.extension === "jpg" ||
      createdFile.extension === "jpeg" ||
      createdFile.extension === "png"
    ) {
      const transformFile = await fileManager.transformFileObj(
        createdFile,
        "download",
        req.get("host"),
        req.protocol
      );
      responseObj.url = transformFile.url;
    }
    await maintenancePlanManager.updateMaintenanceWhenImagesAdded(
      req.maintenancePlan,
      responseObj.id
    );

    return apiResponseHandler.successResponse(
      res,
      "Images uploaded successfully",
      201,
      responseObj
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.addImages = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const result = { data: [] };

    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          null,
          "maintenancePlans",
          req.maintenancePlan,
          req.userId
        );
        let responseObj;

        if (returnMetaData && returnMetaData != "false") {
          responseObj = await fileManager.transformFileObj(createdFile);
        } else {
          responseObj = { id: createdFile._id };
        }

        if (
          createdFile.extension === "jpg" ||
          createdFile.extension === "jpeg" ||
          createdFile.extension === "png"
        ) {
          const transformFile = await fileManager.transformFileObj(
            createdFile,
            "download",
            req.get("host"),
            req.protocol
          );
          responseObj.url = transformFile.url;
        }

        result.data.push(responseObj);
      } catch (error) {
        result.failures = [];
        // Handle individual file upload errors
        const fileNameWithoutExtension = req.files[i].originalname
          .split(".")
          .slice(0, -1)
          .join(".");
        result.failures.push({
          name: fileNameWithoutExtension,
          extension: req.files[i].originalname.split(".").pop(),
          arrayPosition: i,
        });
      }
    }
    const imageIds = result.data.map((image) => image.id);
    await maintenancePlanManager.updateMaintenanceWhenImagesAdded(
      req.maintenancePlan,
      imageIds
    );

    if (result.failures?.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Images uploaded partially",
        207,
        result
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Images uploaded successfully",
      201,
      result
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.getImages = async (req, res) => {
  try{
    const reqQuery = req.query
    const getImages = await maintenancePlanManager.getImagesForMaintenancePlan(
      req.maintenancePlan,
      reqQuery,
      req.get("host"),
      req.protocol
    );
    if (getImages.images && getImages.images.length > 0) {
      const fileDocuments = [];
      for (let document of getImages.images) {
        const images = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(images);
      }
      getImages.images = fileDocuments;
    }
    return apiResponseHandler.successResponse(res, "Images for maintenancePlan fetched successfully", 200, getImages);
  }catch(error){
    console.log("error",error)
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internel server error",
      500,
      null
    );
  }
};

exports.getVersionByMaintenanceId = async (req, res) => {
  try {
    const getVersions = await maintenancePlanManager.getVersions(req.query, req.maintenancePlan, req.businessUnit);
    const message = "Maintenance Versions fetch Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getVersions);
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.editMaintenancePlan = async (req, res) => {
  try {
    const maintenanceToBeUpdated = editMaintenanceObject(req);
    const createdMaintenaceVersion = await maintenancePlanManager.editMaintenancePlan(
      maintenanceToBeUpdated,
      req.maintenancePlan,
      req.userId, req.protocol, req.get("host"),req.body
    );
  
    if (req.body.tasksToBeEdited || req.body.tasksToBeAdded || req.body.tasksDeleted) {
      const editedVersionObj = await maintenancePlanManager.editTasks(req.body, req.maintenancePlan, req.userId, req.businessUnit);
    await maintenancePlanManager.createTasksForMaintenancePlan(editedVersionObj,null,createdMaintenaceVersion._id, req.userId, req.businessUnit)
    }
    else{
      await maintenancePlanManager.createTasksForMaintenancePlan(req.maintenancePlanObj,null,createdMaintenaceVersion._id, req.userId, req.businessUnit)
    }
    return apiResponseHandler.successResponse(
      res,
      "MaintenancePlan Edited Successfully",
      200,
      null
    );
  } catch (error) {
    console.log("Error Editing MaintenancePlan:", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Internal server error",
      500,
      null
    );
  }
};

exports.fetchMaintenancePlans = async (req, res) => {
  try {
    const reqData = req.query;
    await maintenancePlanManager.updateExpiredStatus();
    const getMaintenancePlans = await maintenancePlanManager.getAllMaintenancePlans(
      reqData,
      req.userId,
      req.businessUnit
    );
    const message = "MaintenancePlans Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getMaintenancePlans);
  } catch (error) {
    console.log("error", error);
    console.log("Some error happened while fetching maintenancePlan", error.message);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.fetchMaintenancePlan = async (req, res) => {
  try {
    const reqQuery = req.query;
    const maintenancePlanId = req.maintenancePlanObj.id;
    const getmaintenancePlan = await maintenancePlanManager.getMaintenancePlan(
      maintenancePlanId,
      reqQuery,
      req.businessUnit
    );
    if (!getmaintenancePlan) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "maintenancePlan not found",
        404,
        null
      );
    }
    if (getmaintenancePlan.documents && getmaintenancePlan.documents.length > 0) {
      const fileDocuments = [];
      for (let document of getmaintenancePlan.documents) {
        const documents = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(documents);
      }
      getmaintenancePlan.documents = fileDocuments;
    }
    if (getmaintenancePlan.images && getmaintenancePlan.images.length > 0) {
      const fileDocuments = [];
      for (let document of getmaintenancePlan.images) {
        const images = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(images);
      }
      getmaintenancePlan.images = fileDocuments;
    }
    const message = "maintenancePlan Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getmaintenancePlan);
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.getMaintenancePlanVersion = async (req, res) => {
  try {
    const reqQuery = req.query;
    const versionId = req.params.version;
    const getmaintenancePlan = await maintenancePlanManager.getMaintenancePlanVersion(
      versionId,
      reqQuery,
      req.businessUnit
    );
    if (!getmaintenancePlan) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "maintenancePlan Version not found",
        404,
        null
      );
    }
    if (getmaintenancePlan.documents && getmaintenancePlan.documents.length > 0) {
      const fileDocuments = [];
      for (let document of getmaintenancePlan.documents) {
        const documents = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(documents);
      }
      getmaintenancePlan.documents = fileDocuments;
    }
    if (getmaintenancePlan.images && getmaintenancePlan.images.length > 0) {
      const fileDocuments = [];
      for (let document of getmaintenancePlan.images) {
        const images = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(images);
      }
      getmaintenancePlan.images = fileDocuments;
    }
    const message = "maintenancePlan Version Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getmaintenancePlan);
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.maintenanceCount = async (req, res) => {
  try {
    const counts = await maintenancePlanManager.countMaintenanceStatus(req.query, req.businessUnit);
    const message = "MaintenancePlan Status count fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, counts);
  } catch (error) {
    console.log("Error while fetching maintenancePlan count", error.message);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

exports.workOrderConstants = async (req, res) => {
  try {
    const constants = maintenancePlanManager.fetchConstants();
    let message = "MaintenancePlan Constants Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, constants);
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

exports.deleteMaintenancePlan = async (req, res) => {
  try{
    const maintenancePlans = req.body.maintenancePlans
    const deleteWo = await maintenancePlanManager.deleteMaintenance(maintenancePlans, req.userId)
    return apiResponseHandler.successResponse(res, "maintenancePlans Deleted Successfully", 200, null);
  }catch(error){
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const createMaintenancePlanObject = (req) => {
  const isDraft = req.query.isDraft === "true";
  return {
    name: req.body.name,
    description: req.body.description,
    asset: isDraft ? req.body.asset : req.asset,
    departments: req.body.departments,
    priority: isDraft ? req.body.priority : req.priority,
    startAt: isDraft ? req.body.startAt : req.startAt,
    endAt: isDraft ? req.body.endAt : req.endAt,
    estimatedDays: req.body.estimatedDays,
    estimatedHours: req.body.estimatedHours,
    documents: req.body.documents,
    images: req.body.images,
    assignees: req.body.assignees,
    existingTeams: req.body.existingTeams,
    localTeams: req.body.localTeams,
    addToAssetHistory: req.body.addToAssetHistory || false,
    status: isDraft ? "draft" : req.status || req.body.status || "scheduled",
    isRecurrence: req.body.isRecurrence,
    recurrenceDetails: req.body.recurrenceDetails,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
  };
};

const editMaintenanceObject = (req) => {
  const isDraft = req.maintenancePlanObj.status === "draft";
  return {
    name: isDraft ? req.body.name : req.maintenancePlanObj.name,
    number: req.maintenancePlanObj.number,
    description: req.body.description ?? req.maintenancePlanObj.description,
    asset: isDraft ? req.body.asset : req.maintenancePlanObj.asset,
    departments: isDraft ? req.body.departments : req.maintenancePlanObj.departments,
    priority: isDraft
      ? req.body.priority
      : req.priority || req.maintenancePlanObj.priority,
    startAt: isDraft
      ? req.body.startAt
      : req.startAt || req.maintenancePlanObj.startAt,
    endAt: isDraft ? req.body.endAt : req.endAt || req.maintenancePlanObj.endAt,
    estimatedDays: req.body.estimatedDays ?? req.maintenancePlanObj.estimatedDays,
    estimatedHours: req.body.estimatedHours ?? req.maintenancePlanObj.estimatedHours,
    documents: req.body.documents ?? req.maintenancePlanObj.documents,
    images: req.body.images ?? req.maintenancePlanObj.images,
    assignees: req.body.assignees ?? req.maintenancePlanObj.assignees,
    existingTeams: req.body.existingTeams ?? req.maintenancePlanObj.existingTeams,
    localTeams: req.body.localTeams ?? req.maintenancePlanObj.localTeams,
    status: isDraft ? req.body.status : req.maintenancePlanObj.status,
    isRecurrence: req.maintenancePlanObj.isRecurrence,
    recurrenceDetails:req.maintenancePlanObj.recurrenceDetails,
    businessUnit: req.maintenancePlanObj.businessUnit,
    createdBy:req.maintenancePlanObj.createdBy,
    updatedBy: req.userId,
    updatedAt: Date.now(),
  };
};



