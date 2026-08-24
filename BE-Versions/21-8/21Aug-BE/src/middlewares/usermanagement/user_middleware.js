/**
 * This file will contain the middlewares for valdiating the userId and email
 */

const fileMiddleware = require("../fileSystem/fileSystem_middleware");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const { default: mongoose } = require("mongoose");


//check duplicate employeeId

const checkDuplicateEmployeeId = async (req, res, next) => {
	let isValid = true;
	let message = "";
	if (!req.query.draft) {
		if ((req.userObj && req.userObj.isDraft && !req.userObj.employeeId) || !req.userObj) {
			if (!req.businessUnit) {
				isValid = false;
				message = "Failed! BusinessUnit Id must be a non-empty string";
			}

			if (!req.body.employeeId || typeof req.body.employeeId !== "string") {
				isValid = false;
				message = "Failed! EmployeeId must be a non-empty string";
			}

			// Check if the provided name already exists in the database
			const existingEmployeeIdUser = await userManager.checkExistingEmployeeIdForBusinessUnit(
				req.body.employeeId,
				req.businessUnit
			);
			if (existingEmployeeIdUser) {
				isValid = false;
				message = "Failed! User employeeId already exists for the business unit";
			}
		} else if (
			(req.userObj && req.userObj.isDraft && req.userObj.employeeId) ||
			(req.userObj && req.userObj.isDraft && req.body.employeeId)
		) {
			if (req.body.employeeId) {
				const existingEmployeeIdUser = await userManager.checkExistingEmployeeIdForBusinessUnit(
					req.body.employeeId,
					req.businessUnit
				);
				if (existingEmployeeIdUser._id !== req.userObj._id) {
					isValid = false;
					message = "Failed! User employeeId already exists for the business unit";
				}
			} else if (req.userObj.employeeId) {
				const existingEmployeeIdUser = await userManager.checkExistingEmployeeIdForBusinessUnit(
					req.userObj.employeeId,
					req.businessUnit
				);
				if (existingEmployeeIdUser._id !== req.userObj._id) {
					isValid = false;
					message = "Failed! User employeeId already exists for the business unit";
				}
			}
		}
	}

	if (isValid) {
		next();
	} else {
		return apiResponseHandler.errorResponse(null, req, res, message, 400, null);
	}
};

const validateCreateUserRequest = async (req, res, next) => {
	if (req.query.draft) {
		return next();
	}

	const validateField = async (field, value, options) => {
		const { type, maxLength, required, checkExists, validateFile } = options;

		if (required && !value) {
			throw new Error(`Failed! ${field} must be a non-empty ${type}`);
		}

		if (value) {
			if (type && typeof value !== type) {
				throw new Error(`Failed! ${field} must be a ${type}`);
			}

			if (maxLength && value.length > maxLength) {
				throw new Error(`Failed! ${field} should not exceed ${maxLength} characters`);
			}

			if (checkExists) {
				const exists = await checkExists(value);
				if (exists) {
					throw new Error(`Failed! ${field} already exists for the business unit`);
				}
			}

			if (validateFile) {
				const fileObj = await fileMiddleware.validateFileById(value, field, req.businessUnit);
				if (!fileObj || fileObj.moduleName || fileObj.moduleId) {
					throw new Error(`Failed! ${field} is not valid`);
				}
				req[`${field}Obj`] = fileObj;
			}
		}
	};
	try {
		await validateField("businessUnit", req.businessUnit.toString(), { type: "string", required: true });
		await validateField("department", req.body.department, { type: "string", required: true });
		await validateField("shift", req.body.shift, { type: "string", required: true });
		await validateField("userType", req.body.userType, { type: "string", required: true });
		await validateField("designation", req.body.designation, { type: "string", required: true });
		await validateField("firstName", req.body.firstName, { type: "string", required: true });
		await validateField("lastName", req.body.lastName, { type: "string", maxLength: 50, required: true });
		await validateField("countryCode", req.body.countryCode, { type: "string", required: true, maxLength: 4 });
		await validateField("contactNumber", req.body.contactNumber, { type: "number", required: true });

		if ((req.userObj && req.userObj.isDraft && !req.userObj.employeeId) || !req.userObj) {
			await validateField("employeeId", req.body.employeeId, {
				type: "string",
				required: true,
				checkExists: async (value) => await userManager.checkExistingEmployeeIdForBusinessUnit(value, req.businessUnit)
			});
		}

		const emailToValidate = req.body.email || (req.userObj && req.userObj.email);
		if (!emailToValidate) {
			throw new Error("Failed! Email must be provided!");
		}
		if (!isValidEmail(emailToValidate)) {
			throw new Error("Failed! Email is not valid!");
		}
		await validateField("email", emailToValidate, {
			checkExists: async (value) => {
				const existingEmailUser = await userManager.checkExistingEmailForBusinessUnit(value, req.businessUnit);
				return existingEmailUser && (!req.userObj || existingEmailUser._id !== req.userObj._id);
			}
		});

		if (req.body.image && req.body.eSignature && req.body.image === req.body.eSignature) {
			throw new Error("Failed! User image and eSignature cannot be the same");
		}

		await validateField("image", req.body.image, { type: "string", validateFile: true });
		await validateField("eSignature", req.body.eSignature, { type: "string", validateFile: true });

		if (req.body.isEnabled !== undefined) {
			await validateField("isEnabled", req.body.isEnabled, { type: "boolean" });
		}

		next();
	} catch (error) {
		return apiResponseHandler.errorResponse(null, req, res, error.message, 400, null);
	}
};

const constructPreCreateUserRequest = async (req, res, next) => {
	if (!req.query.draft && req.userObj) {
		if (!req.businessUnit) {
			req.body.businessUnit = req.userObj.businessUnit;
		}
		if (!req.body.department) {
			req.body.department = req.userObj.department;
		}

		if (!req.body.shift || typeof req.body.shift !== "string") {
			req.body.shift = req.userObj.shift;
		}
		if (!req.body.userType || typeof req.body.userType !== "string") {
			req.body.userType = req.userObj.userType;
		}

		if (!req.body.designation || typeof req.body.designation !== "string") {
			req.body.designation = req.userObj.designation;
		}

		if (!req.body.firstName || typeof req.body.firstName !== "string") {
			req.body.firstName = req.userObj.firstName;
		}

		if (!req.body.lastName || typeof req.body.lastName !== "string") {
			req.body.lastName = req.userObj.lastName;
		}
		if (!req.body.countryCode || typeof req.body.countryCode !== "string") {
			req.body.countryCode = req.userObj.countryCode;
		}
		if (!req.body.contactNumber || typeof req.body.contactNumber !== "number") {
			req.body.contactNumber = req.userObj.contactNumber;
		}

		if (!req.body.employeeId || typeof req.body.employeeId !== "string") {
			req.body.employeeId = req.userObj.employeeId;
		}

		if (!req.body.email || typeof req.body.email !== "string") {
			req.body.email = req.userObj.email;
		}

		if (req.body.reportsTo || typeof req.body.reportsTo !== "string") {
			req.body.reportsTo = req.userObj.reportsTo;
		}

		next();
	} else {
		next();
	}
};

const validatePreUpdateUserRequest = async (req, res, next) => {
	const validateField = async (field, value, options) => {
		const { type, maxLength, checkExists, validateFile } = options;

		if (value !== undefined) {
			if (type && typeof value !== type) {
				throw new Error(`Failed! ${field} must be a ${type}`);
			}

			if (maxLength && value.length > maxLength) {
				throw new Error(`Failed! ${field} should not exceed ${maxLength} characters`);
			}

			if (checkExists) {
				const exists = await checkExists(value);
				if (exists) {
					throw new Error(`Failed! ${field} already exists for the business unit`);
				}
			}

			if (validateFile) {
				const fileObj = await fileMiddleware.validateFileById(value, field, req.businessUnit);
				if (!fileObj) {
					throw new Error(`Failed! ${field} is not valid`);
				}
				if (fileObj.moduleName) {
					if (fileObj.moduleName && fileObj.moduleName !== "users") {
						return `Failed! Invalid ${field} File id is not an user file`;
					}
				}
				if (fileObj.moduleId) {
					if (fileObj.moduleId && fileObj.moduleId !== req.user) {
						return `Failed! Invalid ${field} File id is not an user file`;
					}
				}
				req[`${field}Obj`] = fileObj;
			}
		}
	};

	try {
		await validateField("firstName", req.body.firstName, { type: "string" });
		await validateField("lastName", req.body.lastName, { type: "string" });
		await validateField("employeeId", req.body.employeeId, {
			checkExists: async (value) => await userManager.checkExistingEmployeeIdForBusinessUnit(value, req.businessUnit)
		});
		await validateField("countryCode", req.body.countryCode, { type: "string", maxLength: 4 });
		await validateField("contactNumber", req.body.contactNumber, { type: "number" });

		// Image and eSignature validation
		if (req.body.image && req.body.eSignature && req.body.image === req.body.eSignature) {
			throw new Error("Failed! User image and eSignature cannot be the same");
		}

		await validateField("image", req.body.image, { type: "string", validateFile: true });
		await validateField("eSignature", req.body.eSignature, { type: "string", validateFile: true });

		// Remove department, userType, designation, and team from query and params
		const fieldsToRemove = ["department", "userType", "designation", "team"];
		fieldsToRemove.forEach((field) => {
			delete req.query[field];
			delete req.params[field];
		});

		if (req.body.department) {
			if (!req.body.userType) {
				throw new Error("UserType is required and must be a non-empty string, while updating department");
			}
			if (!req.body.designation) {
				throw new Error("Designation is required and must be a non-empty string, while updating department");
			}
		}

		if (req.body.userType && !req.body.designation) {
			throw new Error("Designation is required and must be a non-empty string, while updating userType");
		}

		if (req.body.shift && !req.body.shift) {
			throw new Error("Shift is required and must be a non-empty string");
		}

		next();
	} catch (error) {
		return apiResponseHandler.errorResponse(null, req, res, error.message, 400, null);
	}
};

const validateUser = async (req, res, next) => {
	// Check if userId is in req.params
	if (req.params.user && typeof req.params.user === "string") {
		req.user = req.params.user;
	}
	// If not, check if userId is in req.body
	else if (req.body.user && typeof req.body.user === "string") {
		req.user = req.body.user;
	}
	// If userId is not in req.params or req.body, return an error response
	else {
		return apiResponseHandler.errorResponse(null, req,
			res,
			"User id must be a non-empty string in req.params or req.body",
			400,
			null
		);
	}
	let checkExistingUser

	let fetchByField = req.query.fetchByField
	if (fetchByField == "employeeId") {
		checkExistingUser = await userManager.getUserByEmployeeId(req, req.user, "", "", req.businessUnit);
	}
	else if (fetchByField == "email") {
		// Check if the user with the given ID exists
		checkExistingUser = await userManager.getUserByEmail(req, req.user, "", "", req.businessUnit);
	}
	else {
		checkExistingUser = await userManager.checkExistingUser(req.user, req.businessUnit);
	}

	if (checkExistingUser) {
		next();
	} else {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! User does not exist", 404, null);
	}
}


const validateUserAndReturnObj = async (req, res, next) => {
	// Check if userId is in req.params
	if (req.params.user || req.body.user) {
		if (req.params.user && typeof req.params.user === "string") {
			req.user = req.params.user;
		}
		// If not, check if userId is in req.body
		else if (req.body.user && typeof req.body.user === "string") {
			req.user = req.body.user;
		}
		// If userId is not in req.params or req.body, return an error response
		else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"User id must be a non-empty string in req.params or req.body",
				400,
				null
			);
		}

		let selectFields = "name,_id,team,department,firstName,lastName,employeeId,contactNumber,countryCode,userType,designation,reportsTo,email,isDraft";

		// Check if the user with the given ID exists
		let checkExistingUser = await userManager.getUser(
			req,
			req.user,
			selectFields,
			"",
			req.businessUnit
		);

		if (checkExistingUser) {
			req.userObj = checkExistingUser;
			next();
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! User does not exist", 400, null);
		}
	} else next();
};

const rejectUpdatingUserBySameUser = async (req, res, next) => {
	if (req.userId === req.user) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Cant update the same user", 400, null);
	} else {
		next();
	}
};

const rejectUpdatingUsersBySameUser = async (req, res, next) => {
	if (req.body.users.includes(req.userId)) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Cant update the same user", 400, null);
	} else {
		next();
	}
};

const validateUsers = async (req, res, next) => {
	if (req.body.users) {
		if (!req.body.users || !Array.isArray(req.body.users) || req.body.users.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"User ids must be a non-empty array of strings",
				400,
				null
			);
		}
		for (let i = 0; i < req.body.users.length; i++) {
			if (typeof req.body.users[i] !== "string") {
				return apiResponseHandler.errorResponse(null, req,
					res,
					"User ids must be a non-empty array of strings",
					400,
					null
				);
			}
		}

		let invalidUserIds = await userManager.returnInvalidUserIds(
			req.body.users,
			req.businessUnit,
			req.department
		);
		if (invalidUserIds.length > 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid User ids", 400, {
				invalidUserIds
			});
		} else {
			next();
		}
	} else {
		next();
	}
};

const validateUsersWithoutTeam = async (req, res, next) => {
	if (req.body.users) {
		if (!req.body.users || !Array.isArray(req.body.users) || req.body.users.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"User ids must be a non-empty array of strings",
				400,
				null
			);
		}
		for (let i = 0; i < req.body.users.length; i++) {
			if (typeof req.body.users[i] !== "string") {
				return apiResponseHandler.errorResponse(null, req,
					res,
					"User ids must be a non-empty array of strings",
					400,
					null
				);
			}
		}

		let usersWithoutTeam = await userManager.returnUsersWithoutTeam(
			req.body.users,
			req.businessUnit
		);
		if (req.body.users.length !== usersWithoutTeam.length) {
			let usersWithTeam = req.body.users.filter((user) => !usersWithoutTeam.includes(user));
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Users already have team", 400, {
				usersWithTeam
			});
		} else {
			next();
		}
	} else {
		next();
	}
};

const validateReportsTo = async (req, res, next) => {
	if (req.params.reportsTo || req.body.reportsTo) {
		// Check if reportsTo is in req.params
		if (req.params.reportsTo && typeof req.params.reportsTo === "string") {
			req.reportsTo = req.params.reportsTo;
		}
		// If not, check if reportsTo is in req.body
		else if (req.body.reportsTo && typeof req.body.reportsTo === "string") {
			req.reportsTo = req.body.reportsTo;
		}
		// If reportsTo is not in req.params or req.body, return an error response
		else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"reportsTo must be a non-empty string in req.params or req.body",
				400,
				null
			);
		}

		// Check if the user with the given ID exists
		let checkExistingUser = await userManager.checkExistingUser(req.reportsTo, req.businessUnit);

		if (checkExistingUser) {
			next();
		} else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Failed! ReportsTo user does not exist",
				400,
				null
			);
		}
	} else {
		next();
	}
};

const validateReportsTosFromQuery = async (req, res, next) => {
	if (req.query.reportsTos) {
		//convert the string to array

		let reportsTos = req.query.reportsTos.split(",");

		if (!reportsTos || !Array.isArray(reportsTos) || reportsTos.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"ReportsTo ids must be a non-empty string with comma separated values",
				400,
				null
			);
		}

		let invalidReportsTos = await userManager.returnInvalidUserIds(reportsTos, req.businessUnit);
		if (invalidReportsTos.length > 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid ReportsTo ids", 400, {
				invalidReportsTos
			});
		}

		req.reportsTos = reportsTos;
	}
	next();
};

const validateMongoDBIdsFromQuery = async (req, res, next) => {
	if (req.query.ids) {
		// Convert the comma-separated string to array
		req.query.ids = req.query.ids.split(",");

		// Check if the array contains only strings
		if (!req.query.ids.every((id) => typeof id === "string")) {
			return apiResponseHandler.errorResponse(null, req, res, "ids must be a non-empty array of strings", 400, null);
		}

		// Check if all IDs are valid MongoDB ObjectIDs
		const invalidIds = req.query.ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidIds.length > 0) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				`Invalid ids`,
				400,
				{ invalidIds }
			);
		}
	}

	next();
};
const isValidEmail = (email) => {

	const maxLength = 320;
	const minLength = 5;

	const emailRegex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	// List of supported email suffixes
	const validSuffixes = [
		".com",
		".org",
		".net",
		".info",
		".biz",
		".name",
		".mobi",
		".jobs",
		".travel",
		".gov",
		".edu",
		".mil",
		".int",
		".us",
		".uk",
		".cn",
		".jp",
		".de",
		".in",
		".fr",
		".ru",
		".br",
		".au",
		".ca",
		".mx",
		".it",
		".es",
		".nl",
		".ch",
		".se",
		".no",
		".kr",
		".sa",
		".ae",
		".za",
		".xyz",
		".club",
		".online",
		".site",
		".blog",
		".store",
		".app",
		".tech",
		".io",
		".ai",
		".dev"
	];

	// Validate email length
	if (email.length < minLength || email.length > maxLength) {
		return false;
	}

	// testing the email string based on 'emailRegex' and validSuffixes
	if (emailRegex.test(email)) {
		for (const suffix of validSuffixes) {
			if (email.endsWith(suffix)) {
				return true;
			}
		}
	}
	return false;
};

const userMiddleware = {
	checkDuplicateEmployeeId: checkDuplicateEmployeeId,
	validateCreateUserRequest: validateCreateUserRequest,
	validatePreUpdateUserRequest: validatePreUpdateUserRequest,
	validateUser: validateUser,
	validateUserAndReturnObj: validateUserAndReturnObj,
	validateUsers: validateUsers,
	validateReportsTo: validateReportsTo,
	validateReportsTosFromQuery: validateReportsTosFromQuery,
	validateUsersWithoutTeam: validateUsersWithoutTeam,
	rejectUpdatingUserBySameUser: rejectUpdatingUserBySameUser,
	rejectUpdatingUsersBySameUser: rejectUpdatingUsersBySameUser,
	constructPreCreateUserRequest: constructPreCreateUserRequest,
	isValidEmail: isValidEmail,
	validateMongoDBIdsFromQuery: validateMongoDBIdsFromQuery
};
module.exports = userMiddleware;
