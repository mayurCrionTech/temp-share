const shiftManager = require("../../managers/internalManagers/organizationManagement/shift_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

const createShift = async (req, res) => {
    try {     
		const shiftCreateObject = req.shiftCreateObject;
		const createdShift = await shiftManager.createShift(shiftCreateObject);
		const message = "Shift created successfully";
		return apiResponseHandler.successResponse(res, message, 201, createdShift);
	} catch (error) {
		console.log("Some error happened while creating shift", error.message, error);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const updateShift = async (req, res) => {
	try {
		const updatedShift = await shiftManager.updateShift(req.shift, req.shiftUpdateObject);
		return apiResponseHandler.successResponse(res, "Shift updated successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while updating shift", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const bulkDeleteShifts = async (req, res) => {
	const { shiftsToDelete } = req.body;

	try {
		await shiftManager.deleteShifts(shiftsToDelete);
		return apiResponseHandler.successResponse(res, "Shifts deleted successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while deleting shifts", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchShifts = async (req, res) => {
	try {
		const reqData = req.query;
		reqData.asset = req.params.asset;
		if (reqData.businessUnit) {
			reqData.businessUnits = [req.businessUnit];
		}
		const getShifts = await shiftManager.getShifts(reqData);
		return apiResponseHandler.successResponse(res, "Shifts fetched successfully", 200, getShifts);
	} catch (error) {
		console.log("Some error happened while fetching shifts", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchShift = async (req, res) => {
	try {
		const reqQuery = req.query;
		const shiftId = req.shiftObj._id;
			if (reqData.businessUnit) {
			reqData.businessUnit = req.businessUnit;
		}
		const getShift = await shiftManager.getShift(shiftId, reqQuery);
		if (!getShift) {
			return apiResponseHandler.errorResponse(null, req, res, "Shift not found", 404, null);
		}
		const message = "Shift Fetched Successfully";
		return apiResponseHandler.successResponse(res, message, 200, getShift);
	} catch (error) {
		console.log("Some error happened while fetching Shift", error.message);
		return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
	}
};

module.exports = {
	createShift,
	updateShift,
	bulkDeleteShifts,
	fetchShifts,
	fetchShift
};
