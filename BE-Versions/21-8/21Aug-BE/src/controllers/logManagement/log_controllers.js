/*
date            qid / cr#         comments
17-mar-2026     CR0002           filteration for LOG SCREEN

*/
const { default: mongoose } = require("mongoose");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
// new
const {
  getDeviations,
} = require("../../managers/internalManagers/logManagement/deviation_manager");

const {
	logCreation,
	logWithAllDetails,
	getLog,
	logCount,
	updateLog,
	updateLogStructure,
	entryDetails,
	getVersionDetails,
	getTemplateDetails,
	fillTheEntries,
	updateTemplate,
	checkFieldUniqueness,
	updateStatus,
	updateTheEntries,
	templateCreation,
	getEntries,
	getVersions,
	getTemplates,
	logEntryStats,
	allEntries,
	particularEntryDetails,
	uploadEntryImages,
	uploadEntryNotes,
	getEntryImages,
	getEntryNotes,
  updateSetPoints,
  updateTemplateFormula,
  logsReturningIds,
  pauseLogEntries,
  resumeLogEntries,
  saveEntries,
  fetchLogs,
  deleteAndTransferLogs
} = require("../../managers/internalManagers/logManagement/log_manager");
const { createLogentriesForNonRecurrence } = require("../../managers/internalManagers/logManagement/recurrence");
const { TIME_PERIOD, ENTRY_STATUS_UPDATE } = require("../../utils/constants");

/**
 * Controller function for adding general details for a log.
 * This function handles the creation of a new log document based on the provided request body.
 * It retrieves previous logs, calculates the new log number, and creates a new log document.
 * Handles errors such as validation errors, duplicate key errors, and server-side errors.
 * @param {object} req - Request object containing log general details data in the body
 * @param {object} res - Response object for sending JSON response (name,logNumber,description,documentNumber,assetId,departments,teams,assignees,startDateAndTime,endDateAndTime,isRecurrence,recurrenceDataId,timePeriod,logStatus,isScheduleReport,scheduleReportDataId,isStaticlogTemplate,createdBy,updatedBy,isArchived,deleteTime)
 * @returns {object} - JSON response indicating the success or failure of the log creation
 */
const createLog = async (req, res) => {
  try {
    const userId = req.userId;
    const reqData = req.body;
    reqData.businessUnit = req.businessUnit;
    const { isDraft } = req.query;
    if (isDraft === undefined) {
      return apiResponseHandler.errorResponse(
        "Please add isDraft query in request query",
        req,
        res,
        "Please add isDraft query in request query",
        400,
        {}
      );
    }
    const logDoc = await logCreation(reqData, userId, isDraft);
    return apiResponseHandler.successResponse(
      res,
      "Log created successfully",
      201,
      { logId: logDoc }
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

/**
 * Controller function for creating a template for a log.
 * @param {object} req - Request object containing log template data in the body and logId in the parameters
 * @param {object} res - Response object for sending JSON response
 * @returns {object} - JSON response indicating success or failure
 */
const createTemplate = async (req, res) => {
  try {
    const reqData = req.body;
    reqData.businessUnit = req.businessUnit
    const userId = req.userId;
    const { logId, isGeneralTemplate } = req.query;
    if (isGeneralTemplate === "false" && logId === undefined) {
      return apiResponseHandler.errorResponse(
        "Please provide logId in request query",
        req,
        res,
        "Please provide logId in request query",
        400,
        {}
      );
    }
    if (isGeneralTemplate === undefined) {
      return apiResponseHandler.errorResponse(
        "Please provide isGeneralTemplate status in request query",
        req,
        res,
        "Please provide isGeneralTemplate status in request query",
        400,
        {}
      );
    }
    const result = await templateCreation(
      reqData,
      userId,
      logId,
      isGeneralTemplate
    );
    return apiResponseHandler.successResponse(
      res,
      "Template has been saved successfully.",
      201,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = error.message;
      return apiResponseHandler.errorResponse(
        errors,
        req,
        res,
        "Validation error :Please check fields",
        400,
        errors
      );
    }
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

/**
 * Controller function for retrieving all logs with all details.
 * @param {object} req - Request object (unused)
 * @param {object} res - Response object for sending JSON response
 * @returns {object} - JSON response containing logs or error message
 */
//Sumit start
//CR0002

const getAllLogs = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      page,
      limit,
      name,
      logNumber,
      documentNumber,
      status,
      priority,
      asset,
      timePeriod,
      departments,
      createdAt    // FIX: was missing — createdAt filter was silently dropped
    } = req.query;

    const logs = await logWithAllDetails(
      userId,
      page,
      limit,
      req.businessUnit,
      {
        name,
        logNumber,
        documentNumber,
        status,
        priority,
        asset,
        timePeriod,
        departments,
        createdAt    // FIX: now forwarded to the manager
      }
    );
//end 
    if (!logs) {
      return apiResponseHandler.errorResponse(
        "No logs are available",
        req,
        res,
        "No logs are available",
        400,
        {}
      );
    }
    return apiResponseHandler.successResponse(res, "logs", 200, logs);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getLogDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { logId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid logId.",
        req,
        res,
        "Please provide valid logId.",
        400,
        {}
      );
    }
    const log = await getLog(logId, userId);
    if (Object.keys(log).length > 0) {
      return apiResponseHandler.successResponse(res, "Log details", 200, log);
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const deleteLog = async (req, res) => {
  try {
    const userId = req.userId;

    // Support single or multiple
    let logIds = [];
    console.log(req.body.logIds);
    
    
    if (req.params.logId) {
      logIds = [req.params.logId];
    } else if (Array.isArray(req.body.logIds)) {
      logIds = req.body.logIds;
    }
    console.log(req.params.logId);

    if (!logIds.length) {
      return apiResponseHandler.errorResponse(
        "Valid logId(s) required",
        req,
        res,
        "logId(s) required",
        400
      );
    }

    const data = await deleteAndTransferLogs(logIds, userId);

    return apiResponseHandler.successResponse(
      res,
      "Log(s) deleted successfully",
      200,
      data
    );
  } catch (error) {
    console.error(error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Server side error",
      500
    );
  }
};


const createLogEntry=async (req, res)=> {
  try {
    const logId = req.params.logId;
    const userId = req.userId;

    const response = await createLogentriesForNonRecurrence(logId, null, userId);
    const log = await getEntries(logId, userId);

    return apiResponseHandler.successResponse(res, "Log entry created successfully", 201, log);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
}

const getLogEntries = async (req, res) => {
  try {
    const userId = req.userId;
    let { status } = req.query;
    const { logId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid logId.",
        req,
        res,
        "Please provide valid logId.",
        400,
        {}
      );
    }
    // if (process.env.CREATE_LOG_ENTRIES_WHILE_FETCH_BY_ASSIGNEE === "true") {
    //   await createLogentriesForNonRecurrence(logId, null, userId);
    // }
    let pNum = page ? page : 1;
    let pSize = limit ? limit : 15;
    let sort = { createdAt: "desc" };
    status = status !== undefined ? status : "";
    const entries = await getEntries(logId, userId, pNum, pSize, status);
    const entriesData = entries ? entries.data || [] : [];
    if (entriesData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Entries related to the log",
        200,
        entries
      );
    } else {
      // Log response change
      return apiResponseHandler.successResponse(res, "No Log Entries", 200,{currentPage: Number(pNum),totalPageCount: 0,totalDataCount: 0, data: [] });
    }
    // else {
    //   return apiResponseHandler.successResponse(res, "No entries", 200, []);
    // }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getLogVersions = async (req, res) => {
  try {
    const userId = req.userId;
    const { logId } = req.params;
    const { page, limit } = req.query;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid logId.",
        req,
        res,
        "Please provide valid logId.",
        400,
        {}
      );
    }
    let pNum = page ? page : 1;
    let pSize = limit ? limit : 15;
    let sort = { createdAt: "desc" };
    const paginationDetails = {
      pageNumber: pNum,
      pageSize: pSize,
      sort: sort,
      sortOrder: "desc",
    };
    const versions = await getVersions(logId, userId, paginationDetails);
    const versionssData = versions ? versions.data || [] : [];
    if (versionssData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Log versions",
        200,
        versions
      );
    }
    return apiResponseHandler.successResponse(res, "No versions", 200, []);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getLogEntryDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { entryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid entryId.",
        req,
        res,
        "Please provide valid entryId.",
        400,
        {}
      );
    }
    const entryWithLogDetails = await entryDetails(entryId, userId);
    if (!entryWithLogDetails) {
      return apiResponseHandler.successResponse(
        res,
        "No entries available",
        200,
        {}
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Log entry details",
      200,
      entryWithLogDetails
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error,
      400,
      {}
    );
  }
};

const getlogStatusCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await logCount(userId, req.businessUnit);
    return apiResponseHandler.successResponse(
      res,
      "Log status count details",
      200,
      count
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Client side error",
      400,
      error
    );
  }
};

const getAllTemplates = async (req, res) => {
  try {
    const { page, limit } = req.query;
    let pNum = page ? page : 1;
    let pSize = limit ? limit : 15;
    let sort = { createdAt: "desc" };
    const paginationDetails = {
      pageNumber: pNum,
      pageSize: pSize,
      sort: sort,
      sortOrder: "desc",
    };
    const templates = await getTemplates(paginationDetails, req.businessUnit);
    const templatesData = templates ? templates.data || [] : [];
    if (templatesData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "All the templates",
        200,
        templates
      );
    }
    return apiResponseHandler.successResponse(res, "No templates", 200, []);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const updateLogDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { logId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid logId.",
        req,
        res,
        "Please provide valid logId.",
        400,
        {}
      );
    }
    const updateData = req.body;
    await updateLog(logId, userId, updateData);
    return apiResponseHandler.successResponse(
      res,
      "Log update",
      200,
      "Log updated successfully"
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((error) => error.message);
      return apiResponseHandler.errorResponse(
        error,
        req,
        res,
        "Request body validation error",
        400,
        {}
      );
    } else if (error.code === 11000 && error.keyPattern && error.keyValue) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return apiResponseHandler.errorResponse(
        error,
        req,
        res,
        `Duplicate key error: ${duplicateKey} already exists.`,
        400,
        {}
      );
    } else {
      return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
    }
  }
};

const updateLogStructureDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { structureId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(structureId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid structureId.",
        req,
        res,
        "Please provide valid structureId.",
        400,
        {}
      );
    }
    const updateData = req.body;
    updateData.businessUnit = req.businessUnit
    const data = await updateLogStructure(structureId, userId, updateData);
    return apiResponseHandler.successResponse(
      res,
      "Log structure updated successfully",
      200,
      data
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};
const logManager = require("../../managers/internalManagers/logManagement/log_manager");
const updateTemplateSetPoints = async (req, res) => {
  try {


    if (req.params.log && typeof req.params.log === "string") {
      req.log = req.params.log;
    }
    // If not, check if logId is in req.body
    else if (req.body.log && typeof req.body.log === "string") {
      req.log = req.body.log;
    } else if (req.query.log && typeof req.query.log === "string") {
      req.log = req.query.log;
    }
    // If logId is not in req.params or req.body, return an error response
    else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Log id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }
    let checkExistingLog;
    checkExistingLog = await logManager.checkExistingLog(req.log);
    if (checkExistingLog) {
      req.logObj = checkExistingLog;
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Log does not exist",
        404,
        null
      );
    }
    // Check if logStructureId is in req.params
    if (req.params.logStructure && typeof req.params.logStructure === "string") {
      req.logStructure = req.params.logStructure;
    }
    // If not, check if logStructureId is in req.body
    else if (req.body.logStructure && typeof req.body.logStructure === "string") {
      req.logStructure = req.body.logStructure;
    } else if (
      req.query.logStructure &&
      typeof req.query.logStructure === "string"
    ) {
      req.logStructure = req.query.logStructure;
    }
    // If logStructureId is not in req.params or req.body, return an error response
    else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "logStructure id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }
    let checkExistingLogStructure;
  
    checkExistingLogStructure = await logManager.checkExistingLogStructure(
      req.logStructure,
      req.log
    );
  
    if (checkExistingLogStructure) {
      req.logStructureObj = checkExistingLogStructure;
    } else {
      if (req.log) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! logStructure does not exist or doesnt belong to this log",
          404,
          null
        );
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! logStructure does not exist",
          404,
          null
        );
      }
    }




    const templateId = req.logStructureObj?.templateId || req.template;
    const updateData = req.body;
    updateData.userId = req.userId;

    // Call updateSetPoints and let errors propagate
    const result = await updateSetPoints(templateId, updateData);
    // If successful, send a success response
    return apiResponseHandler.successResponse(
      res,
      "Setpoints updated successfully for log template",
      200
    );
  } catch (error) {
    // Handle and return the error response
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message || "An error occurred",
      400,
      {}
    );
  }
};

// const deleteLog = async (req,res) =>{
//   const {logId} =  req.params
//   const userId =  req.userId
//   try{
//     const data =  await deleteAndTransferLog(logId,userId)
//     if(data){
//       return apiResponseHandler.successResponse(
//         res,
//         "Log deleted successfully",
//         200,
//         data
//       );
//     }

//   }
//   catch(error){
//     console.log(error)
//     return apiResponseHandler.errorResponse(error, req, res, "Server side error", 500, error);
//   }
// }

const versionDetails = async (req, res) => {
  try {
    const { structureId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(structureId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid structureId.",
        req,
        res,
        "Please provide valid structureId.",
        400,
        {}
      );
    }
    const result = await getVersionDetails(structureId);
    if (!result) {
      return apiResponseHandler.errorResponse(
        "No version details available",
        req,
        res,
        "No version details available",
        400,
        {}
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Version Details",
      200,
      result
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const templateDetails = async (req, res) => {
  try {
    const { templateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid templateId.",
        req,
        res,
        "Please provide valid templateId.",
        400,
        {}
      );
    }
    const result = await getTemplateDetails(templateId);
    if (!result) {
      return apiResponseHandler.errorResponse(
        "No template exists",
        req,
        res,
        "No template exists",
        400,
        {}
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Template Details",
      200,
      result
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const fillLogEntries = async (req, res) => {
  try {
    const reqData = req.body;
    const userId = req.userId;
    const { entryId } = req.params;
    const entriesUpdated = await fillTheEntries(entryId, userId, reqData);
    if (entriesUpdated) {
      return apiResponseHandler.successResponse(
        res,
        "Entry filled successfully",
        200,
        entriesUpdated._id
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const updateTemplateDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return apiResponseHandler.errorResponse(
        "Please provide valid templateId.",
        req,
        res,
        "Please provide valid templateId.",
        400,
        {}
      );
    }
    const updateData = req.body;
    const data = await updateTemplate(templateId, userId, updateData);
    return apiResponseHandler.successResponse(
      res,
      "Log tempalate updated successfully",
      200,
      []
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const updateTemplateDataSetFormula = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateId } = req.params;
    if (templateId === ":templateId") {
      return apiResponseHandler.errorResponse(
        res,
        "Please provide templateId.",
        400,
        {}
      );
    }
    await updateTemplateFormula(req);
    return apiResponseHandler.successResponse(
      res,
      "Log tempalate data set formula updated successfully",
      200,
      []
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error.message, 400, {});
  }
};

const timePeriodDetails = async (req, res) => {
  try {
    const TimePeriod = TIME_PERIOD;
    return apiResponseHandler.successResponse(
      res,
      "Log time periods",
      200,
      TimePeriod
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const checkUniquness = async (req, res) => {
  let reqData = Object.entries(req.body);
  reqData = reqData ? reqData : "";
  if (reqData.length > 0 && !reqData[0][1]) {
    return apiResponseHandler.errorResponse(
      `Field <${reqData[0][0]}> is required and cannot be empty`,
      req,
      res,
      `Field <${reqData[0][0]}> is required and cannot be empty`,
      400,
      {}
    );
  }
  try {
    const uniqunessCheck = await checkFieldUniqueness(req.body, req.businessUnit);
    if (uniqunessCheck.isunique) {
      return apiResponseHandler.successResponse(
        res,
        "Value is unique",
        200,
        []
      );
    } else {
      return apiResponseHandler.errorResponse(
        `${reqData[0][0]} already exists`,
        req,
        res,
        `${reqData[0][0]} already exists`,
        400,
        {}
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const updateEntryStatus = async (req, res) => {
  try {
    // const { entryId } = req.params;
    const userId = req.userId;
    const reqData = req.body;
    const entryIds = reqData.entryIds ? reqData.entryIds : [];
    const status = reqData ? reqData.status || "" : "";
    const statuses = ENTRY_STATUS_UPDATE || [];
    if (
      (entryIds && Array.isArray(entryIds) && entryIds.some(id => !mongoose.Types.ObjectId.isValid(id))) // Array validation
    ) {
      return apiResponseHandler.errorResponse(
        "Please provide valid entryId(s).",
        req,
        res,
        "Please provide valid entryId(s).",
        400,
        {}
      );
    }
    if (!statuses.includes(status)) {
      return apiResponseHandler.errorResponse(
        "Please provide correct status",
        req,
        res,
        "Please provide correct status",
        400,
        {}
      );
    }
    const statusDetails = await updateStatus(entryIds, userId, reqData);
    if (statusDetails) {
      return apiResponseHandler.successResponse(
        res,
        "Entry status is updated",
        200,
        []
      );
    }
    return apiResponseHandler.errorResponse(
      "Entry status is not updated",
      req,
      res,
      "Entry status is not updated",
      400,
      {}
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const updateEntry = async (req, res) => {
  try {
    const reqData = req.body;
    const userId = req.userId;
    const { entryId } = req.params;
    const entriesUpdated = await updateTheEntries(entryId, userId, reqData);
    if (entriesUpdated) {
      return apiResponseHandler.successResponse(
        res,
        "Entry updated successfully",
        201,
        entriesUpdated._id
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getLogEntryStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { assetId } = req.params;
    if (assetId !== null) {
      const stats = await logEntryStats(userId, assetId);
      return apiResponseHandler.successResponse(res, "Log Stats", 200, stats);
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getAllLogEntries = async (req, res) => {
  try {
    const authUserId = req.userId;
    const validQueries = [
      "assetId",
      "logId",
      "userId",
      "status",
      "page",
      "limit",
      "allData",
      "allDetails",
    ];
    const getQueries = Object.keys(req.query) || [];
    const unmatchedElements = getQueries.filter(
      (item) => !validQueries.includes(item)
    );
    if (unmatchedElements.length > 0) {
      return apiResponseHandler.errorResponse(
        `Please provide correct query.Correct queries are ${validQueries}`,
        req,
        res,
        `Please provide correct query.Correct queries are ${validQueries}`,
        400,
        {}
      );
    }
    const { assetId, logId, userId, status, page, limit, allData, allDetails } = req.query;
    if (process.env.CREATE_LOG_ENTRIES_WHILE_FETCH_BY_ASSIGNEE === "true") {
      if (logId) {
        await createLogentriesForNonRecurrence(logId, null, authUserId);
      }
      else if (assetId) {
        await createLogentriesForNonRecurrence(null, assetId, authUserId);
      }
    }
    let particularUserId;
    if (userId) {
      particularUserId = userId;
    }
    let pNum = page ? page : 1;
    pNum = Number(pNum);
    let pSize = limit ? limit : 15;
    pSize = Number(pSize);
    let query = {
      $or: [],
    };
    if (userId !== null && userId !== undefined) {
      query.$or.push({ operatorIds:{ $in: [userId] } });
      query.$or.push({ createdBy: userId });
      query.$or.push({ approvers:{ $in: [userId] } });
    } else {
      query.$or.push({ operatorIds:{ $in: [ authUserId]} });
      query.$or.push({ createdBy: authUserId });
      query.$or.push({ approvers:{ $in: [ authUserId]} });
    }
    if (logId !== null && logId !== undefined) {
      query.logId = logId;
    }
    if (assetId !== null && assetId !== undefined) {
      query.assetId = assetId;
    }
    if (status) {
      let lcStatus = status.split(",");
      if (lcStatus?.length > 1) {
        let sBody = { $in: [] };
        lcStatus.forEach((item) => {
          if (item.toLowerCase() === "pendingforapproval") {
            sBody["$in"].push("pendingForApproval");
          }
          else if(item.toLowerCase() === "inprogress"){
            sBody["$in"].push("inProgress");
          } else {
            sBody["$in"].push(item.toLowerCase());
          }
        });
        query.status = sBody;
      } else if (lcStatus.length === 1) {
        query.status = status;
        if (status.toLowerCase() === "pendingforapproval") {
          query.status = "pendingForApproval";
        }
        else if(status.toLowerCase() === "inprogress"){
          query.status = "inProgress";
        } else {
          query.status = status.toLowerCase();
        }
      }
    }
    const logQuery = {
      $or: [],
    }
    if (userId !== null && userId !== undefined) {
      logQuery.$or.push({ assignees: {$in:userId} });
      logQuery.$or.push({ createdBy: userId });
      logQuery.$or.push({ approvers: {$in:userId} });
    } else {
      logQuery.$or.push({ assignees: {$in:authUserId} });
      logQuery.$or.push({ createdBy: authUserId });
      logQuery.$or.push({approvers: {$in: authUserId}})
    }
    if (logId !== null && logId !== undefined) {
      logQuery._id = logId;
    }
    if (assetId !== null && assetId !== undefined) {
      logQuery.assetId = assetId;
    }
    const logIds = await logsReturningIds(logQuery)
    query.logIds = {$in:logIds}
    if (logIds?.length > 0) {
      delete query.logId
      delete query['$or']
    }
    const entries = await allEntries(
      query,
      particularUserId,
      pNum,
      pSize,
      allData,
      allDetails
    );
    const entriesData = entries ? entries.data || [] : [];
    if (entries && entriesData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Log entries",
        200,
        entries
      );
    } else {
      return apiResponseHandler.successResponse(
        res,
        "No entries",
        200,
        entriesData
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getEntryDetails = async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await particularEntryDetails(entryId, req.userId);
    return apiResponseHandler.successResponse(res, "Entry details", 200, entry);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const uploadImage = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const { moduleName, moduleId } = req.body;
    const result = { data: [] };
    const { entryId } = req.params;
    const userId = req.userId;
    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          i,
          moduleName,
          moduleId,
          req.userId,
          req.businessUnit,
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
    if (result.failures?.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Files uploaded partially",
        207,
        {}
      );
    }
    if (result.data.length > 0) {
      await uploadEntryImages(result.data, entryId, userId);
    }
    return apiResponseHandler.successResponse(
      res,
      "Uploaded Successfully",
      201,
      {}
    );
  } catch (error) {
    consoel.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const uploadNotes = async (req, res) => {
  try {
    const { entryId } = req.params;
    const data = req.body;
    const userId = req.userId;
    const update = await uploadEntryNotes(data, entryId, userId);
    if (update) {
      return apiResponseHandler.successResponse(
        res,
        "Added Successfully",
        201,
        {}
      );
    }
    apiResponseHandler.errorResponse(
      "Please provide correct entryId",
      req,
      res,
      "Please provide correct entryId",
      400,
      {}
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getImages = async (req, res) => {
  try {
    const { entryId } = req.params;
    const host = req.get("host");
    const protocol = req.protocol;
    const result = await getEntryImages(entryId, host, protocol);
    if (result) {
      return apiResponseHandler.successResponse(res, "All images", 200, result);
    }
    apiResponseHandler.errorResponse(
      "Please provide correct entryId",
      req,
      res,
      "Please provide correct entryId",
      400,
      {}
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getNotes = async (req, res) => {
  try {
    const { entryId } = req.params;
    const result = await getEntryNotes(entryId);
    if (result) {
      return apiResponseHandler.successResponse(res, "All notes", 200, result);
    }
    apiResponseHandler.errorResponse(
      "Please provide correct entryId",
      req,
      res,
      "Please provide correct entryId",
      400,
      {}
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const pauseEntries = async (req, res) => {
  try{
    const logId = req.log;
    if(req.body.reason){
      const pauseEntry = await pauseLogEntries(logId, req.userId, req.body);
      return apiResponseHandler.successResponse(res, "Log Entries Paused Successfully", 200, null);
    }
    else{
      return apiResponseHandler.errorResponse("Please add reason for pause.", req, res, "Please add reason for pause.", 400, {});
    }
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const addImages = async (req, res) => {
  try {
    const isValid = await logManager.validateLogFieldIds(req, res);
    if (!isValid) return;
    const returnMetaData = req.query.returnMetaData;
    const result = { data: [] };

    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          null,
          "logFieldImages",
          req.fieldId,
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
        console.log("Error", error)
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
    if (result.failures?.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Images uploaded partially",
        207,
        result
      );
    }
    const imageIds = result.data.map((image) => image.id);
    await logManager.updateFieldWhenImagesAdded(
      req.fieldId,
      req.logId,
      req.entryId,
      imageIds
    );
    return apiResponseHandler.successResponse(
      res,
      "Images uploaded successfully",
      201,
      result
    );
  } catch (error) {
    console.log("error", error);
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

const fetchLogFieldImages = async (req, res) => {
  try{
    const isValid = await logManager.validateLogFieldIds(req, res);
    if (!isValid) return;
    const reqQuery = req.query;
    const getImages = await logManager.getFieldImages(req.logId,req.entryId,req.fieldId, reqQuery, req.get("host"), req.protocol, req.businessUnit);
    return apiResponseHandler.successResponse(res, "Log Fields Images fetched successfully", 200, getImages);
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

const resumeEntries = async (req, res) => {
  try{
    const logId = req.log;
    const resumeEntry = await resumeLogEntries(logId, req.userId);
    return apiResponseHandler.successResponse(res, "Log Entries Resumed Successfully", 200, null);
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const saveTheEntries = async (req, res) => {
  try{
    const reqData = req.body;
    const userId = req.userId;
    const { entryId } = req.params;
    const entriesUpdated = await saveEntries(entryId, userId, reqData);
    if (entriesUpdated) {
      return apiResponseHandler.successResponse(
        res,
        "Entry put to InProgress successfully",
        200,
        entriesUpdated._id
      );
    }
  }catch(error){
    console.log("error", error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
}


const fetchAllLogs = async (req,res) => {
  try{
    const { page, limit, name } = req.query;
    const getAllLogs = await fetchLogs(req.businessUnit, name, page, limit);
    return apiResponseHandler.successResponse(res, "Logs Fetched Successfully", 200, getAllLogs);
  }catch(error){
    console.log(error);
     return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
}

// new 
const fetchDeviations = async (req, res) => {
  try {
    const result = await getDeviations(req.query);

    return apiResponseHandler.successResponse(
      res,
      "Deviation events fetched successfully",
      200,
      result
    );
  } catch (error) {
    console.log("Fetch deviations error:", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to fetch deviation events",
      400,
      {}
    );
  }
};

module.exports = {
	createLog,
	createTemplate,
  createLogEntry,
	getAllLogs,
	getLogDetails,
	getLogEntries,
	getLogVersions,
	getLogEntryDetails,
	getlogStatusCount,
	getAllTemplates,
	updateLogDetails,
	updateLogStructureDetails,
	versionDetails,
	templateDetails,
	fillLogEntries,
	updateTemplateDetails,
	timePeriodDetails,
	checkUniquness,
	updateEntryStatus,
	updateEntry,
	getLogEntryStats,
	getAllLogEntries,
	getEntryDetails,
	uploadImage,
	uploadNotes,
	getImages,
	getNotes,
  updateTemplateSetPoints,
  updateTemplateDataSetFormula,
  pauseEntries,
  resumeEntries,
  addImages,
  fetchLogFieldImages,
  saveTheEntries,
  fetchAllLogs,
  deleteLog,
  fetchDeviations // new
};
