// const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
// const dashboardManager = require("../../managers/internalManagers/dashBoardManagement/dashBoard_manager.js");

// const validateDateInput = (req, res, next) => {
//   const { startDate, endDate } = req.query;

//   // Check if the requestedDate is provided and is a valid date
//   if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
//     return apiResponseHandler.errorResponse(
//       null,
//       req,
//       res,
//       'Please provide a valid date.',
//       400,
//       null
//     );
//   }

//   // If date is valid, proceed to the next middleware or controller
//   next();
// };

// module.exports ={
//     validateDateInput
// }
const mongoose = require("mongoose");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const Dashboard = require("../../models/mongoDB/dashboardManagement/dashboard_model.js");
const mongoDbManager = require("../../managers/dBManagers/mongoDB_manager.js");

const validateDateInput = (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Check if the dates are provided and are valid
  if (startDate && isNaN(Date.parse(startDate))) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Please provide a valid start date.",
      400,
      null
    );
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Please provide a valid end date.",
      400,
      null
    );
  }

  // Check if startDate is before endDate
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Start date must be before end date.",
        400,
        null
      );
    }
  }

  // If dates are valid, proceed to the next middleware
  next();
};

const validateDashboardCreate = (req, res, next) => {
  const { name, description, embedUrl, businessUnit } = req.body;

  // Validate required fields
  if (!name) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Dashboard name is required.",
      400,
      null
    );
  }

  if (!embedUrl) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Embed URL is required.",
      400,
      null
    );
  }

  // Validate name length and format
  if (
    typeof name !== "string" ||
    name.trim().length < 3 ||
    name.trim().length > 100
  ) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Dashboard name must be between 3 and 100 characters.",
      400,
      null
    );
  }

  // Validate description if provided
  if (
    description &&
    (typeof description !== "string" || description.trim().length > 500)
  ) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Description must be a string with maximum 500 characters.",
      400,
      null
    );
  }

  // Validate embed URL format
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(embedUrl)) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Please provide a valid embed URL starting with http:// or https://.",
      400,
      null
    );
  }

  // Validate business unit ObjectId format
  if (!mongoose.Types.ObjectId.isValid(businessUnit)) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Please provide a valid business unit ID.",
      400,
      null
    );
  }
  if (description) {
    req.body.description = description.trim();
  }

  next();
};

const validateDashboardUpdate = (req, res, next) => {
  const { name, description, embedUrl, businessUnit } = req.body;

  // Validate name if provided
  if (name !== undefined) {
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 3 ||
      name.trim().length > 100
    ) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Dashboard name must be between 3 and 100 characters.",
        400,
        null
      );
    }
    req.body.name = name.trim();
  }

  // Validate description if provided
  if (description !== undefined) {
    if (
      description &&
      (typeof description !== "string" || description.trim().length > 500)
    ) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Description must be a string with maximum 500 characters.",
        400,
        null
      );
    }
    if (description) {
      req.body.description = description.trim();
    }
  }

  // Validate embed URL if provided
  if (embedUrl !== undefined) {
    if (!embedUrl) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Embed URL cannot be empty.",
        400,
        null
      );
    }
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(embedUrl)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Please provide a valid embed URL starting with http:// or https://.",
        400,
        null
      );
    }
  }
  next();
};

const validateDashboardId = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Please provide a valid dashboard ID.",
      400,
      null
    );
  }

  try {
    const dashboard = await mongoDbManager.findOne(Dashboard, {
      _id: id,
      isActive: true,
    });
    if (!dashboard) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Dashboard not found.",
        404,
        null
      );
    }

    // Attach found document if needed downstream
    req.dashboard = dashboard;

    next();
  } catch (err) {
    console.error(err);
    return apiResponseHandler.errorResponse(
      err,
      req,
      res,
      "Error while verifying dashboard ID.",
      500,
      null
    );
  }
};

module.exports = {
  validateDateInput,
  validateDashboardCreate,
  validateDashboardUpdate,
  validateDashboardId,
  // validateBusinessUnitId,
  // validatePaginationParams,
  // validateSearchParams,
  validateDashboardCreate, // Your original naming convention
  // validatePowerBiDashboardQuery, // PowerBI specific query validation
  // validateCreatePowerBiDashboardRequestBody, // PowerBI specific create validation
  // validateBusinessUnitWithQuery // Business unit param + query validation
};
