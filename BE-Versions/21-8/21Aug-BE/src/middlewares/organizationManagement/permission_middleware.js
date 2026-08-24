/**
 * This file will contain the middlewares for valdiating the permission request body
 */
const PermissionManager = require("../../managers/internalManagers/organizationManagement/permission_manager.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");

const validateCreatePermissionRequestBody = async (req, res, next) => {
  // Validate request
  if (!req.body.name || typeof req.body.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Permission name must be a non-empty string",
      400,
      null
    );
  }
  if (!req.permissionGroup) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Permission group id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }

  // Check if the provided name already exists in the database
  const existingNamePermission =
    await PermissionManager.checkExistingNameForPermissionGroup(
      req.body.name,
      req.permissionGroup,
    );
  if (existingNamePermission) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Permission name already exists for the permission group",
      400,
      null
    );
  }

  if (req.body.isEnabled !== undefined) {
    if (typeof req.body.isEnabled !== "boolean") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Permission isEnabled should be a boolean",
        400,
        null
      );
    }
  }
  next();
};

const validateUpdatePermissionRequestBody = async (req, res, next) => {
  // Validate request
  if (req.body.name) {
    if (typeof req.body.name !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Permission name must be a non-empty string",
        400,
        null
      );
    }

    const existingNamePermission =
      await PermissionManager.checkExistingNameForPermissionGroup(
        req.body.name,
        req.permissionGroup,
      );
    if (existingNamePermission) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Permission name already exists for the permission group",
        400,
        null
      );
    }
    if (req.body.isEnabled !== undefined) {
      if (typeof req.body.isEnabled !== "boolean") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Failed! Permission isEnabled should be a boolean",
          400,
          null
        );
      }
    }
  }
  next();
};

const validatePermission = async (req, res, next) => {
  // Check if permission is in req.params
  if (req.params.permission && typeof req.params.permission === "string") {
    req.permission = req.params.permission;
  }
  // If not, check if permission is in req.body
  else if (req.body.permission && typeof req.body.permission === "string") {
    req.permission = req.body.permission;
  }
  // If permission is not in req.params or req.body, return an error response
  else {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Permission id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }

  let checkExistingPermission = await PermissionManager.checkExistingPermission(
    req.params.permission,
    req.permissionGroup
  );
  if (checkExistingPermission) {
    req.permissionGroup = checkExistingPermission.permissionGroup;
    next();
  } else {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Permission does not exist",
      400,
      null
    );
  }
};

const validatePermissions = async (req, res, next) => {
  if (req.body.permissions) {
    if (
      !req.body.permissions ||
      !Array.isArray(req.body.permissions) ||
      req.body.permissions.length === 0
    ) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Permission ids must be a non-empty array of strings",
        400,
        null
      );
    }

    const uniquePermissions = new Set();
    const duplicatePermissions = [];

    for (let i = 0; i < req.body.permissions.length; i++) {
      const permissionId = req.body.permissions[i];

      if (typeof permissionId !== "string") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Permission ids must be a non-empty array of strings",
          400,
          null
        );
      }

      // Check for duplicate permission IDs
      if (uniquePermissions.has(permissionId)) {
        duplicatePermissions.push(permissionId);
      } else {
        uniquePermissions.add(permissionId);
      }
    }

    if (duplicatePermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Duplicate permission ids are not allowed",
        400,
        { duplicatePermissions }
      );
    }

    let invalidPermissions = await PermissionManager.returnInvalidPermissions(
      Array.from(uniquePermissions),
    );

    if (invalidPermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Invalid Permission ids",
        400,
        { invalidPermissions }
      );
    }
  }

  next();
};

const validateMultiplePermissionsForDesignationsUpdateArray = async (req, res, next) => {
  if (req.body.designations) {
    const permissions = req.body.designations.map((designation) => designation.permissions);

    // Keep only distinct permissions from permissions by using set and keep it in an array
    if (permissions.length > 0) {
      const uniquePermissionsSet = new Set();
      const duplicatePermissions = [];

      const allPermissions = permissions.flat();

      allPermissions.forEach((permissionId) => {
        if (uniquePermissionsSet.has(permissionId)) {
          duplicatePermissions.push(permissionId);
        } else {
          uniquePermissionsSet.add(permissionId);
        }
      });

      if (duplicatePermissions.length > 0) {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Duplicate permission ids are not allowed",
          400,
          { duplicatePermissions }
        );
      }

      const uniquePermissions = Array.from(uniquePermissionsSet);
      let invalidPermissions = await PermissionManager.returnInvalidPermissions(
        uniquePermissions,
      );

      if (invalidPermissions.length > 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Permission ids", 400, {
          invalidPermissions
        });
      }
    }
  }
  next();
};


const validatePositivePermissions = async (req, res, next) => {
  if (req.body.positivePermissions) {
    if (
      !req.body.positivePermissions ||
      !Array.isArray(req.body.positivePermissions)
    ) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Positive Permission ids must be a non-empty array of strings",
        400,
        null
      );
    }

    const uniquePositivePermissions = new Set();
    const duplicatePositivePermissions = [];

    for (let i = 0; i < req.body.positivePermissions.length; i++) {
      const positivePermissionId = req.body.positivePermissions[i];

      if (typeof positivePermissionId !== "string") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Positive Permission ids must be a non-empty array of strings",
          400,
          null
        );
      }

      // Check for duplicate permission IDs
      if (uniquePositivePermissions.has(positivePermissionId)) {
        duplicatePositivePermissions.push(positivePermissionId);
      } else {
        uniquePositivePermissions.add(positivePermissionId);
      }
    }

    if (duplicatePositivePermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Duplicate positive permission ids are not allowed",
        400,
        { duplicatePositivePermissions }
      );
    }

    let invalidPositivePermissions =
      await PermissionManager.returnInvalidPermissions(
        Array.from(uniquePositivePermissions),
      );

    if (invalidPositivePermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Invalid positive Permission ids",
        400,
        { invalidPositivePermissions }
      );
    }
  }

  next();
};

const validateNegativePermissions = async (req, res, next) => {
  if (req.body.negativePermissions) {
    if (
      !req.body.negativePermissions ||
      !Array.isArray(req.body.negativePermissions)
    ) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Negative Permission ids must be a non-empty array of strings",
        400,
        null
      );
    }

    const uniqueNegativePermissions = new Set();
    const duplicateNegativePermissions = [];

    for (let i = 0; i < req.body.negativePermissions.length; i++) {
      const negativePermissionId = req.body.negativePermissions[i];

      if (typeof negativePermissionId !== "string") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Negative Permission ids must be a non-empty array of strings",
          400,
          null
        );
      }

      // Check for duplicate permission IDs
      if (uniqueNegativePermissions.has(negativePermissionId)) {
        duplicateNegativePermissions.push(negativePermissionId);
      } else {
        uniqueNegativePermissions.add(negativePermissionId);
      }
    }

    if (duplicateNegativePermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Duplicate negative permission ids are not allowed",
        400,
        { duplicateNegativePermissions }
      );
    }

    let invalidNegativePermissions =
      await PermissionManager.returnInvalidPermissions(
        Array.from(uniqueNegativePermissions),
      );

    if (invalidNegativePermissions.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Invalid negative Permission ids",
        400,
        { invalidNegativePermissions }
      );
    }
  }

  next();
};

const validatePositivePermissionsArray = (req, res, next) => {
  try {
    for (const permission of req.body.userPermissions) {
      if (
        permission.positivePermissions &&
        (!Array.isArray(permission.positivePermissions) ||
          permission.positivePermissions.length === 0)
      ) {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Positive Permissions must be a non-empty array of strings in each permission object",
          400,
          null
        );
      }

      if (permission.positivePermissions) {
        for (const positivePermissionId of permission.positivePermissions) {
          if (typeof positivePermissionId !== "string") {
            return apiResponseHandler.errorResponse(null, req,
              res,
              "Positive Permission ids must be a non-empty array of strings in each permission object",
              400,
              null
            );
          }
        }
      }
    }
    next();
  } catch (error) {
    console.log("Error validating positive permissions:", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const validateNegativePermissionsArray = (req, res, next) => {
  try {
    for (const permission of req.body.userPermissions) {
      if (
        permission.negativePermissions &&
        (!Array.isArray(permission.negativePermissions) ||
          permission.negativePermissions.length === 0)
      ) {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Negative Permissions must be a non-empty array of strings in each permission object",
          400,
          null
        );
      }

      if (permission.negativePermissions) {
        for (const negativePermissionId of permission.negativePermissions) {
          if (typeof negativePermissionId !== "string") {
            return apiResponseHandler.errorResponse(null, req,
              res,
              "Negative Permission ids must be a non-empty array of strings in each permission object",
              400,
              null
            );
          }
        }
      }
    }
    next();
  } catch (error) {
    console.log("Error validating negative permissions:", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const permissionMiddleware = {
  validateCreatePermissionRequestBody: validateCreatePermissionRequestBody,
  validateUpdatePermissionRequestBody: validateUpdatePermissionRequestBody,
  validatePermission: validatePermission,
  validatePermissions: validatePermissions,
  validatePositivePermissions: validatePositivePermissions,
  validateNegativePermissions: validateNegativePermissions,
  validatePositivePermissionsArray: validatePositivePermissionsArray,
  validateNegativePermissionsArray: validateNegativePermissionsArray,
  validateMultiplePermissionsForDesignationsUpdateArray:
    validateMultiplePermissionsForDesignationsUpdateArray,
};

module.exports = permissionMiddleware;
