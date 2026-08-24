const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const workOrderTaskManager = require("../../managers/internalManagers/maintenanceManagement/workOrderTask_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");

async function createWorkOrderTasks(req, workOrderId) {
  try {
    if (req.body.tasks) {
      const workOrderTasksObj = createWorkOrderTasksObject(req, workOrderId);
      const createdWorkOrderTasks =
        await workOrderTaskManager.createWorkOrderTasksManager(
          workOrderTasksObj,
          workOrderId
        );
      return createdWorkOrderTasks;
    } else {
      return {};
    }
  } catch (error) {
    console.log(err);
    throw error;
  }
}

const addImages = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const result = { data: [] };
    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          null,
          "workorderTasks",
          req.task,
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
    await workOrderTaskManager.updateWorkOrderTasksWhenImagesAdded(
      req.task,
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
    console.log("error", error)
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

const updateTaskStatus = async (req, res) => {
  try {
    const taskObject = {
      isCompleted: true,
      images: req.body.images
    }
    const updateStatus = await workOrderTaskManager.updateStatus(req.task, taskObject);
    if(taskObject.images && taskObject.images.length > 0){
      await fileManager.updateFilePaths(
        null,
        taskObject.images,
        "workorderTasks",
        req.task,
        req.userId
      );
    }
    message = "Workorder TaskStatus Changed Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
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

async function editTasks(req) {
  try {
    let editedWorkOrderTasks;
    if (req.body.tasksToBeEdited) {
      const workOrderTasksObj = editWorkOrderTasksObject(req);
      editedWorkOrderTasks = await workOrderTaskManager.editWorkOrderTasks(
        req.workOrder,
        workOrderTasksObj
      );
    }
    if (req.body.tasksToBeAdded) {
      const workOrderTasksObj = createWorkOrderTasksObject(req, req.workOrder);
      editedWorkOrderTasks =
        await workOrderTaskManager.createWorkOrderTasksManager(
          workOrderTasksObj,
          req.workOrder
        );
    }
    if (req.body.tasksDeleted) {
      editedWorkOrderTasks = await workOrderTaskManager.deleteTasks(
        req.workOrder,
        req.body.tasksDeleted,
        req.userId
      );
    }
    return editedWorkOrderTasks;
  } catch (error) {
    throw error;
  }
}

function createWorkOrderTasksObject(req, workOrderId) {
  const tasks = req.body.tasks || req.body.tasksToBeAdded;
  if (!Array.isArray(tasks)) {
    return [];
  }
  const taskObjects = tasks.map((task) => ({
    description: task.description, // Task description from req.body.tasks
    order: task.order,
    businessUnit: req.businessUnit,
    workOrderId: workOrderId, // The work order ID
    updatedBy: req.userId, // User who updated
    createdBy: req.userId, // User who created
  }));
  // Return the array of task objects
  return taskObjects;
}

function editWorkOrderTasksObject(req) {
  const  tasks  = req.body.tasksToBeEdited;
  if (!Array.isArray(tasks)) {
    return [];
  }
  const taskObjects = tasks.map((task) => ({
    id: task.id,
    description: task.description, // Task description from req.body.tasks
    order: task.order,
    updatedBy: req.userId, // User who updated
    updatedAt: Date.now(), // User who created
  }));

  // Return the array of task objects
  return taskObjects;
}

const getTaskDetails = async (req, res) => {
  try{
    const taskDetails = await workOrderTaskManager.fetchTaskDetails(req.task, req.query, req.get("host"),req.protocol);
    return apiResponseHandler.successResponse(
          res,
          "Tasks Fetched Successfully",
          200,
          taskDetails
        );
  }catch(error){
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
}

module.exports = {
  createWorkOrderTasks,
  updateTaskStatus,
  editTasks,
  getTaskDetails,
  addImages,
};
