/**
 * This file will contain the middlewares for valdiating the permissionGroup request body
 */

const PermissionGroupManager = require("../../managers/internalManagers/organizationManagement/permissionGroup_manager.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");

const validateCreatePermissionGroupRequestBody = async (req, res, next) => {
  // Validate request


  if (!req.body.name || typeof req.body.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "PermissionGroup name must be a non-empty string",
      400,
      null
    );
  }


  if (req.body.isEnabled !== undefined) {
    if (typeof req.body.isEnabled !== "boolean") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! PermissionGroup isEnabled should be a boolean",
        400,
        null
      );
    }
  }
  next();
};

const validateUpdatePermissionGroupRequestBody = async (req, res, next) => {
  // Validate request

  if (req.body.name) {
    if (typeof req.body.name !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "PermissionGroup name must be a non-empty string",
        400,
        null
      );
    }

    if (req.body.isEnabled !== undefined) {
      if (typeof req.body.isEnabled !== "boolean") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Failed! PermissionGroup isEnabled should be a boolean",
          400,
          null
        );
      }
    }
  }
  next();
};

const validatePermissionGroup = async (req, res, next) => {
  // if(req.params.permissionGroup || req.query.permissionGroup ) {
  //     if (!req.params.permissionGroup || typeof req.params.permissionGroup !== 'string') {
  //         return apiResponseHandler.errorResponse(null, req, 
  //             res,
  //             "PermissionGroup id must be a non-empty string",
  //             400,
  //             null
  //         );
  //     }
  //
  //     else if (!req.query.permissionGroup || typeof req.query.permissionGroup !== 'string') {
  //         return apiResponseHandler.errorResponse(null, req, 
  //             res,
  //             "PermissionGroup 1id must be a non-empty string",
  //             400,
  //             null
  //         );
  //     }
  let reqQuery = req.query || {};
  let reqBody = req.body || {};
  if (
    reqBody.permissionGroup ||
    req.params.permissionGroup ||
    reqQuery.permissionGroup
  ) {
    // Check if permissionGroup is in req.params
    if (
      req.params.permissionGroup &&
      typeof req.params.permissionGroup === "string"
    ) {
      req.permissionGroup = req.params.permissionGroup;
    } else if (
     reqQuery.permissionGroup &&
      typeof reqQuery.permissionGroup === "string"
    ) {
      req.permissionGroup = reqQuery.permissionGroup;
    }
    // If not, check if permissionGroup is in req.body
    else if (
      reqBody.permissionGroup &&
      typeof reqBody.permissionGroup === "string"
    ) {
      req.permissionGroup = reqBody.permissionGroup;
    }
    // If permissionGroup is not in req.params or req.body, return an error response
    else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "PermissionGroup id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }

    let checkExistingPermissionGroup =
      await PermissionGroupManager.checkExistingPermissionGroup(
        req.permissionGroup,
      );
    if (checkExistingPermissionGroup) {
      next();
    } else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! PermissionGroup does not exist",
        400,
        null
      );
    }
  } else {
    next();
  }
};

const validatePermissionGroups = async (req, res, next) => {

    let reqQuery = req.query || {};
  let reqBody = req.body || {};
  if (
    !reqBody.permissionGroups ||
    !Array.isArray(reqBody.permissionGroups) ||
    reqBody.permissionGroups.length === 0
  ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "PermissionGroup ids must be a non-empty array of strings",
      400,
      null
    );
  }
  for (let i = 0; i < reqBody.permissionGroups.length; i++) {
    if (typeof reqBody.permissionGroups[i] !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "PermissionGroup ids must be a non-empty array of strings",
        400,
        null
      );
    }
  }

  let invalidPermissionGroups =
    await PermissionGroupManager.returnInvalidPermissionGroups(
      reqBody.permissionGroups,
    );
  if (invalidPermissionGroups.length > 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Invalid PermissionGroup ids",
      400,
      { invalidPermissionGroups }
    );
  }
  next();
};

const verifyPermissionGroupReqBody = {
  validateCreatePermissionGroupRequestBody:
    validateCreatePermissionGroupRequestBody,
  validateUpdatePermissionGroupRequestBody:
    validateUpdatePermissionGroupRequestBody,
  validatePermissionGroup: validatePermissionGroup,
  validatePermissionGroups: validatePermissionGroups,
};

module.exports = verifyPermissionGroupReqBody;
