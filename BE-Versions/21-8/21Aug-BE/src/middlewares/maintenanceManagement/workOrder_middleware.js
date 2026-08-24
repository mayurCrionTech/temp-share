/*
date              cr/qid      comments
21-march-2026     CR0001      Updated for Dropdowns api - static option check replaced with dynamic
17-apr-2026       CR0013           IDOR - Issue
*/

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const {
  workOrder,
  workOrders: WorkOrder //CR0013
} = require("../../models/mongoDB/maintenanceManagement/workOrder_model");
const workOrderController = require("../../controllers/maintenanceManagement/workOrder_controller");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager");
const mongoose = require("mongoose");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const dueDateManager = require("../../managers/internalManagers/maintenanceManagement/workOrderDueDateRequest_manager")
const teamManager = require("../../managers/internalManagers/userManagement/team_manager");
const workOrderTaskManager = require("../../managers/internalManagers/maintenanceManagement/workOrderTask_manager");
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager")
const { mongoDbManager } = require("../../managers/dBManagers");

// This middleware validates and creates a new work order based on  request data.
const createWorkOrder = async (req, res, next) => {
  try {
    const status = req.body.status && req.body.status.toLowerCase();
    // Check if 'status' is 'draft'
    if (req.query.isDraft == "true") {
      // Create work order without further validations
      return await workOrderController.createWorkOrder(req, res);
      // Terminate the middleware without passing to the next middleware
    }
    const requiredFields = [
      "name",
      "departments",
      "priority",
      "asset",
      "startAt",
      "endAt",
      "estimatedDays",
      "estimatedHours",
      "assignees",
      // "existingTeams",
      // "localTeams",
    ];
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null
    );
    if (missingFields.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        `The following fields are required: ${missingFields.join(", ")}`,
        400,
        null
      );
    }

    // If 'status' is 'draft' and there are no missing fields, proceed to the next middleware/handler
    return next();
  } catch (error) {
    throw error;
  }
};

const verifyPriority = async (req, res, next) => {
  if (req.body.priority) {
    req.priority = req.body.priority;
    const workOrderPriority = workOrder;
    const priority = Object.values(workOrderPriority.priority);
    if (priority.includes(req.priority)) {
      return next();
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        `Please provide valid Priority`,
        400,
        null
      );
    }
  }
  return next();
};
// CR0001
// const verifyPriority = async (req, res, next) => {
//   if (req.body.priority) {
//     req.priority = req.body.priority;

//     // Only validate priorityId format if provided
//     if (req.body.priorityId && !mongoose.Types.ObjectId.isValid(req.body.priorityId)) {
//       return apiResponseHandler.errorResponse(
//         null, req, res, `Please provide a valid priorityId`, 400, null
//       );
//     }
//   }
//   return next();
// };

const verifyStatus = async (req, res, next) => {
  if (req.body.status) {
    req.status = req.body.status;
    const workOrderStatus = workOrder;
    const status = Object.values(workOrderStatus.status);
    if (status.includes(req.status)) {
      return next();
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        `Please provide valid Status`,
        400,
        null
      );
    }
  }
  return next();
};

const validateEditStartDate = async (req, res, next) => {
  try {
    // Define the query to check if the work order exists with the specified conditions
    const query = {
      _id: req.workOrder, // Check for the specific workOrderId
      startAt: { $lte: new Date() },
      status: { $nin: ["draft"] },
      isDeleted: false,
    };

    // Check if the matching work order exists in the database
    const existingWorkOrder = await workOrderManager.checkExistingWorkOrder(query);

    // If a matching work order is found
    if (existingWorkOrder && req.body.startAt) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Cannot update startAt as there is an existing work order matching the criteria.",
        400,
        null
      );
    }

    // If no matching work order is found, proceed to the next middleware
    return next();
  } catch (error) {
    // Handle any errors that occur
    throw error;
  }
};

const verifyEstimatedDaysAndHours = async (req, res, next) => {
  if (req.body.estimatedDays || req.body.estimatedHours) {
    const estimatedDays =
    req.body.estimatedDays ?? req.workOrderObj.estimatedDays;
    const estimatedHours =
    req.body.estimatedHours ?? req.workOrderObj.estimatedHours;
    let differenceInMilliSeconds;
    let startAt = req.startAt || req.workOrderObj.startAt
    let endAt = req.endAt || req.workOrderObj.endAt
    if (startAt && endAt) {
      differenceInMilliSeconds = endAt - startAt;
    }
    const convertedToHours = differenceInMilliSeconds / (1000 * 60 * 60); //converting the milliseconds to hours to validate the estimatedHours
    const convertDaysToHours = estimatedDays * 24 + estimatedHours; //converting estimated Days into hours and adding with the estimated Hours.
    if (convertDaysToHours > convertedToHours) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Please provide valid Estimation Days and Estimation Hours",
        400,
        null
      );
    }
    return next();
  }
  return next();
};

const verifyStartDateAndEndDateTime = async (req, res, next) => {
  try {
    if (
      req.body.startAt ||
      req.body.endAt 
    ) {
      const startAt = req.body.startAt
        ? new Date(req.body.startAt)
        : req.workOrderObj.startAt
        ? req.workOrderObj.startAt
        : null;
      req.startAt = startAt;
      const endAt = req.body.endAt
        ? new Date(req.body.endAt)
        : req.workOrderObj.endAt
        ? req.workOrderObj.endAt
        : null;
      req.endAt = endAt;
      const now = new Date();
      
      if (isNaN(req.startAt) || isNaN(req.endAt)) {
        const errorMessage = isNaN(req.startAt)
        ? "Invalid date format provided for startDate."
        : "Invalid date format provided for EndDate";
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          errorMessage,
          400,
          null
        );
      }
      if (!req.startAt || !req.endAt) {
        const errorMessage = !req.startAt
          ? "Please enter the StartDate"
          : "Please enter the EndDate";
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          errorMessage,
          400,
          null
        );
      }
      let reqStartAtWithoutSeconds;
      if(req.body.startAt){
     reqStartAtWithoutSeconds = new Date(Date.UTC(req.startAt.getUTCFullYear(), req.startAt.getUTCMonth(), req.startAt.getUTCDate(), req.startAt.getUTCHours(), req.startAt.getUTCMinutes()));
      }else{
        reqStartAtWithoutSeconds = null
      }
      console.log("reqStartAtWithoutSeconds",reqStartAtWithoutSeconds)
      const nowDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));      

      if (reqStartAtWithoutSeconds){
        if (reqStartAtWithoutSeconds < nowDate) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "The Start Date and time must be after the Current Time",
            400,
            null
          );
        }
      }
      if (req.startAt >= req.endAt) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "The end date and time must be after the start date and time",
          400,
          null
        );
      }
      return next(); // Proceed to the next middleware/handler
    }
    return next();
  } catch (error) {
    throw error;
  }
};

const verifyDuplicates = async (req, res, next) => {
  try {
    if(req.query.isDraft !== "true"){
      const existingWorkOrder = await workOrderManager.checkExistingWorkOrder({
        name: req.body.name,
        status: { $ne: "draft" },
        isDeleted: false,
      });
      if (existingWorkOrder) {
        const error = new Error(`Duplicate Workorder Name : ${req.body.name}`);
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Client Side Error",
          400,
          `Duplicate Workorder Name : ${req.body.name}`
        );
      } else {
        return next();
      }
    }else{
      next();
    }
  } catch (error) {
    next(error);
  }
};

const validateWorkOrder = async (req, res, next) => {
  try {
    const fetchByField = req.query.fetchByField;
    let existingWorkOrder;
    if (req.params.workOrder || req.body.workOrder) {
      if (req.params.workOrder && typeof req.params.workOrder === "string") {
        req.workOrder = req.params.workOrder;
      } else if (req.body.workOrder && typeof req.body.workOrder === "string") {
        req.workOrder = req.body.workOrder;
      }
      // If Workorder is not in req.params or req.body, return an error response
      else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "WorkOrder id must be a non-empty string in req.params or req.body",
          400,
          null
        );
      }
      if (fetchByField) {   
        if (fetchByField == "name") {
          // Check if the user with the given ID exists
          existingWorkOrder =
            await workOrderManager.checkExistingWorkOrder({
              name: req.workOrder,
              isDeleted: false,
            }  
            );
        }
      }
      else{
        if(!mongoose.Types.ObjectId.isValid(req.workOrder)){
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Failed! Invalid WorkOrder Id",
            400,
            null
          );
        }
        existingWorkOrder = await workOrderManager.checkExistingWorkOrder({
          _id: req.workOrder,
          isDeleted: false,
        });
      }
      if (existingWorkOrder) {
        req.workOrderObj = existingWorkOrder;
        next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! WorkOrder does not exist",
          404,
          null
        );
      }
    } else {
      next();
    }
  } catch (error) {
    throw error;
  }
};
//CR0013
const checkWorkOrderDepartmentAccess = async (req, res, next) => {
  try {
    const userDepartment = req.department;

    // ─── Bulk (delete) ────────────────────────────────────────────────
    if (req.body?.workOrders) {
      const workOrderIds = req.body.workOrders;

      if (!Array.isArray(workOrderIds) || workOrderIds.length === 0) {
        return apiResponseHandler.errorResponse(null, req, res, "No work orders provided", 400);
      }

      const workOrders = await WorkOrder.find(
        { _id: { $in: workOrderIds } },
        { departments: 1 }
      );

      if (workOrders.length !== workOrderIds.length) {
        return apiResponseHandler.errorResponse(null, req, res, "One or more work orders not found", 404);
      }

      const unauthorizedOrders = [];

      for (const workOrder of workOrders) {
        if (!workOrder.departments || workOrder.departments.length === 0) {
          return apiResponseHandler.errorResponse(null, req, res, `WorkOrder ${workOrder._id} has no department assigned`, 400);
        }

        const hasAccess = workOrder.departments.some(
          (dept) => dept.toString() === userDepartment
        );

        if (!hasAccess) unauthorizedOrders.push(workOrder._id);
        console.log("un",unauthorizedOrders)
      }

      if (unauthorizedOrders.length > 0) {
        return apiResponseHandler.errorResponse(
          null, req, res,
          `Forbidden! You do not have access to work orders: ${unauthorizedOrders.join(", ")}`,
          403
        );
      }

      return next();
    }

    // ─── Single (edit, hold, accept) ──────────────────────────────────
    const workOrderDepartments = req.workOrderObj.departments;

    console.log("uuuuu", userDepartment, workOrderDepartments);

    if (!workOrderDepartments || workOrderDepartments.length === 0) {
      return apiResponseHandler.errorResponse(null, req, res, "WorkOrder has no department assigned", 400);
    }

    const hasAccess = workOrderDepartments.some(
      (dept) => dept.toString() === userDepartment
    );

    if (!hasAccess) {
      return apiResponseHandler.errorResponse(null, req, res, "Forbidden! You do not have access to this work order", 403);
    }

    next();

  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, "Error checking work order access", 500);
  }
};
//CR0013
const validateWorkOrderDueDate = async (req, res, next) => {
  try {
    if (req.params.dueDateRequest || req.body.dueDateRequest) {
      if (req.params.dueDateRequest && typeof req.params.dueDateRequest === "string") {
        req.dueDateRequest = req.params.dueDateRequest;
      } else if (req.body.dueDateRequest && typeof req.body.dueDateRequest === "string") {
        req.dueDateRequest = req.body.dueDateRequest;
      }
      // If Workorder is not in req.params or req.body, return an error response
      else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "DueDateRequest id must be a non-empty string in req.params or req.body",
          400,
          null
        );
      }
      if(!mongoose.Types.ObjectId.isValid(req.dueDateRequest)){
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Invalid DueDateRequest Id",
          400,
          null
        );
      }
      let existingWorkOrderDueDateRequest = await dueDateManager.checkExistingWorkOrderDueDate({
        _id: req.dueDateRequest,
        workOrderId: req.workOrder,
        isDeleted: false,
      });
      req.dueDateRequestObj = existingWorkOrderDueDateRequest;
      if (existingWorkOrderDueDateRequest) {
        next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! DueDateRequest does not exist for the workorder",
          400,
          null
        );
      }
    } else {
      next();
    }
  } catch (error) {
    throw error;
  }
};

const validateWorkOrderTask = async (req, res, next) => {
  // Check if params or body contain task(s) or tasksDeleted
  if (req.params.task || req.body.tasks || req.body.tasksDeleted || req.body.tasksToBeEdited) {
    try {
      let existingWorkOrderTask;

      // Validate task from req.params.task
      if (req.params.task && typeof req.params.task === "string") {
        req.task = req.params.task;
        if(!mongoose.Types.ObjectId.isValid(req.task)){
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Failed! Task does not exist",
            400,
            null
          );
        }
        existingWorkOrderTask =
          await workOrderTaskManager.checkExistingWorkOrderTask({
            _id: req.task,
            workOrderId: new mongoose.Types.ObjectId(req.workOrder),
            isDeleted: false,
          });
        req.taskObj = existingWorkOrderTask;

        // If the task does not exist, return an error
        if (!existingWorkOrderTask) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Failed! Task does not exist",
            400,
            null
          );
        }
      }

      // Validate tasks from req.body
      if (req.body.tasks || req.body.tasksDeleted || req.body.tasksToBeEdited) {
        const tasks = req.body.tasks || req.body.tasksToBeEdited || [];
        const ids = tasks.filter((task) => task.id).map((task) => task.id);

        // Combine task IDs from req.body.tasks and req.body.tasksDeleted
        const tasksIds = [...ids, ...(req.body.tasksDeleted || [])];

        // Check for invalid task IDs
        const taskData = await workOrderTaskManager.returnInvalidTaskIds(
          tasksIds, req.workOrder
        );

        // If invalid task IDs are found, return an error
        if (
          taskData.invalidTaskIds?.length > 0 ||
          taskData.inValidArray?.length > 0
        ) {
          const invalidIds = taskData.invalidTaskIds || taskData.inValidArray;
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Failed! Invalid Task IDs",
            400,
            {
              invalidTaskIds: invalidIds,
            }
          );
        }

        // Assign valid existing tasks
        existingWorkOrderTask = taskData.existingTasks;
      }

      // Proceed to next middleware if valid tasks are found
      if (existingWorkOrderTask) {
        return next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Task does not exist",
          400,
          null
        );
      }
    } catch (error) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed to validate tasks",
        500,
        { error: error.message }
      );
    }
  } else {
    // Proceed to the next middleware if no task-related data is found
    return next();
  }
};

const validateworkOrderDueDateExtension = async (req, res, next) => {
  try {
    let existingWorkOrder = await workOrderManager.checkExistingWorkOrder({
      _id: req.workOrder,
      isDeleted: false,
    });
    if (existingWorkOrder.status.toLowerCase() !== "expired") {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        `Failed! Request DueDate cannot be done when status is ${existingWorkOrder.status.toLowerCase()}`,
        400,
        null
      );
    }
    if (existingWorkOrder.requestExtensionCount >= 2){
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! cannot request an extension more than twice.",
        400,
        null
      );
    }
    return next();
  } catch (error) {
    throw error;
  }
};

const validateWorkOrderImages = async (req, res, next) => {
  try {
    if (req.body.images) {
      for (let documentId of req.body.images) {
        if (documentId === null) {
          return;
        }
        if (!documentId) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! ImageId is required`,
            400,
            null
          );
        }
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! ImageId is not a valid file id`,
            400,
            null
          );
        }

        let workOrderDocuments = await fileManager.getFile(
          documentId,
          "internal",
          req.businessUnit
        );
        if (!workOrderDocuments) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! Invalid Image File id`,
            400,
            null
          );
        }
        if (workOrderDocuments.moduleName || workOrderDocuments.moduleId) {
          if (
            workOrderDocuments.moduleName &&
            workOrderDocuments.moduleName !== "workorders"
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Image. File id is not an workorder file`,
              400,
              null
            );
          }
          if (
            workOrderDocuments.moduleId &&
            workOrderDocuments.moduleId !== req.workOrder
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Image. File id is not an workorder file`,
              400,
              null
            );
          }
        }
        if(req.workOrder){
          const existingWorkOrder = await workOrderManager.checkExistingWorkOrder({
            _id:req.workOrder,
            images: { $in: [documentId] }
          });
          if (existingWorkOrder) {
            continue; // Skip this documentId and continue to the next one
          }
        }
      }
      return next();
    } else {
      return next();
    }
  } catch (error) {
    throw error;
  }
};

const validateWorkOrderDocuments = async (req, res, next) => {
  try {
    if (req.body.documents) {
      for (let documentId of req.body.documents) {
        if (documentId === null) {
          return;
        }
        if (!documentId) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! DocumentId is required`,
            400,
            null
          );
        }
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! DocumentId is not a valid file id`,
            400,
            null
          );
        }

        let workOrderDocuments = await fileManager.getFile(
          documentId,
          "internal",
          req.businessUnit
        );
        if (!workOrderDocuments) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! Invalid document File id`,
            400,
            null
          );
        }
        if (workOrderDocuments.moduleName || workOrderDocuments.moduleId) {
          if (
            workOrderDocuments.moduleName &&
            workOrderDocuments.moduleName !== "workorders"
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Document. File id is not an workorder file`,
              400,
              null
            );
          }
          if (
            workOrderDocuments.moduleId &&
            workOrderDocuments.moduleId !== req.workOrder
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Document. File id is not an workorder file`,
              400,
              null
            );
          }
        }
        if(req.workOrder){
          const existingWorkOrder = await workOrderManager.checkExistingWorkOrder({
            _id:req.workOrder,
            documents: { $in: [documentId] }
          });
          if (existingWorkOrder) {
            continue; // Skip this documentId and continue to the next one
          }
        }
      }
      return next();
    } else {
      return next();
    }
  } catch (error) {
    throw error;
  }
};

// const checkExistingAssigneeInDepartment = async (req, res, next) => {
//   try {
//     if (
//       (req.body.assignees && req.body.departments) ||
//       (req.body.assignees && req.workOrderObj.departments)
//     ) {
//       const department = req.body.departments
//         ? req.body.departments[0]
//         : req.workOrderObj.departments[0].toString();
//       const InvalidIds = await userManager.returnInvalidUserIds(
//         req.body.assignees,
//         "",
//         department
//       );
//       if (InvalidIds.length > 0) {
//         return apiResponseHandler.errorResponse(
//           null,
//           req,
//           res,
//           "Failed! Assignee does not exist in Department",
//           400,
//           null
//         );
//       } else {
//         return next();
//       }
//     }
//     return next();
//   } catch (error) {
//     throw error;
//   }
// };

// #QID_077
const checkExistingAssigneeInDepartment = async (req, res, next) => {
  try {
    if (
      (req.body.assignees && req.body.departments) ||
      (req.body.assignees && req.workOrderObj.departments)
    ) {
      const departments = req.body.departments
        ? req.body.departments
        : req.workOrderObj.departments.map((dep) => dep.toString());

      let invalidAssignees = [];

      for (const assignee of req.body.assignees) {
        let isValidAssignee = false;

        for (const department of departments) {
          const invalidIds = await userManager.returnInvalidUserIds(
            [assignee],
            "",
            department,
          );

          // valid user found in this department
          if (invalidIds.length === 0) {
            isValidAssignee = true;
            break;
          }
        }

        if (!isValidAssignee) {
          invalidAssignees.push(assignee);
        }
      }

      if (invalidAssignees.length > 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Assignee does not exist in selected Departments",
          400,
          null,
        );
      }

      return next();
    }

    return next();
  } catch (error) {
    throw error;
  }
};

const checkExistingTeamInDepartment = async (req, res, next) => {
  try {
    if (
      (req.body.existingTeams && req.body.departments) ||
      (req.body.existingTeams && req.workOrderObj.departments)
    ) {
      let teamIds;
      const department = req.body.departments
        ? req.body.departments[0]
        : req.workOrderObj.departments[0].toString();
      for (let existingTeam of req.body.existingTeams) {
        teamIds = await teamManager.checkExistingTeam(
          existingTeam.id,
          department
        );
      }
      if (teamIds) {
        return next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Teams does not exist in Department",
          400,
          null
        );
      }
    }
    return next();
  } catch (error) {
    throw error;
  }
};

const validateArrayField = (field, fieldName, req, res) => {
  if (!Array.isArray(field) || field.length === 0) {
    apiResponseHandler.errorResponse(
      null,
      req,
      res,
      `${fieldName} must be a non-empty array`,
      400,
      null
    );
    return false;
  }
  return true;
};

const validateReqBody = async (req, res, next) => {
  const {
    tasks,
    departments,
    assignees,
    documents,
    existingTeams,
    tasksDeleted,
    tasksToBeEdited,
    tasksToBeAdded,
  } = req.body;

  if (
    (tasks && !validateArrayField(tasks, "Tasks", req, res)) ||
    (departments &&
      !validateArrayField(departments, "Departments", req, res)) ||
    (assignees && !validateArrayField(assignees, "Assignees", req, res)) ||
    (documents && !validateArrayField(documents, "Documents", req, res)) ||
    (existingTeams &&
      !validateArrayField(existingTeams, "ExistingTeams", req, res)) ||
    // (localTeams && !validateArrayField(localTeams, "LocalTeams", req, res)) ||
    (tasksDeleted &&
      !validateArrayField(tasksDeleted, "TasksDeleted", req, res)) ||
    (tasksToBeAdded &&
      !validateArrayField(tasksToBeAdded, "TasksToBeAdded", req, res)) ||
      (tasksToBeEdited &&
        !validateArrayField(tasksToBeEdited, "tasksToBeEdited", req, res))
  ) {
    return; // Exit early if any validation fails
  }

  next(); // Proceed to the next middleware if all validations pass
};

const validateDateInput = (req, res, next) => {
  const { requestedDate } = req.body;

  // Check if the requestedDate is provided and is a valid date
  if (requestedDate && isNaN(Date.parse(requestedDate))) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      'Invalid requestedDate. Please provide a valid date.',
      400,
      null
    );
  }

  // If date is valid, proceed to the next middleware or controller
  next();
};

const validateWorkOrders = async (req, res, next) => {
  try{
  if(req.body.workOrders){
    const workOrderIds = req.body.workOrders;
    const workOrderData = await workOrderManager.returnInvalidWorkOrderIds(
      workOrderIds
    );

    // If invalid task IDs are found, return an error
    if (
      workOrderData.invalidWorkOrderIds?.length > 0 ||
      workOrderData.inValidArray?.length > 0
    ) {
      const invalidIds = workOrderData.invalidWorkOrderIds || workOrderData.inValidArray;
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid Workorder IDs",
        400,
        {
          invalidWorkOrderIds: invalidIds,
        }
      );
    }
    return next();
  }
  else{
    return next();
  }
  }catch(error){
    throw error;
  }
}

const validateAssetForWorkOrder = async (req, res, next) => {
  try{
    if (req.query.asset){
      req.asset = req.query.asset;
      const checkExistingAsset = await assetManager.checkExistingAsset(req.asset);
      if (checkExistingAsset) {
          req.assetObj = checkExistingAsset;
          next();
        } else {
          return apiResponseHandler.errorResponse(null, req, res, "Failed! Asset does not exist", 404, null);
        }
    }
    else{
      return next();
    }
  }catch(error){
    throw error;
  }
}

const validateStatusForAccept = async (req, res, next) => {
  try{
    const workorderDoc = await workOrderManager.checkExistingWorkOrder({_id: req.workOrder, status: { $in: ["scheduled", "onHold"] }, isDeleted:false})
    if(workorderDoc){
      return next();
    }else{
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Only Scheduled Workorders Can Be Accepted", 404, null);
    }
  }catch(error){
    throw error;
  }
}

const validateStatusForOnHold = async (req, res, next) => {
  try{
    const workorderDoc = await workOrderManager.checkExistingWorkOrder({_id: req.workOrder, status: "accepted", isDeleted:false})
    if(workorderDoc){
      return next();
    }else{
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Only Accepted Workorders Can Be Put On Hold.", 404, null);
    }
  }catch(error){
    throw error;
  }
}


const validateStatusForComplete = async (req, res, next) => {
  try{
    const workorderDoc = await workOrderManager.checkExistingWorkOrder({_id: req.workOrder, status: { $in: ["accepted", "onHold"] }, isDeleted:false})
    if(workorderDoc){
      return next();
    }else{
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Only Accepted or OnHold Workorders Can Be Completed.", 404, null);
    }
  }catch(error){
    throw error;
  }
}

const validateStatusForEdit = async (req, res, next) => {
  try{
    const workorderDoc = await workOrderManager.checkExistingWorkOrder({_id:req.workOrder, status:{ $in: ["accepted","onHold", "completed", "expired"]},isDeleted:false})
    if(workorderDoc){
        return apiResponseHandler.errorResponse(null, req, res, "Failed! WorkOrder Cannot be Edited if the status is Accepted, OnHold, Completed.", 404, null);
    }else{
      return next();
    }
  }catch(error){
    throw error;
  }
}

const workOrderMiddleware = {
  createWorkOrder,
  validateReqBody,
  verifyPriority,
  verifyStatus,
  verifyStartDateAndEndDateTime,
  verifyEstimatedDaysAndHours,
  verifyDuplicates,
  validateWorkOrder,
  validateworkOrderDueDateExtension,
  validateWorkOrderDocuments,
  checkExistingAssigneeInDepartment,
  checkExistingTeamInDepartment,
  validateWorkOrderTask,
  validateEditStartDate,
  validateWorkOrderDueDate,
  validateDateInput,
  validateWorkOrders,
  validateWorkOrderImages,
  validateAssetForWorkOrder,
  validateStatusForAccept,
  validateStatusForComplete,
  validateStatusForOnHold,
  validateStatusForEdit,
  // validateStatusForAccept,
  // validateStatusForComplete,
  // validateStatusForOnHold,
  // validateStatusForEdit,
  checkWorkOrderDepartmentAccess //CR0013
};

// Export the workOrderMiddleware object to be used in other modules.
module.exports = workOrderMiddleware;
