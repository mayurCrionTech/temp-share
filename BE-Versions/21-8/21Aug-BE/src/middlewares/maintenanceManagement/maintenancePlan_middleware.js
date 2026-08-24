/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
*/
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const {
    maintenancePlan,
    MaintenancePlan, //CR0013
    timePeriod,
    date,
    recurrOn
} = require("../../models/mongoDB/maintenanceManagement/maintenancePlan_model");
const timePeriodEnum = timePeriod;
const dateEnum =  date;
const recurrOnEnum = recurrOn;
const maintenancePlanController = require("../../controllers/maintenanceManagement/maintenancePlan_controller");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const maintenancePlanManager = require("../../managers/internalManagers/maintenanceManagement/maintenancePlan_manager");
const mongoose = require("mongoose");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const dueDateManager = require("../../managers/internalManagers/maintenanceManagement/workOrderDueDateRequest_manager")
const teamManager = require("../../managers/internalManagers/userManagement/team_manager");
const workOrderTaskManager = require("../../managers/internalManagers/maintenanceManagement/workOrderTask_manager");
const taskLibraryManager = require("../../managers/internalManagers/maintenanceManagement/taskLibrary_manager")
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager")

// This middleware validates and creates a new work order based on  request data.
const validateCreateMaintenancePlan = async (req, res, next) => {
  try {
    const status = req.body.status && req.body.status.toLowerCase();
    // Check if 'status' is 'draft'
    if (req.query.isDraft == "true") {
      // Create work order without further validations
      return await maintenancePlanController.createMaintenancePlan(req, res);
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
    const priority = Object.values(maintenancePlan.priority);
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

// const verifyStatus = async (req, res, next) => {
//   if (req.body.status) {
//     req.status = req.body.status;
//     const workOrderStatus = workOrder;
//     const status = Object.values(workOrderStatus.status);
//     if (status.includes(req.status)) {
//       return next();
//     } else {
//       return apiResponseHandler.errorResponse(
//         null,
//         req,
//         res,
//         `Please provide valid Status`,
//         400,
//         null
//       );
//     }
//   }
//   return next();
// };

const validateEditStartDate = async (req, res, next) => {
  try {
    // Define the query to check if the work order exists with the specified conditions
    const query = {
      _id: req.maintenancePlan, // Check for the specific workOrderId
      startAt: { $lte: new Date() },
      status: { $nin: ["draft"] },
      isDeleted: false,
    };

    // Check if the matching work order exists in the database
    const existingWorkOrder = await maintenancePlanManager.checkExistingMaintenancePlan(query);

    // If a matching work order is found
    if (existingWorkOrder && req.body.startAt) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Cannot update startAt as there is an existing maintenancePlan matching the criteria.",
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
      req.body.estimatedDays ?? req.maintenancePlanObj.estimatedDays;
    const estimatedHours =
      req.body.estimatedHours ?? req.maintenancePlanObj.estimatedHours;
    let differenceInMilliSeconds;
    const startAt = req.startAt || req.maintenancePlanObj.startAt
    const endAt = req.endAt || req.maintenancePlanObj.endAt;
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
        : req.maintenancePlanObj.startAt
        ? req.maintenancePlanObj.startAt
        : null;
      req.startAt = startAt;
      const endAt = req.body.endAt
        ? new Date(req.body.endAt)
        : req.maintenancePlanObj.endAt
        ? req.maintenancePlanObj.endAt
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
      const existingPlan = await maintenancePlanManager.checkExistingMaintenancePlan({
        name: req.body.name,
        status: { $ne: "draft" },
        isDeleted: false,
      });
      if (existingPlan) {
        const error = new Error(`Duplicate MaintenancePlan Name : ${req.body.name}`);
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Client Side Error",
          400,
          `Duplicate MaintenancePlan Name : ${req.body.name}`
        );
      } else {
        return next();
      }
    }
    else{
      next();
    }
  } catch (error) {
    next(error);
  }
};

const validateMaintenancePlan = async (req, res, next) => {
  try {
      let reqQuery = req.query || {};
  let reqBody = req.body || {};
    const fetchByField = reqQuery.fetchByField;
    let existingMaintenancePlan;
    if (req.params.maintenancePlan || reqBody.maintenancePlan || reqQuery.maintenanceId) {
      if ((req.params.maintenancePlan && typeof req.params.maintenancePlan === "string") || (reqQuery.maintenanceId && typeof reqQuery.maintenanceId === "string")) {
        req.maintenancePlan = req.params.maintenancePlan || reqQuery.maintenanceId;
        console.log("req.maintenancePlan",req.maintenancePlan)
      } else if (reqBody.maintenancePlan && typeof reqBody.maintenancePlan === "string") {
        req.maintenancePlan = reqBody.maintenancePlan;
      }
      // If maintenancePlan is not in req.params or req.body, return an error response
      else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "maintenancePlan id must be a non-empty string in req.params or req.body",
          400,
          null
        );
      }
      if (fetchByField) {   
        if (fetchByField == "name") {
          // Check if the user with the given ID exists
          existingMaintenancePlan =
            await maintenancePlanManager.checkExistingMaintenancePlan({
              name: req.maintenancePlan,
              isDeleted: false,
            }  
            );
        }
      }
      else{
        if(!mongoose.Types.ObjectId.isValid(req.maintenancePlan)){
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Failed! Invalid maintenancePlan Id",
            400,
            null
          );
        }
        existingMaintenancePlan = await maintenancePlanManager.checkExistingMaintenancePlan({
          _id: req.maintenancePlan,
          isDeleted: false,
        });
      }
      if (existingMaintenancePlan) {
        req.maintenancePlanObj = existingMaintenancePlan;
        next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! maintenancePlan does not exist.",
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

const checkMaintenancePlanDepartmentAccess = async (req, res, next) => {
  try {
    const userDepartment = req.user.department;

    // ─── Bulk (delete) ────────────────────────────────────────────────
    if (req.body?.maintenancePlans) {
      const maintenancePlanIds = req.body.maintenancePlans;
      console.log("maintenancePlan",maintenancePlanIds,req)
      // return

      if (!Array.isArray(maintenancePlanIds) || maintenancePlanIds.length === 0) {
        return apiResponseHandler.errorResponse(null, req, res, "No maintenance plans provided", 400);
      }

      const maintenancePlans = await MaintenancePlan.find(
        { _id: { $in: maintenancePlanIds } },
        { departments: 1 }
      );
      console.log(maintenancePlans)
      // return

      if (maintenancePlans.length !== maintenancePlanIds.length) {
        return apiResponseHandler.errorResponse(null, req, res, "One or more maintenance plans not found", 404);
      }

      const unauthorizedPlans = [];

      for (const plan of maintenancePlans) {
        if (!plan.departments || plan.departments.length === 0) {
          return apiResponseHandler.errorResponse(
            null, req, res,
            `Maintenance Plan ${plan._id} has no department assigned`,
            400
          );
        }

        const hasAccess = plan.departments.some(
          (dept) => dept.toString() === userDepartment
        );

        if (!hasAccess) unauthorizedPlans.push(plan._id);
      }

      if (unauthorizedPlans.length > 0) {
        return apiResponseHandler.errorResponse(
          null, req, res,
          `Forbidden! You do not have access to maintenance plans: ${unauthorizedPlans.join(", ")}`,
          403
        );
      }

      return next();
    }

    // ─── Single (create, update) ──────────────────────────────────────
    const planDepts = req.maintenancePlanObj.departments;

    if (!planDepts || planDepts.length === 0) {
      return apiResponseHandler.errorResponse(
        null, req, res,
        "Maintenance Plan has no department assigned",
        400
      );
    }

    const hasAccess = planDepts.some(
      (dept) => dept.toString() === userDepartment
    );

    if (!hasAccess) {
      return apiResponseHandler.errorResponse(
        null, req, res,
        "Forbidden! You do not have access to this maintenance plan",
        403
      );
    }

    next();

  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, "Error checking maintenance plan access", 500);
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

const validateTask = async (req, res, next) => {
  // Check if params or body contain task(s) or tasksDeleted
  if (req.params.task || req.body.tasks || req.body.tasksDeleted || req.body.tasksToBeEdited) {
    try {
      let existingTask;

      // Validate task from req.params.task
      if (req.params.task && typeof req.params.task === "string") {
        req.task = req.params.task;
        existingTask =
          await taskLibraryManager.checkExistingTaskLibraryTask({
            _id: req.task,
            isDeleted: false,
          });
        req.taskObj = existingTask;

        // If the task does not exist, return an error
        if (!existingTask) {
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
        const taskData = await taskLibraryManager.returnInvalidTaskIds(
          tasksIds,
          null,
          req.maintenancePlan
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
        existingTask = taskData.existingTasks;
      }

      // Proceed to next middleware if valid tasks are found
      if (existingTask) {
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

const validateMaintenancePlanVersion = async (req, res, next) => {
  try {
    if(!mongoose.Types.ObjectId.isValid(req.params.version)){
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid MaintenanceVersion Id",
        400,
        null
      );
    }
    let existingWorkOrder = await maintenancePlanManager.checkExistingMaintenancePlanVersion({
      _id: req.params.version,
      maintenanceId: req.maintenancePlan,
      isDeleted: false,
    });
    if(existingWorkOrder){
      return next();
    }else{
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! MaintenanceVersion does not exist for this MaintenancePlan",
        400,
        null
      );
    }
  } catch (error) {
    throw error;
  }
};

const validateMaintenancePlanRecurrence = async (req, res, next) => {
  try {
    const { isRecurrence, recurrenceDetails } = req.body;

    if (isRecurrence === true) {
      if (!recurrenceDetails || Object.keys(recurrenceDetails).length === 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          `Failed! Provide recurrenceDetails in req.body`,
          400,
          null
        );
      }

      const { frequency, timePeriod, recurrOn, specificDay, occurDays } = recurrenceDetails;

      // Validate `frequency`
      if (frequency && (typeof frequency !== "number" || frequency <= 0)) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          `Failed! frequency must be a positive number.`,
          400,
          null
        );
      }

      // Validate `timePeriod`
      const validTimePeriods = Object.values(timePeriodEnum);
      if (!timePeriod || !validTimePeriods.includes(timePeriod)) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          `Failed! timePeriod must be one of ${validTimePeriods.join(", ")}.`,
          400,
          null
        );
      }

      // Validate `recurrOn`
      if (timePeriod !== "month") {
      const validRecurrOn = Object.values(recurrOnEnum);
      if (!recurrOn || !validRecurrOn.includes(recurrOn)) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          `Failed! recurrOn must be one of ${validRecurrOn.join(", ")}.`,
          400,
          null
        );
      }
    }

      // // Conditional validation for `specificDay`
      // if (recurrOn === "specificDay" && !specificDay) {
      //   return apiResponseHandler.errorResponse(
      //     null,
      //     req,
      //     res,
      //     `Failed! specificDay is required when recurrOn is 'specificDay'.`,
      //     400,
      //     null
      //   );
      // }

      // // Conditional validation for `occurDays`
      // if (recurrOn === "occurDays") {
      //   const validDays = Object.values(dateEnum);
      //   if (!occurDays || !Array.isArray(occurDays) || occurDays.length === 0) {
      //     return apiResponseHandler.errorResponse(
      //       null,
      //       req,
      //       res,
      //       `Failed! occurDays must be a non-empty array.`,
      //       400,
      //       null
      //     );
      //   }
      //   if (!occurDays.every(day => validDays.includes(day.toLowerCase()))) {
      //     return apiResponseHandler.errorResponse(
      //       null,
      //       req,
      //       res,
      //       `Failed! occurDays must only contain valid days: ${validDays.join(", ")}.`,
      //       400,
      //       null
      //     );
      //   }
      // }
    }

    return next();
  } catch (error) {
    throw error;
  }
};

const validateMaintenancePlanImages = async (req, res, next) => {
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

        let maintenancePlanDocuments = await fileManager.getFile(
          documentId,
          "internal",
          req.businessUnit
        );
        if (!maintenancePlanDocuments) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! Invalid document File id`,
            400,
            null
          );
        }
        if (maintenancePlanDocuments.moduleName || maintenancePlanDocuments.moduleId) {
          if (
            maintenancePlanDocuments.moduleName &&
            maintenancePlanDocuments.moduleName !== "maintenancePlans"
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Document. File id is not an maintenancePlan file`,
              400,
              null
            );
          }
          if (
            maintenancePlanDocuments.moduleId &&
            maintenancePlanDocuments.moduleId !== req.maintenancePlan
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Image. File id is not an maintenancePlan file`,
              400,
              null
            );
          }
        }                
        if(req.maintenancePlan){
          const existingWorkOrder = await maintenancePlanManager.checkExistingMaintenancePlan({
            _id:req.maintenancePlan,
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

const validateMaintenancePlanDocuments = async (req, res, next) => {
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

        let maintenancePlanDocuments = await fileManager.getFile(
          documentId,
          "internal",
          req.businessUnit
        );
        if (!maintenancePlanDocuments) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! Invalid document File id`,
            400,
            null
          );
        }
        if (maintenancePlanDocuments.moduleName || maintenancePlanDocuments.moduleId) {
          if (
            maintenancePlanDocuments.moduleName &&
            maintenancePlanDocuments.moduleName !== "maintenancePlans"
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Document. File id is not an maintenancePlan file`,
              400,
              null
            );
          }
          if (
            maintenancePlanDocuments.moduleId &&
            maintenancePlanDocuments.moduleId !== req.maintenancePlan
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Document. File id is not an maintenancePlan file`,
              400,
              null
            );
          }
        }
                if(req.maintenancePlan){
                  const existingWorkOrder = await maintenancePlanManager.checkExistingMaintenancePlan({
                    _id:req.maintenancePlan,
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

const checkExistingAssigneeInDepartment = async (req, res, next) => {
  try {
    if (
      (req.body.assignees && req.body.departments) ||
      (req.body.assignees && req.maintenancePlanObj.departments)
    ) {
      const department = req.body.departments
        ? req.body.departments[0]
        : req.maintenancePlanObj.departments[0].toString();
      const InvalidIds = await userManager.returnInvalidUserIds(
        req.body.assignees,
        "",
        department
      );
      if (InvalidIds.length > 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Assignee does not exist in Department",
          400,
          null
        );
      } else {
        return next();
      }
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
      (req.body.existingTeams && req.maintenancePlanObj.departments)
    ) {
      let teamIds;
      const department = req.body.departments
        ? req.body.departments[0]
        : req.maintenancePlanObj.departments[0].toString();
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
    taskToBeEdited,
    tasksDeleted,
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
    (tasksDeleted &&
      !validateArrayField(tasksDeleted, "TasksDeleted", req, res)) ||
    (tasksToBeAdded &&
      !validateArrayField(tasksToBeAdded, "TasksToBeAdded", req, res)) ||
      (taskToBeEdited &&
        !validateArrayField(taskToBeEdited, "taskToBeEdited", req, res))
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

const validateMaintenancePlans = async (req, res, next) => {
  try{
  if(req.body.maintenancePlans){
    const maintenancePlanIds = req.body.maintenancePlans;
    const workOrderData = await maintenancePlanManager.returnInvalidMaintenanceIds(
      maintenancePlanIds
    );

    // If invalid task IDs are found, return an error
    if (
      workOrderData.invalidMaintenanceIds?.length > 0 ||
      workOrderData.inValidArray?.length > 0
    ) {
      const invalidIds = workOrderData.invalidMaintenanceIds || workOrderData.inValidArray;
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid Workorder IDs",
        400,
        {
          invalidMaintenanceIds: invalidIds,
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
};

const validateAssetForMaintenancePlan = async (req, res, next) => {
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

const maintenancePlanMiddleware = {
  validateCreateMaintenancePlan,
  validateReqBody,
  verifyPriority,
  validateMaintenancePlanRecurrence,
  verifyStartDateAndEndDateTime,
  verifyEstimatedDaysAndHours,
  verifyDuplicates,
  validateMaintenancePlan,
  validateMaintenancePlanVersion,
  validateMaintenancePlanDocuments,
  checkExistingAssigneeInDepartment,
  checkExistingTeamInDepartment,
  validateTask,
  validateEditStartDate,
  validateDateInput,
  validateMaintenancePlans,
  validateMaintenancePlanImages,
  validateAssetForMaintenancePlan,
  checkMaintenancePlanDepartmentAccess //CR0013
};

// Export the workOrderMiddleware object to be used in other modules.
module.exports = maintenancePlanMiddleware;
