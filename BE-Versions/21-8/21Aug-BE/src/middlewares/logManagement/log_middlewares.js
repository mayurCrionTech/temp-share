const { default: mongoose } = require("mongoose");
const { findOne } = require("../../managers/dBManagers/mongoDB_manager");
const logManager = require("../../managers/internalManagers/logManagement/log_manager");
const { Assets } = require("../../models/mongoDB/assetManagement/asset_model");
const Department = require("../../models/mongoDB/organizationManagement/department_model");
const {LogModel} = require("../../models/mongoDB/logManagement/log_model")
const Team = require("../../models/mongoDB/userManagement/team_model");
const user_model = require("../../models/mongoDB/userManagement/user_model");
const File = require("../../models/mongoDB/fileSystem/fileSystem_model");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

const validateRequestBodyData = (req) => {
  const {
    departments = [],
    assignees = [],
    startDateAndTime,
    endDateAndTime,
    name,
    assetId,
    businessUnit,
    // approvers,
    // emailNotificationRecipients,
  } = req;
  let errorMessage = "";
  switch (true) {
    case (departments || []).length === 0:
      errorMessage = "Please choose one or more departments.";
      break;
    case assignees.length === 0:
      errorMessage = "Please assign a user to complete the log";
      break;
    case !startDateAndTime || !endDateAndTime:
      errorMessage = "Please enter both start and end dates and times";
      break;
    case !name:
      errorMessage = "Please enter name.";
      break;
    case !assetId:
      errorMessage = "Please enter assetId";
      break;
    case !businessUnit:
      errorMessage = "Please enter businessUnit";
    // case !approvers:
    //   errorMessage = "Please enter approvers";
    // case !emailNotificationRecipients:
    //     errorMessage = "Please enter emailNotificationRecipients";
      break;
    default:
      return {
        success: true,
        message: "successfully",
      };
  }
  return {
    success: false,
    message: errorMessage,
  };
};
const validateLogReq = async (data, userId) => {
  const {
    assetId,
    departments,
    teams,
    assignees,
    startDateAndTime,
    endDateAndTime,
    isRecurrence,
    recurrenceDetails,
    isScheduleReport,
    scheduledReportDetails,
    approvers,
    emailNotificationRecipients,
    criticalNotificationRecipients,
    businessUnit,
  } = data;

  const validateEntities = async (model, ids = [], errorMessage) => {
    for (let i = 0; i < ids.length; i++) {
      if (!mongoose.Types.ObjectId.isValid(ids[i])) {
        return {
          success: false,
          message: errorMessage,
        };
      }
    }
    if (ids && ids.length > 0) {
      const results = await Promise.all(
        ids.map((id) => findOne(model, { _id: id, businessUnit: new mongoose.Types.ObjectId(businessUnit)  }, {}))
      );
      const invalid = results.some((result) => !result);
      if (invalid) {
        return {
          success: false,
          message: errorMessage,
        };
      }
    }
    return null;
  };

  const validateDate = (dateString, fieldName) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return {
        success: false,
        message: `Please provide valid ${fieldName}`,
      };
    }
    return null;
  };

  const validateRecurrenceBody = (data) => {
    const timePeriod = data.timePeriod ? data.timePeriod : null;
    if (timePeriod === "hour" || timePeriod === "day") {
      const recurrOn = data.recurrOn ? data.recurrOn : null;
      if (recurrOn === null) {
        return {
          success: false,
          message: `Please provide recurrOn detail`,
        };
      }
    } else {
      return {
        success: true,
      };
    }
  };
  const validatescheduledReport = (data) => {
    const timePeriod = data.timePeriod ? data.timePeriod : null;
    if (timePeriod === "day") {
      const recurrOn = data.recurrOn ? data.recurrOn : null;
      if (recurrOn === null) {
        return {
          success: false,
          message: `Please provide recurrOn detail`,
        };
      }
    } else {
      return {
        success: true,
      };
    }
  };

  try {
    if (assetId) {
      if (!mongoose.Types.ObjectId.isValid(assetId)) {
        return {
          success: false,
          message: "Please provide a valid assetId",
        };
      }
      const asset = await findOne(Assets, { _id: assetId }, {});
      if (!asset) {
        return {
          success: false,
          message: "Please provide a valid assetId",
        };
      }
    }

    const departmentValidation = validateEntities(
      Department,
      departments,
      "Please provide valid departments"
    );
    const approversValidation = validateEntities(
      user_model,
      approvers,
      "Please provide valid approvers"
    );
    const emailNotificationRecipientsValidation = validateEntities(
      user_model,
      emailNotificationRecipients,
      "Please provide valid emailNotificationRecipients"
    );
    const criticalNotificationRecipientsValidation = validateEntities(
      user_model,
      criticalNotificationRecipients,
      "Please provide valid criticalNotificationRecipients"
    );
    const teamValidation = validateEntities(
      Team,
      teams,
      "Please provide valid teams"
    );
    const assigneeValidation = validateEntities(
      user_model,
      assignees,
      "Please provide valid assignees"
    );

    const [departmentResult, teamResult, assigneeResult, approverResult, emailNotificationRecipientResult, criticalNotificationRecipientResult] = await Promise.all([
      departmentValidation,
      teamValidation,
      assigneeValidation,
      approversValidation,
      emailNotificationRecipientsValidation,
      criticalNotificationRecipientsValidation,
    ]);

    if (departmentResult) return departmentResult;
    if (teamResult) return teamResult;
    if (assigneeResult) return assigneeResult;
    if(approverResult) return approverResult;
    if(emailNotificationRecipientResult) return emailNotificationRecipientResult;
    if(criticalNotificationRecipientResult) return criticalNotificationRecipientResult;
    if(emailNotificationRecipients && criticalNotificationRecipients){
      const emailSet = new Set(emailNotificationRecipients);
      // Filter out any ID from critical that exists in email
      const duplicates = criticalNotificationRecipients.filter(
      id => emailSet.has(id) || id === userId
      );
      if(duplicates.length > 0 ){
        return {
          success: false,
          message: `The email and critical notification recipients have same user IDs`
        }
      }
    }
    else if(emailNotificationRecipients && emailNotificationRecipients.includes(userId)){
      return {
       success: false,
       message: `The current user ID cannot be in the email notification recipients.`
    };
    } else if(criticalNotificationRecipients &&  criticalNotificationRecipients.includes(userId)) {
       return {
       success: false,
       message: `The current user ID cannot be in the critical notification recipients.`
    };
    }
    let startDateValidation;
    if (startDateAndTime) {
      startDateValidation = validateDate(startDateAndTime, "startDateAndTime");
    }
    let endDateValidation;
    if (endDateAndTime) {
      endDateValidation = validateDate(endDateAndTime, "endDateAndTime");
    }

    if (startDateValidation) return startDateValidation;
    if (endDateValidation) return endDateValidation;
    let recurrValidation;
    if (
      (isRecurrence && !recurrenceDetails) 
      // || (!isRecurrence && recurrenceDetails)
    ) {
      return {
        success: false,
        message: "Please provide valid recurrenceDetails",
      };
    } else if (!isRecurrence){
      delete data.recurrenceDetails;
    }
    else if (isRecurrence && recurrenceDetails) {
      recurrValidation = validateRecurrenceBody(recurrenceDetails);
    }
    if (recurrValidation) return recurrValidation;
    if (!isRecurrence && isScheduleReport) {
      return {
        success: false,
        message: "You can't schedule report without recurrence",
      };
    }
    let scheduledReportValidation;
    if (
      (isScheduleReport && !scheduledReportDetails) ||
      (!isScheduleReport && scheduledReportDetails)
    ) {
      return {
        success: false,
        message: "Please provide valid scheduledReportDetails",
      };
    } else if (isScheduleReport && scheduledReportDetails) {
      scheduledReportValidation = validatescheduledReport(
        scheduledReportDetails
      );
    }
    if (scheduledReportValidation) return scheduledReportValidation;
    return { success: true };
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
};

const validateTemplateStructure = async (data) => {
  try {
    const dataSets = data.dataSets || [];
    const images = data.images || [];
    if (images.length > 0) {
      const imageChecks = await Promise.all(
        images.map((imageId) => findOne(File, { _id: imageId }, {}))
      );
      if (imageChecks.some((doc) => !doc)) {
        return {
          success: false,
          message: "Please provide valid images",
        };
      }
    }

    if (dataSets.length > 0) {
      for (let dataSet of dataSets) {
        let fieldType;
        const { asset: assetId, type, fieldValue = [], isMandatory} = dataSet;
        if (assetId) {
          const asset = await findOne(Assets, { _id: assetId }, {});
          if (!asset) {
            return {
              success: false,
              message: "Please provide correct assetId",
            };
          }
        }
        if (typeof isMandatory !== 'boolean') {
          return {
            success: false,
            message: "isMandatory Field is required and must be a boolean.",
          };
        }

        if(dataSet.type == 'number'){
          await validateTemplateBoundLimit(dataSet)
        }
        // if (!dataSet.hasOwnProperty('isMandatory')) {
        //   dataSet.isMandatory = false;
        // } else if (typeof dataSet.isMandatory !== 'boolean') {
        //   return {
        //     success: false,
        //     message: "The 'isMandatory' field must be a boolean.",
        //   };
        // }

        if (["multiplechoice", "checkboxes", "dropdown"].includes(type)) {
          dataSet.fieldValue = fieldValue.map((item) => ({
            ...item,
            type: fieldType,
            _id: new mongoose.Types.ObjectId().toString(),
          }));
        }
      }

      return {
        success: true,
        dataSets,
      };
    }

    return {
      success: false,
      message: "Please provide valid dataSets",
    };
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
};

const validateLog = async (req, res, next) => {
  try{
  // Check if logId is in req.params
  if (req.params.log && typeof req.params.log === "string") {
    req.log = req.params.log;
  }
  else if (req.params.logId && typeof req.params.logId === "string"){
    req.log = req.params.logId
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
  if (!mongoose.Types.ObjectId.isValid(req.log)) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Log does not exist",
      404,
      null
    );
  }
  const query = { _id: req.log };
  const existingLog = await findOne(LogModel, query);
  if (existingLog) {
    req.logObj = existingLog;
    return next();
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
}catch(error){
  throw error
}
};
const validateLogStructure = async (req, res, next) => {
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
    next();
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
};


const verifyStartDateAndEndDateTime = async (req, res, next) => {
  try {
    if (
      req.body.startDateAndTime ||
      req.body.endDateAndTime
    ) {
      const startAt = req.body.startDateAndTime
        ? new Date(req.body.startDateAndTime)
        : null;
      req.startAt = startAt;
      const endAt = req.body.endDateAndTime
        ? new Date(req.body.endDateAndTime)
        : null;
      req.endAt = endAt;

      const now = new Date();
      const reqStartAtWithoutSeconds = new Date(Date.UTC(req.startAt.getUTCFullYear(), req.startAt.getUTCMonth(), req.startAt.getUTCDate(), req.startAt.getUTCHours(), req.startAt.getUTCMinutes()));
      const nowWithoutSeconds = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()));
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
      if (reqStartAtWithoutSeconds < nowWithoutSeconds) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "The Start Date and time must be after the Current Time",
          400,
          null
        );
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


const validateLogEntries = async(req,res,next) => {
  try{
      if (req.params.logId && req.params.entryId){
          req.logId = req.params.logId;
          req.entryId = req.params.entryId;
          const checkLog = await logManager.checkExistingLogEntries(req.logId ,req.entryId)
          if(checkLog){
              return next();
          }else{
              return apiResponseHandler.errorResponse(null, req,
                  res,
                  `Provide valid LogId`,
                  400,
                  null
              );
          }
      }else{
          return apiResponseHandler.errorResponse(null, req,
              res,
              `Provide logId and entryId field in req.params`,
              400,
              null
          );
      }
  }catch(error){
      throw error;
  }
}

async function validateTemplateBoundLimit(templateField){
  try{
    const LB = templateField.lowerBound ?? null;
    const UB = templateField.upperBound ?? null;
    const CUB = templateField.criticalUpperBound ?? null;
    const CLB = templateField.criticalLowerBound ?? null;
    if(LB && !UB || !LB && UB){
     throw ("Both Lower Bound and Upper Bound are required if one is provided.");
    }
    if(CLB && !CUB || !CLB && CUB){
      throw ("Both Critical Lower Bound and Critical Upper Bound are required if one is provided.");
    }
    if(CLB && CUB && LB && UB ){
      if(CLB > LB ){
       throw ("Critical Lower Bound should be less than or equal to the Lower Bound.");
      }
      if(CUB < UB){
        throw ("Critical Upper Bound should be greater than or equal to the Upper Bound.");
      }
    }
  }catch(error){
  console.error("Validation error:", error.message);
    throw error;
  }
}



module.exports = {
  validateRequestBodyData,
  validateLogReq,
  validateLog,
  validateTemplateStructure,
  validateLogStructure,
  verifyStartDateAndEndDateTime,
  validateLogEntries,
  validateTemplateBoundLimit,
};
