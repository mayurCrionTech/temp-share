/**
 * This is the controller for the permissionGroup resource
 */
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const permissionGroupManager = require("../../managers/internalManagers/organizationManagement/permissionGroup_manager");
/**
 * Create a permissionGroup
 *
 */

exports.createPermissionGroup = async (req, res) => {
  try {
    const permissionGroupReqObj = createPermissionGroupObject(req);
    const permissionGroup = await permissionGroupManager.createPermissionGroup(
      permissionGroupReqObj
    );
    const message = "PermissionGroup created successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      201,
      permissionGroup
    );
  } catch (error) {
    console.log("Error while creating the permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get all permissionGroups
 *
 */

exports.getAllPermissionGroups = async (req, res) => {

  let reqQuery = req.query || {};
  let reqBody = req.body || {};
  try {
    const permissionGroups =
      await permissionGroupManager.getAllPermissionGroups(
       reqQuery,
      );
    const message = "PermissionGroups fetched successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      200,
      permissionGroups
    );
  } catch (error) {
    console.log("Error while fetching permissionGroups", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get a permissionGroup
 *
 */

exports.getPermissionGroup = async (req, res) => {
  try {
    let populateFields = req.query.populateFields || undefined;
    let selectFields = req.query.selectFields || undefined;

    const permissionGroup = await permissionGroupManager.getPermissionGroup(
      req.params.permissionGroup,
      selectFields,
      populateFields,
    );

    if (!permissionGroup) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "PermissionGroup not found",
        404,
        null
      );
    }
    const message = "PermissionGroup fetched successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      200,
      permissionGroup
    );
  } catch (error) {
    console.log("Error while fetching permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable a permissionGroup
 *
 */

exports.enablePermissionGroup = async (req, res) => {
  try {
    const permissionGroup = await permissionGroupManager.enablePermissionGroup(
      req.params.permissionGroup,
    );
    const message = "PermissionGroup enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable a permissionGroup
 *
 */

exports.disablePermissionGroup = async (req, res) => {
  try {
    const permissionGroup = await permissionGroupManager.disablePermissionGroup(
      req.params.permissionGroup,
    );
    const message = "PermissionGroup disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable permissionGroups
 *
 */

exports.enablePermissionGroups = async (req, res) => {
  try {
    await permissionGroupManager.enablePermissionGroups(
      req.body.permissionGroups,
    );
    const message = "PermissionGroups enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling permissionGroups", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable permissionGroups
 *
 */

exports.disablePermissionGroups = async (req, res) => {
  try {
    await permissionGroupManager.disablePermissionGroups(
      req.body.permissionGroups,
    );
    const message = "PermissionGroups disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling permissionGroups", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete a permissionGroup
 *
 */

exports.deletePermissionGroup = async (req, res) => {
  try {
    await permissionGroupManager.deletePermissionGroup(
      req.params.permissionGroup,
    );
    const message = "PermissionGroup deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete permissionGroups
 *
 */

exports.deletePermissionGroups = async (req, res) => {
  try {
    await permissionGroupManager.deletePermissionGroups(
      req.body.permissionGroups,
    );
    const message = "PermissionGroups deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting permissionGroups", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Update a permissionGroup
 *
 */

exports.updatePermissionGroup = async (req, res) => {
  try {
    const permissionGroupReqObj = updatePermissionGroupObject(req);
    const permissionGroup = await permissionGroupManager.updatePermissionGroup(
      req.params.permissionGroup,
      permissionGroupReqObj,
    );
    const message = "PermissionGroup updated successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while updating permissionGroup", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const createPermissionGroupObject = (req) => {
  return {
    name: req.body.name,
    isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
    createdBy: req.userId,
    updatedBy: req.userId,
  };
};

const updatePermissionGroupObject = (req) => {
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
