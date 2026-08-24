const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const {
  checklistCreation,
  templateCreation,
  checklistWithAllDetails,
  getChecklist,
  getEntries,
  getVersions,
  entryDetails,
  checklistCount,
  getTemplates,
  updateChecklist,
  updateChecklistStructure,
  getVersionDetails,
  getTemplateDetails,
  fillTheEntries,
  updateTemplate,
  checkFieldUniqueness,
  updateStatus,
  updateTheEntries,
} = require("../../managers/internalManagers/checklistManagement/checklist_manager");
const { TIME_PERIOD, ENTRY_STATUS_UPDATE } = require("../../utils/constants");

/**
 * Controller function for adding general details for a checklist.
 * This function handles the creation of a new checklist document based on the provided request body.
 * It retrieves previous checklists, calculates the new checklist number, and creates a new checklist document.
 * Handles errors such as validation errors, duplicate key errors, and server-side errors.
 * @param {object} req - Request object containing checklist general details data in the body
 * @param {object} res - Response object for sending JSON response (name,checklistNumber,description,documentNumber,assetId,departments,teams,assignees,startDateAndTime,endDateAndTime,isRecurrence,recurrenceDataId,timePeriod,checklistStatus,isScheduleReport,scheduleReportDataId,isStaticChecklistTemplate,createdBy,updatedBy,isArchived,deleteTime)
 * @returns {object} - JSON response indicating the success or failure of the checklist creation
 */
const createChecklist = async (req, res) => {
  try {
    const userId = req.userId;
    const reqData = req.body;
    const { isDraft } = req.query;
    if (isDraft === undefined) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        `Please add isDraft query in request query`
      );
    }
    const checkListDoc = await checklistCreation(reqData, userId, isDraft);
    return apiResponseHandler.successResponse(
      res,
      "Checklist created successfully",
      201,
      { checklistId: checkListDoc }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((error) => error.message);
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        "Validation error: " + errors.join(", ")
      );
    } else if (error.code === 11000 && error.keyPattern && error.keyValue) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        `Duplicate key error: ${duplicateKey} already exists.`
      );
    } else {
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        error
      );
    }
  }
};

/**
 * Controller function for creating a template for a checklist.
 * @param {object} req - Request object containing checklist template data in the body and checklistId in the parameters
 * @param {object} res - Response object for sending JSON response
 * @returns {object} - JSON response indicating success or failure
 */
const createTemplate = async (req, res) => {
  try {
    const reqData = req.body;
    const userId = req.userId;
    const { checklistId, isGeneralTemplate } = req.query;
    if (isGeneralTemplate === "false" && checklistId === undefined) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide checklistId in request query"
      );
    }
    if (isGeneralTemplate === undefined) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide isGeneralTemplate status in request query"
      );
    }
    const result = await templateCreation(
      reqData,
      userId,
      checklistId,
      isGeneralTemplate
    );
    return apiResponseHandler.successResponse(
      res,
      "Template has been saved successfully.",
      201,
      result
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

/**
 * Controller function for retrieving all checklists with all details.
 * @param {object} req - Request object (unused)
 * @param {object} res - Response object for sending JSON response
 * @returns {object} - JSON response containing checklists or error message
 */
const getAllChecklists = async (req, res) => {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;
    const checklists = await checklistWithAllDetails(userId, page, limit);
    if (!checklists) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "client side error",
        400,
        "No checklist are available"
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "checklists",
      200,
      checklists
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "client side error", 400, error);
  }
};

const getChecklistDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { checklistId } = req.params;
    if (checklistId === ":checklistId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide checklistId."
      );
    }
    const checklist = await getChecklist(checklistId, userId);
    return apiResponseHandler.successResponse(
      res,
      "Checklist details",
      200,
      checklist
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const getChecklistEntries = async (req, res) => {
  try {
    const userId = req.userId;
    let { status } = req.query;
    const { checklistId } = req.params;
    const { page, limit } = req.query;
    if (checklistId === ":checklistId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide checklist Id."
      );
    }
    let pNum = page ? page : 1;
    let pSize = limit ? limit : 15;
    let sort = { createdAt: "desc" };
    status = status !== undefined ? status : "";
    const entries = await getEntries(checklistId, userId, pNum, pSize, status);
    const entriesData = entries ? entries.data || [] : [];
    if (entriesData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Entries related to the checklist",
        200,
        entries
      );
    } else {
      return apiResponseHandler.successResponse(res, "No entries", 200, []);
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const getChecklistVersions = async (req, res) => {
  try {
    const userId = req.userId;
    const { checklistId } = req.params;
    const { page, limit } = req.query;
    if (checklistId === ":checklistId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide checklist Id."
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
    const versions = await getVersions(checklistId, userId, paginationDetails);
    const versionssData = versions ? versions.data || [] : [];
    if (versionssData.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Checklist versions",
        200,
        versions
      );
    }
    return apiResponseHandler.successResponse(res, "No versions", 404, []);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const getChecklistEntryDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { entryId } = req.params;
    if (entryId === ":entryId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide entryId."
      );
    }
    const entryWithChecklistDetails = await entryDetails(entryId, userId);
    if (!entryWithChecklistDetails) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "No entries available"
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Checklist entry details",
      200,
      entryWithChecklistDetails
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "client side error",
      400,
      "Add correct entryId"
    );
  }
};

const getchecklistStatusCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await checklistCount(userId);
    return apiResponseHandler.successResponse(
      res,
      "Checklist status count details",
      200,
      count
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
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
    const templates = await getTemplates(paginationDetails);
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
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const updateChecklistDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { checklistId } = req.params;
    if (checklistId === ":checklistId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide checklistId."
      );
    }
    const updateData = req.body;
    await updateChecklist(checklistId, userId, updateData);
    return apiResponseHandler.successResponse(
      res,
      "Checklist update",
      200,
      "Checklist updated successfully"
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((error) => error.message);
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        "Validation error: " + errors.join(", ")
      );
    } else if (error.code === 11000 && error.keyPattern && error.keyValue) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        `Duplicate key error: ${duplicateKey} already exists.`
      );
    } else {
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Client side error",
        400,
        error
      );
    }
  }
};

const updateChecklistStructureDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { structureId } = req.params;
    if (structureId === ":structureId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide structureId."
      );
    }
    const updateData = req.body;
    const data = await updateChecklistStructure(
      structureId,
      userId,
      updateData
    );
    return apiResponseHandler.successResponse(
      res,
      "Checklist structure updated successfully",
      200,
      data
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

// const deleteChecklist = async (req,res) =>{
//   const {checklistId} =  req.params
//   const userId =  req.userId
//   try{
//     const data =  await deleteAndTransferChecklist(checklistId,userId)
//     if(data){
//       return apiResponseHandler.successResponse(
//         res,
//         "Checklist deleted successfully",
//         200,
//         data
//       );
//     }

//   }
//   catch(err){
//     console.log(err)
//     return apiResponseHandler.errorResponse(error, req, res, "Server side error", 500, err);
//   }
// }

const versionDetails = async (req, res) => {
  try {
    const { structureId } = req.params;
    if (structureId === ":structureId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide structureId."
      );
    }
    const result = await getVersionDetails(structureId);
    if (!result) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "No version details available"
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
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const templateDetails = async (req, res) => {
  try {
    const { templateId } = req.params;
    if (templateId === ":templateId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide templateId."
      );
    }
    const result = await getTemplateDetails(templateId);
    if (!result) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "No template exists"
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
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const fillChecklistEntries = async (req, res) => {
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
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const updateTemplateDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateId } = req.params;
    if (templateId === ":templateId") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide templateId."
      );
    }
    const updateData = req.body;
    const data = await updateTemplate(templateId, userId, updateData);
    return apiResponseHandler.successResponse(
      res,
      "Checklist tempalate updated successfully",
      200,
      []
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const timePeriodDetails = async (req, res) => {
  try {
    const TimePeriod = TIME_PERIOD;
    return apiResponseHandler.successResponse(
      res,
      "Checklist time periods",
      200,
      TimePeriod
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const checkUniquness = async (req, res) => {
  let reqData = Object.entries(req.body);
  reqData = reqData ? reqData : "";
  if (reqData.length > 0 && !reqData[0][1]) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Client side error",
      400,
      `Field <${reqData[0][0]}> is required and cannot be empty`
    );
  }
  try {
    const uniqunessCheck = await checkFieldUniqueness(req.body);
    if (uniqunessCheck.isunique) {
      return apiResponseHandler.successResponse(
        res,
        "Value is unique",
        200,
        []
      );
    } else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        `${reqData[0][0]} already exists`
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

const updateEntryStatus = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.userId;
    const reqData = req.body;
    const status = reqData ? reqData.status || "" : "";
    const statuses = ENTRY_STATUS_UPDATE || [];
    if (!statuses.includes(status)) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Client side error",
        400,
        "Please provide correct status"
      );
    }
    const statusDetails = await updateStatus(entryId, userId, reqData);
    if (statusDetails) {
      return apiResponseHandler.successResponse(
        res,
        "Entry status is updated",
        200,
        []
      );
    }
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Client side error",
      400,
      "Entry status is not updated"
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
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
    return apiResponseHandler.errorResponse(error, req, res, "Client side error", 400, error);
  }
};

module.exports = {
  createChecklist,
  createTemplate,
  getAllChecklists,
  getChecklistDetails,
  getChecklistEntries,
  getChecklistVersions,
  getChecklistEntryDetails,
  getchecklistStatusCount,
  getAllTemplates,
  updateChecklistDetails,
  updateChecklistStructureDetails,
  versionDetails,
  templateDetails,
  fillChecklistEntries,
  updateTemplateDetails,
  timePeriodDetails,
  checkUniquness,
  updateEntryStatus,
  updateEntry,
};
