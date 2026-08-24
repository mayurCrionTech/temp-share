/**
 * This is the controller for the designation resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const designationManager = require("../../managers/internalManagers/organizationManagement/designation_manager");
/**
 * Create a designation
 *
 */

exports.createDesignation = async (req, res) => {
  try {
    const designationReqObj = createDesignationObject(req);
    const designation = await designationManager.createDesignation(
      designationReqObj
    );
    const message = "Designation created successfully";
    return apiResponseHandler.successResponse(res, message, 201, designation);
  } catch (error) {
    console.log("Error while creating the designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get all designations
 *
 */

exports.getAllDesignations = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    const designations = await designationManager.getAllDesignations(
      req.query,
      requestBU
    );
    const message = "Designations fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, designations);
  } catch (error) {
    console.log("Error while fetching designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Get a designation
 *
 */

exports.getDesignation = async (req, res) => {
  try {
    const designation = await designationManager.getDesignation(
      req.params.designation,
      req.query.selectFields,
      req.query.populateFields,
      req.businessUnit
    );

    if (!designation) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Designation not found",
        404,
        null
      );
    }
    const message = "Designation fetched successfully";
    return apiResponseHandler.successResponse(res, message, 200, designation);
  } catch (error) {
    console.log("Error while fetching designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable a designation
 *
 */

exports.enableDesignation = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    const designation = await designationManager.enableDesignation(
      req.params.designation,
      requestBU
    );
    const message = "Designation enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable a designation
 *
 */

exports.disableDesignation = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    const designation = await designationManager.disableDesignation(
      req.params.designation,
      requestBU
    );
    const message = "Designation disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Enable designations
 *
 */

exports.enableDesignations = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    await designationManager.enableDesignations(
      req.body.designations,
      requestBU
    );
    const message = "Designations enabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while enabling designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Disable designations
 *
 */

exports.disableDesignations = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    await designationManager.disableDesignations(
      req.body.designations,
      requestBU
    );
    const message = "Designations disabled successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while disabling designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete a designation
 *
 */

exports.deleteDesignation = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    await designationManager.deleteDesignation(
      req.params.designation,
      requestBU
    );
    const message = "Designation deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Delete designations
 *
 */

exports.deleteDesignations = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    await designationManager.deleteDesignations(
      req.body.designations,
      requestBU
    );
    const message = "Designations deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while deleting designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Update a designation
 *
 */

exports.updateDesignation = async (req, res) => {
  try {
    const requestBU = req.businessUnit ? req.businessUnit : null;
    const designationReqObj = updateDesignationObject(req);
    const designation = await designationManager.updateDesignation(
      req.params.designation,
      designationReqObj,
      requestBU
    );
    const message = "Designation updated successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while updating designation", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

/**
 * Update designations
 *
 */

exports.updateDesignations = async (req, res) => {
  try {
    const designationReqObj = updateDesignationObject(req);
    await designationManager.updateDesignations(req.body.designations);
    const message = "Designations updated successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Error while updating designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

exports.updateMultipleDesignations = async (req, res) => {
  try {
    const designations = await designationManager.updateDesignations(req);
    if (designations.matchedCount === req.body.designations.length) {
      const message = "Designations updated successfully";
      return apiResponseHandler.successResponse(res, message, 200, null);
    } else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Some user permissions failed to update",
        500,
        null
      );
    }
  } catch (error) {
    console.log("Error while updating designations", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

const createDesignationObject = (req) => {
  return {
    name: req.body.name,
    userType: req.userType,
    businessUnit: req.businessUnit,
    permissions: req.body.permissions ? req.body.permissions : [],
    isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
    createdBy: req.userId,
    updatedBy: req.userId
  };
};

const updateDesignationObject = (req) => {
  const updateObject = {
    updatedBy: req.userId
  };
  if (req.body.name) {
    updateObject.name = req.body.name;
  }
  if (req.body.isEnabled !== undefined) {
    updateObject.isEnabled = req.body.isEnabled;
  }
  if (req.body.permissions) {
    updateObject.permissions = req.body.permissions;
  }
  return updateObject;
};

const updateDesignationsPermissionsObject = (req) => {
  const updateObject = {
    updatedBy: req.userId
  };
  if (req.body.name) {
    updateObject.name = req.body.name;
  }
  if (req.body.isEnabled !== undefined) {
    updateObject.isEnabled = req.body.isEnabled;
  }
  if (req.body.permissions) {
    updateObject.permissions = req.body.permissions;
  }
  return updateObject;
};
