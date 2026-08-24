const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const truckManager = require("../../managers/internalManagers/truckManagement/truck.manager");

/**
 * Create or Update Truck Data (Bulk)
 */
const updateTruck = async (req, res) => {
  try {
    const reqData = req.body;

    if (!Array.isArray(reqData) || reqData.length === 0) {
      return apiResponseHandler.errorResponse(
        "Request body must be a non-empty array",
        req,
        res,
        "Invalid payload",
        400,
        {},
      );
    }

    const result = await truckManager.updateTruckData(reqData);

    return apiResponseHandler.successResponse(
      res,
      "Truck data updated successfully",
      200,
      //result
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message || "Server error",
      400,
      {},
    );
  }
};

/**
 * Get Monthly Truck Data
 */
const getMonthlyTrucks = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return apiResponseHandler.errorResponse(
        "Year and month are required",
        req,
        res,
        "Missing query params",
        400,
        {},
      );
    }

    const data = await truckManager.getMonthlyTruckData(
      Number(year),
      Number(month),
    );

    return apiResponseHandler.successResponse(
      res,
      "Truck monthly count fetched successfully",
      200,
      data,
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      400,
      {},
    );
  }
};

const getTruckByDate = async (req, res) => {
  // NEW CONTROLLER FUNCTION TO GET DATA BY SINGLE DATE
  try {
    const { date } = req.params;

    if (!date) {
      return apiResponseHandler.errorResponse(
        "Date parameter is required",
        req,
        res,
        "Missing date",
        400,
        {},
      );
    }

    const data = await truckManager.getTruckDataBySingleDate(date);

    res.set("Cache-Control", "no-store");

    return apiResponseHandler.successResponse(
      res,
      "Truck data for selected date",
      200,
      data,
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      400,
      {},
    );
  }
};

module.exports = {
  updateTruck,
  getMonthlyTrucks,
  getTruckByDate, // export new function to get data by single date
};
