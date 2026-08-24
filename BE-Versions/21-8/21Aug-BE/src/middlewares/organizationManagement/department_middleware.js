/**
 * This file will contain the middlewares for valdiating the department request body
 */
/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
*/
const departmentManager = require("../../managers/internalManagers/organizationManagement/department_manager.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");

const validateCreateDepartmentRequestBody = async (req, res, next) => {
  // Validate request

  if (!req.businessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit Id must be a non-empty string",
      400,
      null
    );
  }

  if (!req.body.name || typeof req.body.name !== "string") {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Department name must be a non-empty string",
      400,
      null
    );
  }

  // Check if the provided name already exists in the database
  const existingNameDepartment =
    await departmentManager.checkExistingNameForBusinessUnit(
      req.body.name,
      req.businessUnit
    );
  if (existingNameDepartment) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Department name already exists for the business unit",
      400,
      null
    );
  }

  if (req.body.isEnabled !== undefined) {
    if (typeof req.body.isEnabled !== "boolean") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Department isEnabled should be a boolean",
        400,
        null
      );
    }
  }
  next();
};

const validateUpdateDepartmentRequestBody = async (req, res, next) => {
  // Validate request

  if (!req.businessUnit) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "BusinessUnit Id must be a non-empty string",
      400,
      null
    );
  }

  if (req.body.name) {
    if (typeof req.body.name !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "BusinessUnit name must be a non-empty string",
        400,
        null
      );
    }

    const existingNameDepartment =
      await departmentManager.checkExistingNameForBusinessUnit(
        req.body.name,
        req.businessUnit
      );
    if (existingNameDepartment) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Department name already exists for the business unit",
        400,
        null
      );
    }
    if (req.body.isEnabled !== undefined) {
      if (typeof req.body.isEnabled !== "boolean") {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Failed! BusinessUnit isEnabled should be a boolean",
          400,
          null
        );
      }
    }
  }
  next();
};

const validateDepartment = async (req, res, next) => {
  
  let reqQuery = req.query || {};
  let reqBody = req.body || {};

  if (reqBody.department || req.params.department || reqQuery.department) {
    // Check if department is in req.params
    if (req.params.department && typeof req.params.department === "string") {
      req.department = req.params.department;
    } else if (
      reqQuery.department &&
      typeof reqQuery.department === "string"
    ) {
      req.department = reqQuery.department;
    }
    // If not, check if department is in reqBody
    else if (reqBody.department && typeof reqBody.department === "string") {
      req.department = reqBody.department;
    }
    // If department is not in req.params or reqBody, return an error response
    else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Department id must be a non-empty string in req.params or reqBody",
        400,
        null
      );
    }

    // Check if the department with the given ID exists
    let checkExistingDepartment =
      await departmentManager.checkExistingDepartment(
        req.department,
        req.businessUnit
      );

    if (checkExistingDepartment) {
      next();
    } else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Department does not exist",
        400,
        null
      );
    }
  } else {
    next();
  }
};

const validateDepartments = async (req, res, next) => {
  if (
    !req.body.departments ||
    !Array.isArray(req.body.departments) ||
    req.body.departments.length === 0
  ) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Department ids must be a non-empty array of strings",
      400,
      null
    );
  }
  for (let i = 0; i < req.body.departments.length; i++) {
    if (typeof req.body.departments[i] !== "string") {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Department ids must be a non-empty array of strings",
        400,
        null
      );
    }
  }

  let invalidDepartments = await departmentManager.returnInvalidDepartments(
    req.body.departments,
    req.businessUnit
  );
  if (invalidDepartments.length > 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Failed! Invalid Department ids",
      400,
      { invalidDepartments }
    );
  }
  next();
};
//CR0013
const checkDepartmentAccess = (req, res, next) => {
  const userDepartment = req.department; // from token
  const departments = req.body.departments;
  // return

  // 🔹 handle array (bulk departments)
  if (Array.isArray(departments)) {
    for (const dept of departments) {
      if (dept.toString() !== userDepartment) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Forbidden! You do not have access to one or more departments",
          403
        );
      }
    }
  }

  // 🔹 handle single department (if used elsewhere)
  if (typeof departments === "string") {
    if (departments.toString() !== userDepartment) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Forbidden! You do not have access to this department",
        403
      );
    }
  }

  next();
};
//CR0013

const validateDepartmentsFromQuery = async (req, res, next) => {
  if (req.query.departments) {
    //convert the string to array

    let departments = req.query.departments.split(",");

    if (
      !departments ||
      !Array.isArray(departments) ||
      departments.length === 0
    ) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Department ids must be a non-empty string with comma separated values",
        400,
        null
      );
    }

    let invalidDepartments = await departmentManager.returnInvalidDepartments(
      departments,
      req.businessUnit
    );
    if (invalidDepartments.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Invalid Department ids",
        400,
        { invalidDepartments }
      );
    }

    req.departments = departments;
  }
  next();
};

const departmentMiddleWare = {
  validateCreateDepartmentRequestBody: validateCreateDepartmentRequestBody,
  validateUpdateDepartmentRequestBody: validateUpdateDepartmentRequestBody,
  validateDepartment: validateDepartment,
  validateDepartments: validateDepartments,
  validateDepartmentsFromQuery: validateDepartmentsFromQuery,
  checkDepartmentAccess, //CR0013
};

module.exports = departmentMiddleWare;
