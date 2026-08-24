const {
	Shift
} = require("../../models/mongoDB/organizationManagement/shift_model.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const shiftManager = require("../../managers/internalManagers/organizationManagement/shift_manager.js");
const { validateTime } = require("../../middlewares/common/timeStamp_middleware");
const { default: mongoose } = require("mongoose");

const validateField = async (businessUnit,field, value, options, currentValue = null) => {
	try {
		const { type, maxLength, unique, required, checkExists, alphanumeric, checkValidTime } = options;

		if (required && !value) {
			return `Failed! ${field} is required`;
		}

		if (value) {
			if (type && typeof value !== type) {
				return `Failed! ${field} must be a ${type}`;
			}

			if (maxLength && value.length > maxLength) {
				return `Failed! ${field} should not exceed ${maxLength} characters`;
			}

			// Case-insensitive unique check: Skip if the value is the same as the current value (ignoring case)
			if (unique && value.toLowerCase() !== currentValue?.toLowerCase()) {
				const exists = await Shift.findOne({
					[`${field}`]: { $regex: new RegExp(`^${value}$`, "i") }, // Case-insensitive regex match
					isDeleted: false,
					businessUnit: businessUnit
				});
				if (exists) {
					return `Failed! ${field} already exists in the Business Unit (case-insensitive check)`;
				}
			}

			if (checkExists && !(await checkExists(value))) {
				return `Failed! Invalid ${field}`;
			}

			if (alphanumeric && !/^[a-zA-Z0-9\s]*$/.test(value)) {
				return `Failed! ${field} should contain only alphanumeric characters`;
			}

			// Validate shift times if the option is provided
			if (checkValidTime) {
				const isValidTime = validateTime(value);
				if (!isValidTime) {
					return `Failed! Invalid ${field} shift hours. It should be in HH:mm:ss format.`;
				}
			}
		}

		return null;
	} catch (error) {
		throw error;
	}
};



const getNestedValue = (obj, path) => {
	return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};


const validateCreateShiftRequest = async (req, res, next) => {
	try {
		const { name, shiftHours, businessUnit } = req.body;
	
		req.shiftCreateObject = {
			name,
			shiftHours: {
				start: shiftHours?.start || null,
				end: shiftHours?.end || null
			},
			businessUnit: req.businessUnit,
			createdBy: req.userId,
			updatedBy: req.userId
		};
	
		const fieldsToValidate = [
			{ field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
			{
				field: "shiftHours.start",
				options: { type: "string", maxLength: 8, required: true, checkValidTime: true }
			},
			{
				field: "shiftHours.end",
				options: { type: "string", maxLength: 8, required: true, checkValidTime: true }
			}
		];
	
		for (const { field, options } of fieldsToValidate) {
			// Use getNestedValue to access nested fields
			const value = getNestedValue(req.body, field);
			const error = await validateField(businessUnit,field, value, options);		
			if (error) {
				return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
			}
		}
	
		next();
	} catch (error) {
		throw error;
	}
};


const validateUpdateShiftRequest = async (req, res, next) => {
	 let reqQuery = req.query || {};
  let reqBody = req.body || {};
	try {
		const { name, shiftHours } = reqBody;
		req.shift = req.params.shift;

		if (!req.shiftObj) {
			req.shiftObj = await Shift.findById(req.shift);
		}
		if (!req.shiftObj) {
			return apiResponseHandler.errorResponse(null, req, res, "Shift not found", 404, null);
		}

		req.shiftUpdateObject = {
			name: name ?? req.shiftObj.name,
			shiftHours: {
				start: shiftHours?.start || req.shiftObj.start,
				end: shiftHours?.end || req.shiftObj.end
			},
			updatedBy: req.userId,
			updatedAt: Date.now()
		};

		const fieldsToValidate = [
			{ field: "name", options: { type: "string", maxLength: 50, unique: true }, currentValue: req.shiftObj.name },
			{
				field: "shiftHours.start",
				options: { type: "string", maxLength: 8, checkValidTime: true }
			},
			{
				field: "shiftHours.end",
				options: { type: "string", maxLength: 8, checkValidTime: true }
			}
		];

		for (const { field, options, currentValue } of fieldsToValidate) {
			const value = getNestedValue(reqBody, field);
			const error = await validateField(reqBody.businessUnit,field, value, options, currentValue);
			if (error) {
				return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
			}
		}

		next();
	} catch (error) {
		throw error;
	}
};



const validateDeleteShiftsRequest = async (req, res, next) => {
	const { shiftsToDelete } = req.body;
	if (!shiftsToDelete) {
		return apiResponseHandler.errorResponse(null, req, res, "Shift ids are required", 400, null);
	}

	if (!Array.isArray(shiftsToDelete) || shiftsToDelete.length === 0) {
		return apiResponseHandler.errorResponse(
			null,
			req,
			res,
			"Shift ids must be a non-empty array of strings",
			400,
			null
		);
	}

	const idSet = new Set();
	const duplicateIds = new Set();
	for (const id of shiftsToDelete) {
		if (idSet.has(id)) {
			duplicateIds.add(id);
		} else {
			idSet.add(id);
		}
	}

	if (duplicateIds.size > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Duplicate id found", 400, {
			duplicateIds: Array.from(duplicateIds)
		});
	}
	let invalidShiftIds =
		await shiftManager.returnInvalidShiftIds(
			shiftsToDelete
		);
	if (invalidShiftIds.length > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Shift ids", 400, {
			invalidShiftIds: invalidShiftIds
		});
	}

	next();
};

const validateFetchAllRequest = async (req, res, next) => {
	const { name } = req.query;
	if (name && typeof name !== "string") {
		return apiResponseHandler.errorResponse(null, req, res, "Name must be a string", 400, null);
	}

	next();
};

const validateShift = async (req, res, next) => {
	// Check if shift is in req.params
	if (req.params.shift || req.body.shift ) {
		if (req.params.shift && typeof req.params.shift === "string") {
			req.shift = req.params.shift;
		}
		// If not, check if shift is in req.body
		else if (req.body.shift && typeof req.body.shift === "string") {
			req.shift = req.body.shift;
		} else if (req.query.shift && typeof req.query.shift === "string") {
			req.shift = req.query.shift;
		}
		// If shift is not in req.params or req.body, return an error response
		else {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"shift id must be a non-empty string in req.params or req.body",
				400,
				null
			);
		}

		let checkShift = await shiftManager.checkExistingShift(req.shift);
		if (checkShift) {
			req.shiftObj = checkShift;
			next();
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Shift does not exist", 404, null);
		}
	}
	else {
		next();
	}
};




const shiftMiddleware = {
	validateCreateShiftRequest,
	validateUpdateShiftRequest,
	validateDeleteShiftsRequest,
	validateFetchAllRequest,
	validateShift
};

module.exports = shiftMiddleware;
