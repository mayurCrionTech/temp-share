const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");


const validateCreatedAtFromQueryForSearch = async (req, res, next) => {
	if (req.query.createdAt) {
		//convert the string to array

		let createdAt = req.query.createdAt.split(",");

		if (!createdAt || !Array.isArray(createdAt) || createdAt.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"CreatedAt must be a non-empty string with comma separated values",
				400,
				null
			);
		}
		let createdAtStart = new Date(createdAt[0]);
		let createdAtEnd = new Date(createdAt[1]);

		createdAt = {};

		if (createdAtStart) {
			createdAt.$gte = createdAtStart;
		}
		if (createdAtEnd) {
			createdAt.$lte = createdAtEnd;
		}
		if (createdAtStart == "Invalid Date" || createdAtEnd == "Invalid Date") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"CreatedAt must be a non-empty string of date with comma separated values",
				400,
				null
			);
		}
		req.createdAt = createdAt;
	}

	next();
};

const validateUpdatedAtFromQueryForSearch = async (req, res, next) => {
	if (req.query.updatedAt) {
		//convert the string to array

		let updatedAt = req.query.updatedAt.split(",");

		if (!updatedAt || !Array.isArray(updatedAt) || updatedAt.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"UpdatedAt must be a non-empty string with comma separated values",
				400,
				null
			);
		}
		let updatedAtStart = new Date(updatedAt[0]);
		let updatedAtEnd = new Date(updatedAt[1]);

		updatedAt = {};

		if (updatedAtStart) {
			updatedAt.$gte = updatedAtStart;
		}
		if (updatedAtEnd) {
			updatedAt.$lte = updatedAtEnd;
		}
		if (updatedAtStart == "Invalid Date" || updatedAtEnd == "Invalid Date") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"UpdatedAt must be a non-empty string of date with comma separated values",
				400,
				null
			);
		}
		req.updatedAt = updatedAt;
	}

	next();
};

const validateTime = (time) => {
	try {
		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
		return timeRegex.test(time);
	} catch (error) {
		throw error;
	}
};

const verifyTimeStamp = {
	validateCreatedAtFromQueryForSearch: validateCreatedAtFromQueryForSearch,
	validateUpdatedAtFromQueryForSearch: validateUpdatedAtFromQueryForSearch,
	validateTime: validateTime
};
module.exports = verifyTimeStamp;
