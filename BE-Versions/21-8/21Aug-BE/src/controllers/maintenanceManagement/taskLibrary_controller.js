const taskLibraryManager = require("../../managers/internalManagers/maintenanceManagement/taskLibrary_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

const createTaskLibrary = async (req, res) => {
    try {
        const taskLibraryCreateObject = req.taskLibraryCreateObject;
        const createdTaskLibrary = await taskLibraryManager.createTaskLibrary(taskLibraryCreateObject);
        if (taskLibraryCreateObject.tasks) {
            const createdTask = await taskLibraryManager.createTasksForTaskLibrary(
                req.body,
                createdTaskLibrary.id,
                req.userId,
                req.businessUnit
              );
        }
        const message = "TaskLibrary created successfully";
        return apiResponseHandler.successResponse(res, message, 201, {id:createdTaskLibrary.id});
    } catch (error) {
        console.log("Some error happened while creating TaskLibrary", error);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const updateTaskLibrary = async (req, res) => {
    try {
        const updatedTaskLibrary = await taskLibraryManager.updateTaskLibrary(req.taskLibrary, req.taskLibraryUpdateObject);
        if (req.body.tasksToBeEdited || req.body.tasksToBeAdded || req.body.tasksDeleted) {
            const editedTask = await taskLibraryManager.editTasks(req.body, req.taskLibrary, req.userId, req.businessUnit);
          }
        return apiResponseHandler.successResponse(res, "TaskLibrary updated successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while updating TaskLibrary", error);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const bulkDeleteTaskLibraries = async (req, res) => {
    const { taskLibrariesToDelete } = req.body;
    try {
        await taskLibraryManager.deleteTaskLibraries(taskLibrariesToDelete,req.userId);
        return apiResponseHandler.successResponse(res, "TaskLibraries deleted successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while deleting taskLibrary", error);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchTaskLibraries = async (req, res) => {
    try {
        const reqData = req.query;
        const getTaskLibraries = await taskLibraryManager.getTaskLibraries(reqData, req.businessUnit);
        return apiResponseHandler.successResponse(res, "TaskLibraries fetched successfully", 200, getTaskLibraries);
    } catch (error) {
        console.log("Some error happened while fetching TaskLibraries", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchTaskLibrary = async (req, res) => {
    try {
        const reqQuery = req.query;
        const taskLibraryId = req.taskLibraryObj._id;
        const getTaskLibrary = await taskLibraryManager.getTaskLibrary(taskLibraryId, reqQuery, req.businessUnit);
        if (!getTaskLibrary) {
            return apiResponseHandler.errorResponse(null, req, res, "TaskLibrary not found", 404, null);
        }
        const message = "TaskLibrary fetched successfully";
        return apiResponseHandler.successResponse(res, message, 200, getTaskLibrary);
    } catch (error) {
        console.log("Some error happened while fetching TaskLibrary", error.message);
        return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
    }
};

const fetchCount = async (req, res) => {
    try{
        const getCount = await taskLibraryManager.getTaskLibraryCount(req.businessUnit)
        const message = "Task Count fetched successfully";
        return apiResponseHandler.successResponse(res, message, 200, {"totalTasks":getCount});
    }catch(error){
        console.log("Some error happened while fetching TaskLibrary count", error.message);
        return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
    }
};


module.exports = {
    createTaskLibrary,
    updateTaskLibrary,
    bulkDeleteTaskLibraries,
    fetchTaskLibraries,
    fetchTaskLibrary,
    fetchCount,
};

