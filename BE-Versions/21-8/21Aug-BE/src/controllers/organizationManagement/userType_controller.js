/**
 * This is the controller for the userType resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const userTypeManager = require("../../managers/internalManagers/organizationManagement/userType_manager");
/**
 * Create a userType
 *
 */

exports.createUserType = async (req, res) => {
  try {
    const userTypeReqObj = createUserTypeObject(req);
    const userType = await userTypeManager.createUserType(userTypeReqObj);
    const message = "UserType created successfully";
    return apiResponseHandler.successResponse(res, message, 201, userType);
  } catch (error) {
    console.log("Error while creating the userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get all userTypes
 *
 */

exports.getAllUserTypes = async (req, res) => {
  try {
    const userTypes = await userTypeManager.getAllUserTypes(
      req.query,
      req.businessUnit
    );
    const message = "UserTypes fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, userTypes);
  } catch (error) {
    console.log("Error while fetching userTypes", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get a userType
 *
 */

exports.getUserType = async (req, res) => {
  try {
    const userType = await userTypeManager.getUserType(
      req.params.userType,
      req.query.selectFields,
      req.query.populateFields,
      req.businessUnit
    );

    if (!userType) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "UserType not found",
        404,
        null
      );
    }
    const message = "UserType fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, userType);
  } catch (error) {
    console.log("Error while fetching userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable a userType
 *
 */

exports.enableUserType = async (req, res) => {
  try {
    const userType = await userTypeManager.enableUserType(req.params.userType);
    const message = "UserType enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable a userType
 *
 */

exports.disableUserType = async (req, res) => {
  try {
    const userType = await userTypeManager.disableUserType(req.params.userType);
    const message = "UserType disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable userTypes
 *
 */

exports.enableUserTypes = async (req, res) => {
  try {
    await userTypeManager.enableUserTypes(req.body.userTypes);
    const message = "UserTypes enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling userTypes", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable userTypes
 *
 */

exports.disableUserTypes = async (req, res) => {
  try {
    await userTypeManager.disableUserTypes(req.body.userTypes);
    const message = "UserTypes disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling userTypes", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

// /**
//  * Delete a userType
//  *
//  */

exports.deleteUserType = async (req, res) => {
  try {
    await userTypeManager.deleteUserType(req.params.userType);
    const message = "UserType deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete userTypes
 *
 */

exports.deleteUserTypes = async (req, res) => {
  try {
    await userTypeManager.deleteUserTypes(req.body.userTypes);
    const message = "UserTypes deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting userTypes", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Update a userType
 *
 */

exports.updateUserType = async (req, res) => {
  try {
    const userTypeReqObj = updateUserTypeObject(req);
    const userType = await userTypeManager.updateUserType(
      req.params.userType,
      userTypeReqObj
    );
    const message = "UserType updated successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while updating userType", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const createUserTypeObject = (req) => {
  return {
    name: req.body.name,
    department: req.department,
    businessUnit: req.businessUnit,
    isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
    createdBy: req.userId,
    updatedBy: req.userId,
  };
};

const updateUserTypeObject = (req) => {
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
