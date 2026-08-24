/**
 * This file will contain the middlewares for valdiating the business unit request body
 */
/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
*/
const mongoose = require("mongoose");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager.js");
const { LogModel } = require("../../models/mongoDB/logManagement/log_model"); //CR0013
const validateCreateBusinessUnitRequestBody = async (req, res, next) => {
    let reqQuery = req.query || {};
  let reqBody = req.body || {};
  // Validate request
  if (!reqBody.name || typeof reqBody.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit name must be a non-empty string",
      400,
      null
    );
  }

  if ( !req.organizationObj ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Organization not found",
      400,
      null
    );
  }

  if (
    !reqBody.shortName ||
    typeof reqBody.shortName !== "string" ||
    reqBody.shortName.length > 3
  ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit shortName must be a non-empty string with a maximum length of 3 characters",
      400,
      null
    );
  }
  reqBody.shortName = reqBody.shortName.toUpperCase();
  // Check if the provided name already exists in the database
  const existingNameBusinessUnit =
    await businessUnitManager.getBusinessUnitByName(reqBody.name, "", req.organization);
  if (existingNameBusinessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! BusinessUnit name already exists",
      400,
      null
    );
  }
  // Check if the provided shortName already exists in the database
  const existingShortNameBusinessUnit =
    await businessUnitManager.getBusinessUnitByShortName(reqBody.shortName,"", req.organization);
  if (existingShortNameBusinessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! BusinessUnit shortName already exists",
      400,
      null
    );
  }

  if (reqBody.isEnabled !== undefined) {
    if (typeof reqBody.isEnabled !== "boolean") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! BusinessUnit isEnabled should be a boolean",
        400,
        null
      );
    }
  }
  next();
};

// const validateUpdateBusinessUnitRequestBody = async (req, res, next) => {
//   console.log("reqBody",reqBody);
//   // Validate request
//   if (reqBody.name) {
//     if (typeof reqBody.name !== "string") {
//       return apiResponseHandler.errorResponse(null, req,
//         res,
//         "BusinessUnit name must be a non-empty string",
//         400,
//         null
//       );
//     }
//     // Check if the provided name already exists in the database
//     const existingNameBusinessUnit =
//       await businessUnitManager.getBusinessUnitByName(reqBody.name, "", reqBody.organization);
//       console.log("existingNameBusinessUnit",existingNameBusinessUnit);
//     if (existingNameBusinessUnit) {
//       return apiResponseHandler.errorResponse(null, req,
//         res,
//         "Failed! BusinessUnit name already exists",
//         400,
//         null
//       );
//     }
//   }
//   if (reqBody.shortName) {
//     if (
//       typeof reqBody.shortName !== "string" ||
//       reqBody.shortName.length > 3
//     ) {
//       return apiResponseHandler.errorResponse(null, req,
//         res,
//         "BusinessUnit shortName must be a non-empty string with a maximum length of 3 characters",
//         400,
//         null
//       );
//     }
//     reqBody.shortName = reqBody.shortName.toUpperCase();
//     // Check if the provided shortName already exists in the database
//     const existingShortNameBusinessUnit =
//       await businessUnitManager.getBusinessUnitByShortName(reqBody.shortName,"", reqBody.organization);
//     if (existingShortNameBusinessUnit) {
//       return apiResponseHandler.errorResponse(null, req,
//         res,
//         "Failed! BusinessUnit shortName already exists",
//         400,
//         null
//       );
//     }
//   }
//   if (reqBody.isEnabled !== undefined) {
//     if (typeof reqBody.isEnabled !== "boolean") {
//       return apiResponseHandler.errorResponse(null, req,
//         res,
//         "Failed! BusinessUnit isEnabled should be a boolean",
//         400,
//         null
//       );
//     }
//   }
//   next();
// };
const validateUpdateBusinessUnitRequestBody = async (req, res, next) => {
    let reqQuery = req.query || {};
  let reqBody = req.body || {};

  const businessUnitId = req.params.businessUnit || reqBody.businessUnit;
  if (!businessUnitId) {
    return apiResponseHandler.errorResponse(null, req, res, "BusinessUnit ID is required for update", 400, null);
  }

  // Fetch existing BU from DB
  const existingBusinessUnit = await businessUnitManager.getBusinessUnit(businessUnitId,"name shortName");
  console.log("existingBusinessUnit", existingBusinessUnit);
  if (!existingBusinessUnit) {
    return apiResponseHandler.errorResponse(null, req, res, "BusinessUnit not found", 404, null);
  }

  // Validate `name`
  if (reqBody.name) {
    if (typeof reqBody.name !== "string") {
      return apiResponseHandler.errorResponse(null, req, res, "BusinessUnit name must be a non-empty string", 400, null);
    }

    if (reqBody.name !== existingBusinessUnit.name) {

      const existingNameBusinessUnit = await businessUnitManager.getBusinessUnitByName(reqBody.name, "", reqBody.organization);
      if (existingNameBusinessUnit) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! BusinessUnit name already exists", 400, null);
      }
    }
  }

  // Validate `shortName`
  if (reqBody.shortName) {
    if (typeof reqBody.shortName !== "string" || reqBody.shortName.length > 3) {
      return apiResponseHandler.errorResponse(null, req, res, "BusinessUnit shortName must be a non-empty string with a maximum length of 3 characters", 400, null);
    }

    const formattedShortName = reqBody.shortName.toUpperCase();
    reqBody.shortName = formattedShortName;

    if (formattedShortName !== existingBusinessUnit.shortName) {
      const existingShortNameBusinessUnit = await businessUnitManager.getBusinessUnitByShortName(formattedShortName, "", reqBody.organization);
      if (existingShortNameBusinessUnit) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! BusinessUnit shortName already exists", 400, null);
      }
    }
  }

  // Validate `isEnabled`
  if (reqBody.isEnabled !== undefined && typeof reqBody.isEnabled !== "boolean") {
    return apiResponseHandler.errorResponse(null, req, res, "Failed! BusinessUnit isEnabled should be a boolean", 400, null);
  }

  next();
};

const validateBusinessUnit = async (req, res, next) => {
  // Validate request
  if (!req.params.businessUnit || typeof req.params.businessUnit !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit id must be a non-empty string",
      400,
      null
    );
  }
  let checkExistingBusinessUnit = await businessUnitManager.getBusinessUnit(
    req.params.businessUnit
  );
  if (checkExistingBusinessUnit) {
    next();
  } else {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! BusinessUnit does not exist",
      400,
      null
    );
  }
};

const validateBusinessUnits = async (req, res, next) => {
    let reqQuery = req.query || {};
  let reqBody = req.body || {};
  // Validate request
  if (
    !reqBody.businessUnits ||
    !Array.isArray(reqBody.businessUnits) ||
    reqBody.businessUnits.length === 0
  ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit ids must be a non-empty array of strings",
      400,
      null
    );
  }
  for (let i = 0; i < reqBody.businessUnits.length; i++) {
    if (typeof reqBody.businessUnits[i] !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "BusinessUnit ids must be a non-empty array of strings",
        400,
        null
      );
    }
  }
  let invalidBusinessUnits =
    await businessUnitManager.returnInvalidBusinessUnits(
      reqBody.businessUnits
    );
  if (invalidBusinessUnits.length > 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! BusinessUnits do not exist",
      400,
      { invalidBusinessUnits }
    );
  }
  next();
};

const verifyBusinessUnit = async (req, res, next) => {
  // Validate request
  let reqQuery = req.query || {};
  let reqBody = req.body || {};
  req.businessUnit = req.isSuperAdmin
    ? reqQuery.businessUnit || reqBody.businessUnit
    : req.businessUnit
      ? req.businessUnit
      : reqQuery.businessUnit;
  if (!req.isSuperAdmin) {
    if (!req.businessUnit) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "BusinessUnit Id must be a non-empty string",
        400,
        null
      );
    }
  }
  if (req.isSuperAdmin === false) {
    const existingBusinessUnit =
      await businessUnitManager.checkExistingBusinessUnit(req.businessUnit);
    if (!existingBusinessUnit) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! BusinessUnit does not exist",
        400,
        null
      );
    }
  } else if (req.businessUnit !== undefined && req.isSuperAdmin === true) {
    const existingBusinessUnit =
      await businessUnitManager.checkExistingBusinessUnit(req.businessUnit);
    if (!existingBusinessUnit) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! BusinessUnit does not exist",
        400,
        null
      );
    }
  }
  // convert req.businessUnit to mongodb object id
  if (typeof req.businessUnit === "string") req.businessUnit = new mongoose.Types.ObjectId(req.businessUnit)
  next();
};

// CR0013
const checkLogBodyDepartmentAccess = (req, res, next) => {
  const userDepartment = req.department;
  const bodyDepartments = req.body.departments;

  if (!bodyDepartments || bodyDepartments.length === 0) {
    return apiResponseHandler.errorResponse(
      null, req, res,
      "No department provided",
      400
    );
  }

  const hasAccess = bodyDepartments.some((dept) => dept === userDepartment);

  if (!hasAccess) {
    return apiResponseHandler.errorResponse(
      null, req, res,
      "Forbidden! You can only create a log for your own department",
      403
    );
  }

  next();
};

const checkLogDepartmentAccess = (req, res, next) => {
  const userDepartment = req.department;
  const logDepartments = req.logObj.departments;

  if (!logDepartments || logDepartments.length === 0) {
    return apiResponseHandler.errorResponse(
      null, req, res,
      "Log has no department assigned",
      400
    );
  }

  //  plain string comparison (departments is [String] not [ObjectId])
  const hasAccess = logDepartments.some((dept) => dept === userDepartment);

  if (!hasAccess) {
    return apiResponseHandler.errorResponse(
      null, req, res,
      "Forbidden! You do not have access to this log",
      403
    );
  }

  next();
};

const checkLogBulkDepartmentAccess = async (req, res, next) => {
  try {
    const userDepartment = req.department;
    const logIds = req.body.logIds;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return apiResponseHandler.errorResponse(null, req, res, "No log ids provided", 400);
    }

    const logs = await LogModel.find(
      { _id: { $in: logIds } },
      { departments: 1 }
    );

    if (logs.length !== logIds.length) {
      return apiResponseHandler.errorResponse(null, req, res, "One or more logs not found", 404);
    }

    const unauthorizedLogs = [];

    for (const log of logs) {
      if (!log.departments || log.departments.length === 0) {
        return apiResponseHandler.errorResponse(
          null, req, res,
          `Log ${log._id} has no department assigned`,
          400
        );
      }

      //  plain string comparison since departments is [String]
      const hasAccess = log.departments.some((dept) => dept === userDepartment);

      if (!hasAccess) unauthorizedLogs.push(log._id);
    }

    if (unauthorizedLogs.length > 0) {
      return apiResponseHandler.errorResponse(
        null, req, res,
        `Forbidden! You do not have access to logs: ${unauthorizedLogs.join(", ")}`,
        403
      );
    }

    next();
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, "Error checking log access", 500);
  }
};
//CR0013

const verifyFetchBusinessUser = async (req, res, next) => {
  if (!req.params.businessUnit || typeof req.params.businessUnit !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit id must be a non-empty string",
      400,
      null
    );
  } else if (!mongoose.Types.ObjectId.isValid(req.params.businessUnit)) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Please enter a valid BusinessUnit id",
      400,
      null
    );
  } else next();
};

const verifyBusinessUnitForSignIn = async (req, res, next) => {
    let reqQuery = req.query || {};
  let reqBody = req.body || {};
  req.businessUnit = reqBody.businessUnit;
  if (!req.businessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit Id must be a non-empty string",
      400,
      null
    );
  } else {
    let existingBusinessUnit = await businessUnitManager.getBusinessUnit(
      req.businessUnit
    );
    if (!existingBusinessUnit) {
      existingBusinessUnit = await businessUnitManager.getBusinessUnitByName(
        req.businessUnit
      );
    }
    req.businessUnitObj = existingBusinessUnit;
    if (!existingBusinessUnit) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! BusinessUnit does not exist",
        400,
        null
      );
    }
  }
  next();
};

const businessUnitMiddleware = {
  validateCreateBusinessUnitRequestBody: validateCreateBusinessUnitRequestBody,
  validateBusinessUnit: validateBusinessUnit,
  validateBusinessUnits: validateBusinessUnits,
  validateUpdateBusinessUnitRequestBody: validateUpdateBusinessUnitRequestBody,
  verifyBusinessUnit: verifyBusinessUnit,
  verifyBusinessUnitForSignIn: verifyBusinessUnitForSignIn,
  verifyFetchBusinessUser: verifyFetchBusinessUser,
  checkLogBodyDepartmentAccess, //CR0013
  checkLogDepartmentAccess, //CR0013
  checkLogBulkDepartmentAccess //CR0013

};
module.exports = businessUnitMiddleware;
