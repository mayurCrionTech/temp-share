const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const workOrderTaskController = require("../../controllers/maintenanceManagement/workOrderTask_controller");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const assetHistory_manager = require("../../managers/internalManagers/assetManagement/assetHistory_manager");
const DataHandler = require("../../managers/common/DataObjectConstructor_manager");

exports.createWorkOrder = async (req, res) => {
  try {
    const workOrderObj = createWorkOrderObject(req);
    if (workOrderObj.addToAssetHistory){
      const objectToBeCreated = DataHandler.constructHistory("WorkOrderCreated",  workOrderObj.name, workOrderObj.asset, workOrderObj.startAt, "planned", null, "workOrders", req.businessUnit);
      await assetHistory_manager.createAssetHistoryManager([objectToBeCreated])
    }
    const createdWorkOrder = await workOrderManager.createWorkOrder(
      workOrderObj, req.userId
    );
    if (req.body.tasks) {
      const createdTask = await workOrderTaskController.createWorkOrderTasks(
        req,
        createdWorkOrder._id
      );
    }
    if (!createdWorkOrder) {
      return apiResponseHandler.errorResponse(
        error,
        req,
        res,
        "Some internal server error",
        500
      );
    }
    const responseObject = { id: createdWorkOrder._id };
    const message = "WorkOrder created successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      201,
      responseObject
    );
  } catch (error) {
    console.log("Error creating workOrder:", error);
    if ((error.name = "ValidationError")) {
      return apiResponseHandler.errorResponse(res, "Validation Failed", 400, {
        "validation Error": "Check all entries are correct",
      });
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
      "workorders",
      req.workOrder,
      req.userId,
      req.businessUnit
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
    await workOrderManager.updateWorkOrderWhenImagesAdded(
      req.workOrder,
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
          "workorders",
          req.workOrder,
          req.userId,
          req.businessUnit
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
    await workOrderManager.updateWorkOrderWhenImagesAdded(
      req.workOrder,
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
    const getWorkOrderImages = await workOrderManager.getImagesForWorkOrder(
      req.workOrder,
      reqQuery,
      req.get("host"),
      req.protocol,
      req.businessUnit,
    );
    if (getWorkOrderImages.images && getWorkOrderImages.images.length > 0) {
      const fileDocuments = [];
      for (let document of getWorkOrderImages.images) {
        const images = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(images);
      }
      getWorkOrderImages.images = fileDocuments;
    }
    return apiResponseHandler.successResponse(res, "Images for workorder fetched successfully", 200, getWorkOrderImages);
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

exports.copyWorkOrder = async (req, res) => {
  try{
    const workOrderId = req.workOrder;
    const reqQuery = req.query;
    const getWorkOrder = await workOrderManager.getCopyWorkOrderDetails(
      workOrderId,
      reqQuery,
      req.businessUnit
    );
    if (getWorkOrder.documents && getWorkOrder.documents.length > 0) {
  const createdDocs = [];
  const copiedDocs = await fileManager.copyToLocation(
    getWorkOrder.documents,
    req.userId,
    "uploads"
  );
  // console.log("copiedDocs", copiedDocs)
  for (let doc of copiedDocs) {
    const transformed = await fileManager.transformFileObj(
      doc,
      "view",
      req.get("host"),
      req.protocol
    );
    createdDocs.push(transformed);
  }

  getWorkOrder.documents = createdDocs; // ✅ assign only docs
}
    // console.log("Initial getWorkOrder.images,", getWorkOrder.images)

if (getWorkOrder.images && getWorkOrder.images.length > 0) {
  const createdImgs = [];
  const copiedImgs = await fileManager.copyToLocation(
    getWorkOrder.images,
    req.userId,
    "uploads"
  );

  // console.log("copiedImgs", copiedImgs)
  for (let img of copiedImgs) {
    const transformed = await fileManager.transformFileObj(
      img,
      "view",
      req.get("host"),
      req.protocol
    );
    createdImgs.push(transformed);
  }

  getWorkOrder.images = createdImgs; // ✅ assign only images
}

    // console.log("endImages", getWorkOrder.images, "endDocuments", 
      // getWorkOrder.documents)
    return apiResponseHandler.successResponse(res, "WorkOrder Copied successfully", 200, getWorkOrder);

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
}

exports.getSpareByWorkOrder = async (req, res) => {
  try {
    const getSpares = await workOrderManager.getSpareOfWorkOrder(req.workOrder, req.businessUnit);
    const message = "Spares fetch Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getSpares);
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

exports.editWorkOrder = async (req, res) => {
  try {
    const workOrderToBeUpdated = editWorkOrderObject(req);
    const editedWorkOrder = await workOrderManager.editWorkOrder(
      workOrderToBeUpdated,
      req.workOrder
    );
    if (workOrderToBeUpdated.documents && workOrderToBeUpdated.documents.length > 0 ) {
      await fileManager.updateFilePaths(
        null,
        workOrderToBeUpdated.documents,
        "workorders",
        req.workOrder,
        req.userId
      );
    }
    if (workOrderToBeUpdated.images && workOrderToBeUpdated.images.length > 0 ) {
      await fileManager.updateFilePaths(
        null,
        workOrderToBeUpdated.images,
        "workorders",
        req.workOrder,
        req.userId
      );
    }
    if (req.body.tasksToBeEdited || req.body.tasksToBeAdded || req.body.tasksDeleted) {
      const editedTask = await workOrderTaskController.editTasks(req);
    }
    return apiResponseHandler.successResponse(
      res,
      "WorkOrder Edited Successfully",
      200,
      null
    );
  } catch (error) {
    console.log("Error Editing workOrder:", error);
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

exports.fetchWorkOrders = async (req, res) => {
  try {
    const reqData = req.query;
    await workOrderManager.updateExpiredStatus();
    const getWorkOrder = await workOrderManager.getAllWorkOrders(
      reqData,
      req.userId,
      req.businessUnit
    );
    const message = "WorkOrders Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getWorkOrder);
  } catch (error) {
    console.log("Some error happened while fetching Workorders", error.message);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.fetchWorkOrder = async (req, res) => {
  try {
    const reqQuery = req.query;
    const workOrderId = req.workOrderObj._id;
    const getWorkOrder = await workOrderManager.getWorkOrder(
      workOrderId,
      reqQuery,
      req.get("host"),
      req.protocol,
      req.businessUnit,
    );
    if (!getWorkOrder) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Workorder not found",
        404,
        null
      );
    }
    if (getWorkOrder.documents && getWorkOrder.documents.length > 0) {
      const fileDocuments = [];
      for (let document of getWorkOrder.documents) {
        const documents = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(documents);
      }
      getWorkOrder.documents = fileDocuments;
    }
    if (getWorkOrder.images && getWorkOrder.images.length > 0) {
      const fileDocuments = [];
      for (let document of getWorkOrder.images) {
        const images = await fileManager.transformFileObj(
          document,
          "download",
          req.get("host"),
          req.protocol
        );
        fileDocuments.push(images);
      }
      getWorkOrder.images = fileDocuments;
    }
    const message = "WorkOrder Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getWorkOrder);
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

exports.acceptWorkOrder = async (req, res) => {
  try {
    const acceptedWorkOrder = await workOrderManager.acceptWorkOrder(
      req.workOrder, req.userId
    );
    message = "Workorder Accepted Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.holdWorkOrder = async (req, res) => {
  try {
    const WorkOrder = await workOrderManager.holdWorkOrder(req.workOrder, req.userId, req.workOrderObj);
    message = "Workorder Put OnHold Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.completeWorkOrder = async (req, res) => {
  try {
    const WorkOrder = await workOrderManager.completeWorkOrder(req.workOrder, req.userId);
    message = "Workorder Completed Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.workOrderCount = async (req, res) => {
  try {
    const counts = await workOrderManager.countWorkOrderStatus(req.query, req.businessUnit, req.userId);
    const message = "WorkOrder Status count fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, counts);
  } catch (error) {
    console.log("Error while fetching workorder count", error.message);
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
    const woConstants = workOrderManager.fetchConstants();
    let message = "WorkOrder Constants Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, woConstants);
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

exports.deleteWorkOrder = async (req, res) => {
  try{
    const workOrders = req.body.workOrders
    const deleteWo = await workOrderManager.deleteWorkOrder(workOrders, req.userId)
    return apiResponseHandler.successResponse(res, "Workorder Deleted Successfully", 200, null);
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

const createWorkOrderObject = (req) => {
  const isDraft = req.query.isDraft === "true";
  return {
    name: req.body.name,
    description: req.body.description,
    asset: isDraft ? req.body.asset : req.asset,
    departments: req.body.departments,
    priority: isDraft ? req.body.priority : req.priority,
    // CR0001
    // priorityId: req.body.priorityId,
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
    isWorkPermitRequired: req.body.isWorkPermitRequired || false,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
  };
};

const editWorkOrderObject = (req) => {
  const isDraft = req.workOrderObj.status === "draft";
  return {
    name: isDraft ? req.body.name : req.workOrderObj.name,
    description: req.body.description ?? req.workOrderObj.description,
    asset: isDraft ? req.body.asset : req.workOrderObj.asset,
    departments: isDraft ? req.body.departments : req.workOrderObj.departments,
    priority: isDraft
      ? req.body.priority
      : req.priority || req.workOrderObj.priority,
    // CR0001
    // priorityId: req.body.priorityId,
    startAt: isDraft
      ? req.body.startAt
      : req.startAt || req.workOrderObj.startAt,
    endAt: isDraft ? req.body.endAt : req.endAt || req.workOrderObj.endAt,
    estimatedDays: req.body.estimatedDays ?? req.workOrderObj.estimatedDays,
    estimatedHours: req.body.estimatedHours ?? req.workOrderObj.estimatedHours,
    documents: req.body.documents ?? req.workOrderObj.documents,
    assignees: req.body.assignees ?? req.workOrderObj.assignees,
    existingTeams: req.body.existingTeams ?? req.workOrderObj.existingTeams,
    localTeams: req.body.localTeams ?? req.workOrderObj.localTeams,
    status: isDraft ? req.body.status : req.status || req.workOrderObj.status,
    isWorkPermitRequired:
      req.body.isWorkPermitRequired ?? req.workOrderObj.isWorkPermitRequired,
      images: req.body.images ?? req.workOrderObj.images,
    updatedBy: req.userId,
    updatedAt: Date.now(),
  };
};
