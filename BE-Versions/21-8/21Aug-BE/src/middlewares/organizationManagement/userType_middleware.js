/**
 * This file will contain the middlewares for valdiating the userType request body
 */
const userTypeManager = require("../../managers/internalManagers/organizationManagement/userType_manager.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");

const validateCreateUserTypeRequestBody = async (req, res, next) => {
  // Validate request
  if (!req.body.name || typeof req.body.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "UserType name must be a non-empty string",
      400,
      null
    );
  }

  if (!req.department) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Department id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }

  if (!req.body.name || typeof req.body.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "UserType name must be a non-empty string",
      400,
      null
    );
  }

  if (!req.businessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit Id must be a non-empty string",
      400,
      null
    );
  }
  // Check if the provided name already exists in the database
  const existingNameUserType =
    await userTypeManager.checkExistingNameForDepartment(
      req.body.name,
      req.department,
      req.businessUnit
    );
  if (existingNameUserType) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! UserType name already exists for the department",
      400,
      null
    );
  }

  if (req.body.isEnabled !== undefined) {
    if (typeof req.body.isEnabled !== "boolean") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! UserType isEnabled should be a boolean",
        400,
        null
      );
    }
  }
  next();
};

const validateUpdateUserTypeRequestBody = async (req, res, next) => {
  // Validate request
  if (req.body.name) {
    if (typeof req.body.name !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "UserType name must be a non-empty string",
        400,
        null
      );
    }

    const existingNameUserType =
      await userTypeManager.checkExistingNameForDepartment(
        req.body.name,
        req.department,
        req.businessUnit
      );
    if (existingNameUserType) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! UserType name already exists for the department",
        400,
        null
      );
    }
    if (req.body.isEnabled !== undefined) {
      if (typeof req.body.isEnabled !== "boolean") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Failed! UserType isEnabled should be a boolean",
          400,
          null
        );
      }
    }
  }
  next();
};

const validateUserType = async (req, res, next) => {

    let reqQuery = req.query || {};
  let reqBody = req.body || {};
  if (reqBody.userType || req.params.userType || reqQuery.userType) {
    // Check if userType is in req.params, reqBody or reqQuery
    if (req.params.userType && typeof req.params.userType === "string") {
      req.userType = req.params.userType;
    }
    // If not, check if userType is in reqBody
    else if (reqBody.userType && typeof reqBody.userType === "string") {
      req.userType = reqBody.userType;
    } else if (reqQuery.userType && typeof reqQuery.userType === "string") {
      req.userType = reqQuery.userType;
    }
    // If userType is not in req.params or reqBody, return an error response
    else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "UserType id must be a non-empty string in req.params or reqBody or reqQuery",
        400,
        null
      );
    }
    // Check if the department with the given ID exists
    let checkExistingUserType = await userTypeManager.checkExistingUserType(
      req.userType,
      req.businessUnit,
      req.department
    );

    if (checkExistingUserType) {
      req.department = checkExistingUserType.department;
      next();
    } else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! User Type does not exist",
        400,
        null
      );
    }
  } else {
    next();
  }
};

const validateUserTypes = async (req, res, next) => {
  if (
    !req.body.userTypes ||
    !Array.isArray(req.body.userTypes) ||
    req.body.userTypes.length === 0
  ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "UserType ids must be a non-empty array of strings",
      400,
      null
    );
  }
  for (let i = 0; i < req.body.userTypes.length; i++) {
    if (typeof req.body.userTypes[i] !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "UserType ids must be a non-empty array of strings",
        400,
        null
      );
    }
  }
  let invalidUserTypes = await userTypeManager.returnInvalidUserTypes(
    req.body.userTypes,
    req.businessUnit
  );
  if (invalidUserTypes.length > 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Invalid UserType ids",
      400,
      { invalidUserTypes }
    );
  }
  next();
};

const validateUserTypesFromQuery = async (req, res, next) => {
  if (req.query.userTypes) {
    //convert the string to array

    let userTypes = req.query.userTypes.split(",");

    if (!userTypes || !Array.isArray(userTypes) || userTypes.length === 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "UserType ids must be a non-empty string with comma separated values",
        400,
        null
      );
    }

    let invalidUserTypes = await userTypeManager.returnInvalidUserTypes(
      userTypes,
      req.businessUnit
    );
    if (invalidUserTypes.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Invalid UserType ids",
        400,
        { invalidUserTypes }
      );
    }

    req.userTypes = userTypes;
  }
  next();
};

const userTypeMiddleWare = {
  validateCreateUserTypeRequestBody: validateCreateUserTypeRequestBody,
  validateUpdateUserTypeRequestBody: validateUpdateUserTypeRequestBody,
  validateUserType: validateUserType,
  validateUserTypes: validateUserTypes,
  validateUserTypesFromQuery: validateUserTypesFromQuery,
};

module.exports = userTypeMiddleWare;
