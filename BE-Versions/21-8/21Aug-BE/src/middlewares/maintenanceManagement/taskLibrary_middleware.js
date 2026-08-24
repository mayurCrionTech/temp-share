/*
date              cr/qid      comments
24-march-2026     CR0001      1) Updated - ref of asset category removed for - dropdown api
*/

const { TaskLibrary } = require("../../models/mongoDB/maintenanceManagement/taskLibrary_model");
const {Task} = require("../../models/mongoDB/maintenanceManagement/tasks_model")
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager");
const assetCategoryManager = require("../../managers/internalManagers/assetManagement/assetCategory_manager");
const taskLibraryManager = require("../../managers/internalManagers/maintenanceManagement/taskLibrary_manager");
const mongoose = require("mongoose")

const validateField = async (field, value, options) => {
    const { type, maxLength, unique, required, checkExists, checkManyExists, enumValues, alphanumeric, checkDuplicates, nestedUniqueFields } = options;

    if (required && !value) {
        return {
            message: `Failed! ${field} is required`,
            errorInfo: null
        };
    }

    if (value) {
        if (type && typeof value !== type && !Array.isArray(value)) {
            return {
                message: `Failed! ${field} must be a ${type}`,
                errorInfo: null
            };
        }

        if (maxLength && value.length > maxLength && !Array.isArray(value)) {
            return {
                message: `Failed! ${field} should not exceed ${maxLength} characters`,
                errorInfo: null
            };
        }
        else if (maxLength && value.length > maxLength && Array.isArray(value)) {
            return {
                message: `Failed! ${field} should not exceed ${maxLength} items`,
                errorInfo: null
            };
        }

        if (Array.isArray(value) && checkDuplicates) {
            const idSet = new Set();
            const duplicateIds = new Set();

            for (const id of value) {
                if (idSet.has(id)) {
                    duplicateIds.add(id);
                } else {
                    idSet.add(id);
                }
            }

            if (duplicateIds.size > 0) {
                return {
                    message: `Failed! Duplicate IDs found in ${field}`,
                    errorInfo: { duplicateIds: Array.from(duplicateIds) }
                };
            }
        }

        if (nestedUniqueFields) {
            const fieldSet = new Map();
            for (const obj of value) {
                const key = nestedUniqueFields.map(f => obj[f]).join('|'); // Combine fields for uniqueness
                if (fieldSet.has(key)) {
                    return {
                        message: `Failed! Duplicate combination of ${nestedUniqueFields.join(' and ')} found in ${field}`,
                        errorInfo: { duplicate: key }
                    };
                }
                fieldSet.set(key, true);
            }
        }


        if (unique) {
            const exists = await TaskLibrary.findOne({ [`${field}`]: value, isDeleted: false });
            if (exists) {
                return {
                    message: `Failed! ${field} already exists in the server`,
                    errorInfo: null
                };
            }
        }

        if (checkExists && !(await checkExists(value))) {
            return {
                message: `Failed! Invalid ${field}`,
                errorInfo: null
            };
        }

        if (checkManyExists) {
            const invalidIds = await checkManyExists(value);
            if (invalidIds.length > 0) {
                return {
                    message: `Failed! Invalid ${field}`,
                    errorInfo: {
                        invalidIds
                    }
                };
            }
        }

        if (enumValues && !enumValues.includes(value)) {
            return {
                message: `Failed! Invalid ${field}`,
                errorInfo: null
            };
        }

        if (alphanumeric && !/^[a-zA-Z0-9\s]*$/.test(value)) {
            return {
                message: `Failed! ${field} should contain only alphanumeric characters`,
                errorInfo: null
            };
        }
    }

    return null;
};

const validateTasksUniqueness = async (tasks) => {
    const orders = [];
    const descriptions = [];
    for (const step of tasks) {
        if (!step.order || !step.description) {
            return {
                message: "Failed! Both 'order' and 'description' are required for tasks to be created.",
                errorInfo: null,
            };
        }
        orders.push(step.order);
        descriptions.push(step.description);
    }
    return null;
};

const validateTasksForEdit = async (tasks, taskLibraryId) => {
    const descriptions = [];

    // Collect orders and descriptions if present
    for (const step of tasks) {
        if (step.description) descriptions.push(step.description);
    }

    // Check for duplicate descriptions
    if (descriptions.length > 0) {
        const existingNames = await Task.find({ description: { $in: descriptions }, taskLibrary: taskLibraryId }, "description");
        if (existingNames.length > 0) {
            return {
                message: `Failed! The following descriptions already exist in the database: ${existingNames.map((task) => task.description).join(", ")}.`,
                errorInfo: null,
            };
        }
    }

    return null;
};


const validateCreateTaskLibraryRequest = async (req, res, next) => {
    try{
    const { name, description, assetCategory, tasks } = req.body;
    req.taskLibraryCreateObject = {
        name,
        description,
        assetCategory,
        businessUnit: req.businessUnit,
        tasks,
        createdBy: req.userId,
        updatedBy: req.userId
    };
    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
        { field: "description", options: { type: "string", maxLength: 1000 } },
        // { field: "assetCategory", options: { type: "string", checkExists: assetCategoryManager.checkExistingAssetCategory  } },
        // CR0001
        { field: "assetCategory", options: { type: "string" } },
        { field: "tasks", options: { 
            type: "array", 
        } },
        { field: "businessUnit", options: { checkExists: businessUnitManager.checkExistingBusinessUnit } }

    ];
    
    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];
        
        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }
        
    }
    if (tasks){
        const error = await validateTasksUniqueness(tasks);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }else{
            return next();
        }
    }    

    return next();
}catch(error){
    throw error
}
};

const validateUpdateTaskLibraryRequest = async (req, res, next) => {
    const { name, description, assetCategory, tasks, tasksToBeAdded, tasksDeleted ,tasksToBeEdited} = req.body;

    req.taskLibrary = req.params.task;
    req.taskLibraryObj = await TaskLibrary.findById(req.taskLibrary);

    if (!req.taskLibraryObj) {
        return apiResponseHandler.errorResponse(null, req, res, "TaskLibrary not found", 404, null);
    }

    req.taskLibraryUpdateObject = {
        name: name ?? req.taskLibraryObj.name,
        description: description ?? req.taskLibraryObj.description,
        assetCategory: assetCategory ?? req.taskLibraryObj.assetCategory,
        tasksToBeAdded: tasksToBeAdded,
        tasksToBeEdited : tasksToBeEdited,
        tasksDeleted : tasksDeleted,
        updatedBy: req.userId,
        updatedAt: Date.now()
    };
    if (tasksToBeEdited){
        const error = await validateTasksForEdit(tasksToBeEdited, req.taskLibrary);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }
    }
    if (tasksToBeAdded){
        const error = await validateTasksUniqueness(tasksToBeAdded);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }
    }
    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true } },
        { field: "description", options: { type: "string", maxLength: 1000 } },
        // { field: "assetCategory", options: { type: "string", checkExists: assetCategoryManager.checkExistingAssetCategory } },
         // CR0001
        { field: "assetCategory", options: { type: "string" } },
    ];

    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];

        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }

    }

    next();
};

const validateDeleteTaskLibrariesRequest = async (req, res, next) => {

    const fieldsToValidate = [
        { field: "taskLibrariesToDelete", options: { type: "array", maxLength: 1000, checkManyExists: taskLibraryManager.returnInvalidTaskLibraryIds, checkDuplicates: true, required: true } },
    ];

    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];

        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }

    }

    next();
};

const validateTaskLibrary = async (req, res, next) => {
  try {
      let existingtaskLibrary;
      const fetchByField = req.query.fetchByField;
      if (req.params.task && typeof req.params.task === "string") {
          req.taskLibrary = req.params.task;
        } else if (req.body.task && typeof req.body.task === "string") {
            req.taskLibrary = req.body.task;
        } else if (req.query.task && typeof req.query.task === "string") {
            req.taskLibrary = req.query.task;
        } else {
            return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                "TaskLibrary id must be a non-empty string in req.params or req.body",
                400,
                null
            );
        }
        
        if (fetchByField) {
            if (fetchByField == "name") {
                // Check if the user with the given ID exists
        existingtaskLibrary = await taskLibraryManager.checkExistingTaskLibrary(
          {
            name: req.taskLibrary,
            isDeleted: false,
          }
        );
    }
    } else {
      if (!mongoose.Types.ObjectId.isValid(req.taskLibrary)) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Invalid TaskLibrary Id",
          400,
          null
        );
      }
      existingtaskLibrary = await taskLibraryManager.checkExistingTaskLibrary({
        _id: req.taskLibrary,
        isDeleted: false,
      });
    }

    if (existingtaskLibrary) {
      req.taskLibraryObj = existingtaskLibrary;
      next();
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! TaskLibrary does not exist",
        404,
        null
      );
    }
  } catch (error) {
    throw error;
  }
};

const validateTaskLibraryTask = async (req, res, next) => {
  try {
    if (req.body.tasks || req.body.tasksDeleted || req.body.tasksToBeEdited) {
      let ids = [];
      const tasks = req.body.tasks || req.body.tasksToBeEdited
      if (tasks) {
          ids = tasks.filter((task) => task.id).map((task) => task.id);
          if (ids.length === 0) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Provide task id to update.",
            400,
            null
          );
        }
      }
      const tasksIds = [...ids, ...(req.body.tasksDeleted || [])];
      const taskData = await taskLibraryManager.returnInvalidTaskIds(tasksIds, req.taskLibrary);
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
    }
    return next();
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
};

const taskLibraryMiddleware = {
    validateCreateTaskLibraryRequest,
    validateUpdateTaskLibraryRequest,
    validateDeleteTaskLibrariesRequest,
    validateTaskLibrary,
    validateTaskLibraryTask,
};

module.exports = taskLibraryMiddleware;