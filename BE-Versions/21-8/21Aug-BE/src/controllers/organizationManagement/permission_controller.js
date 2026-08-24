/**
 * This is the controller for the permission resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const permissionManager = require("../../managers/internalManagers/organizationManagement/permission_manager");

/**
 * Create a permission
 *
 */

exports.createPermission = async (req, res) => {
  try {
    const permissionReqObj = createPermissionObject(req);
    const permission = await permissionManager.createPermission(
      permissionReqObj
    );
    const message = "Permission created successfully";
    return apiResponseHandler.successResponse(res, message, 201, permission);
  } catch (error) {
    console.log("Error while creating the permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get all permissions
 *
 */

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await permissionManager.getAllPermissions(
      req.query,
    );
    const message = "Permissions fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, permissions);
  } catch (error) {
    console.log("Error while fetching permissions", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get a permission
 *
 */

exports.getPermission = async (req, res) => {
  try {
    const permission = await permissionManager.getPermission(
      req.params.permission,
      req.query.selectFields,
      req.query.populateFields,
    );

    if (!permission) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Permission not found",
        404,
        null
      );
    }
    const message = "Permission fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, permission);
  } catch (error) {
    console.log("Error while fetching permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable a permission
 *
 */

exports.enablePermission = async (req, res) => {
  try {
    const permission = await permissionManager.enablePermission(
      req.params.permission
    );
    const message = "Permission enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable a permission
 *
 */

exports.disablePermission = async (req, res) => {
  try {
    const permission = await permissionManager.disablePermission(
      req.params.permission
    );
    const message = "Permission disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable permissions
 *
 */

exports.enablePermissions = async (req, res) => {
  try {
    await permissionManager.enablePermissions(req.body.permissions);
    const message = "Permissions enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling permissions", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable permissions
 *
 */

exports.disablePermissions = async (req, res) => {
  try {
    await permissionManager.disablePermissions(req.body.permissions);
    const message = "Permissions disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling permissions", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete a permission
 *
 */

exports.deletePermission = async (req, res) => {
  try {
    await permissionManager.deletePermission(req.params.permission);
    const message = "Permission deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete permissions
 *
 */

exports.deletePermissions = async (req, res) => {
  try {
    await permissionManager.deletePermissions(req.body.permissions);
    const message = "Permissions deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting permissions", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Update a permission
 *
 */

exports.updatePermission = async (req, res) => {
  try {
    const permissionReqObj = updatePermissionObject(req);
    const permission = await permissionManager.updatePermission(
      req.params.permission,
      permissionReqObj
    );
    const message = "Permission updated successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while updating permission", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const createPermissionObject = (req) => {
  return {
    name: req.body.name,
    permissionGroup: req.permissionGroup,
    isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
    createdBy: req.userId,
    updatedBy: req.userId,
  };
};

const updatePermissionObject = (req) => {
  const updateObject = {
    updatedBy: req.userId,
  };
  if (req.body.name) {
    updateObject.name = req.body.name;
  }
  if (req.body.isEnabled !== undefined) {
    updateObject.isEnabled = req.body.isEnabled;
  }
  return updateObject;
};
