const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const createNotificationData = require("../../managers/common/DataObjectConstructor_manager")
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const teamManager = require("../../managers/internalManagers/userManagement/team_manager");
const ActivityManager = require("../../managers/internalManagers/activityManagement/activity_manager")
const {
	sendViaUserID,
} = require('../../utils/socket/socketHandler')

exports.createUser = async (req, res) => {
	try {
		const userReqObj = createUserObject(req);
		const user = await userManager.createUser(userReqObj);

		const message = "User created successfully";
		return apiResponseHandler.successResponse(res, message, 201, user);
	} catch (error) {
		console.log("Error while creating the user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Get all users
 *
 */

exports.getAllUsers = async (req, res) => {
	try {
		const requestBU = req.businessUnit ? req.businessUnit : null;
		req.query.userId = req.userId;
		const users = await userManager.getAllUsers(req, req.query, requestBU);
		const message = "Users fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, users);
	} catch (error) {
		console.log("Error while fetching users", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Get a user
 *
 */

exports.getUser = async (req, res) => {
	try {

		let user

		let fetchByField = req.query.fetchByField
		if (fetchByField == "employeeId") {
			user = await userManager.getUserByEmployeeId(req, req.user, req.query.selectFields,
				req.query.populateFields, req.businessUnit);
		}
		else if (fetchByField == "email") {
			// Check if the user with the given ID exists
			user = await userManager.getUserByEmail(req, req.user, req.query.selectFields,
				req.query.populateFields, req.businessUnit);
		}
		else {
			user = await userManager.getUser(
				req,
				req.params.user,
				req.query.selectFields,
				req.query.populateFields,
				req.businessUnit
			);
		}

		if (!user) {
			return apiResponseHandler.errorResponse(null, req, res, "User not found", 404, null);
		}
		const message = "User fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, user);
	} catch (error) {
		console.log("Error while fetching user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Enable a user
 *
 */

exports.enableUser = async (req, res) => {
	try {
		const user = await userManager.enableUser(req.params.user);
		const message = "User enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Disable a user
 *
 */

exports.disableUser = async (req, res) => {
	try {
		const user = await userManager.disableUser(req.params.user, req.businessUnit);
		const message = "User disabled successfully";
		await teamManager.removeUsersFromTeams([req.params.user]);
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Enable users
 *
 */

exports.enableUsers = async (req, res) => {
	try {
		await userManager.enableUsers(req.body.users, req.businessUnit);
		const message = "Users enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling users", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Disable users
 *
 */

exports.disableUsers = async (req, res) => {
	try {
		await userManager.disableUsers(req.body.users, req.businessUnit);
		const message = "Users disabled successfully";
		let vvv = await teamManager.removeUsersFromTeams(req.body.users);
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling users", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Delete a user
 *
 */

exports.deleteUser = async (req, res) => {
	try {
		await userManager.deleteUser(req.params.user, req.businessUnit);
		const message = "User deleted successfully";
		await teamManager.removeUsersFromTeams([req.params.user]);
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Delete users
 *
 */

exports.deleteUsers = async (req, res) => {
	try {
		await userManager.deleteUsers(req.body.users, req.businessUnit);
		const message = "Users deleted successfully";
		await teamManager.removeUsersFromTeams([req.body.users]);
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting users", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Update a user
 *
 */

exports.updateUser = async (req, res) => {
	try {
		const userReqObj = updateUserObject(req);
		if (userReqObj.hasOwnProperty("team")) {
			if (userReqObj.team === null && req.userObj.team) {
				await teamManager.removeUsersFromTeam(
					req.userObj.team,
					[req.params.user],
					req.businessUnit
				);
			} else if (
				userReqObj.team !== null &&
				req.userObj.team !== userReqObj.team
			) {
				await teamManager.appendUsersToTeam(
					userReqObj.team,
					[req.params.user],
					req.businessUnit
				);
				if (req.userObj.team) {
					await teamManager.removeUsersFromTeam(
						req.userObj.team,
						[req.params.user],
						req.businessUnit
					);
				}
			}
		}
		if (userReqObj.image) {
			await fileManager.updateFilePath(null, userReqObj.image, "users", user.id, req.userId);
		}
		if (userReqObj.eSignature) {
			await fileManager.updateFilePath(null, userReqObj.eSignature, "users", user.id, req.userId);
		}
		const user = await userManager.updateUser(req.params.user, userReqObj);
		const message = "User updated successfully";

		if (req.userObj.reportsTo) {
			const data = createNotificationData.constructNotification(
				"unAssigned",
				`has been unassigned from you.`,
				{ "id": req.userObj.id, "name": req.userObj.name },
				"users",
				req.userId,
				req.businessUnit
			);
			await sendViaUserID(
				"notification",
				req.userObj.reportsTo.toHexString(),
				data
			);
		}
		if (userReqObj.reportsTo) {
			const newUserName = userReqObj.name
				? userReqObj.name
				: req.userObj.name;

			const data = createNotificationData.constructNotification(
				"assign",
				`has been assigned to you.`,
				{ "id": req.userObj.id, "name": newUserName },
				"users",
				req.userId,
				req.businessUnit
			);
			await sendViaUserID("notification", userReqObj.reportsTo, data);
		}

		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while updating user", error.message);
		return apiResponseHandler.errorResponse(error, req,
			res,
			"Some internal server error",
			500,
			null
		);
	}
};

exports.getTotalAndEnabledUsersCount = async (req, res) => {
	try {
		const reqData = req.query;
		reqData.userId = req.userId;
		const users = await userManager.getTotalAndEnabledUsers(reqData, req.businessUnit);
		const message = "Users fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, users);
	} catch (error) {
		console.log("Error while fetching users", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

const createUserObject = (req) => {
	return {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		name: req.body.firstName + " " + req.body.lastName,
		buUserId: req.body.buUserId,
		employeeId: req.body.employeeId,
		email: req.body.email,
		contactNumber: req.body.contactNumber,
		countryCode: req.body.countryCode,
		isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
		reportsTo: req.body.reportsTo,
		image: req.body.image,
		eSignature: req.body.eSignatureId,
		businessUnit: req.businessUnit,
		department: req.body.department,
		userType: req.body.userType,
		designation: req.body.designation,
		team: req.body.team,
		createdBy: req.userId,
		updatedBy: req.userId
	};
};

const updateUserObject = (req) => {
	const updateObject = {
		updatedBy: req.userId
	};
	if (req.body.firstName || req.body.lastName) {
		if (req.body.firstName && req.body.lastName) {
			updateObject.firstName = req.body.firstName;
			updateObject.lastName = req.body.lastName;
			updateObject.name = req.body.firstName + " " + req.body.lastName;
		} else if (req.body.firstName) {
			updateObject.firstName = req.body.firstName;
			updateObject.name = req.body.firstName + " " + req.userObj.lastName;
		} else {
			updateObject.lastName = req.body.lastName;
			updateObject.name = req.userObj.firstName + " " + req.body.lastName;
		}
	}
	if (req.body.contactNumber) {
		updateObject.contactNumber = req.body.contactNumber;
	}
	if (req.body.countryCode) {
		updateObject.countryCode = req.body.countryCode;
	}
	if (req.body.imageId) {
		updateObject.image = req.body.image;
	}
	if (req.body.eSignature) {
		updateObject.eSignature = req.body.eSignature;
	}
	if (req.department) {
		updateObject.department = req.department;
		if (!req.team) {
			updateObject.team = null;
		}
	}
	if (req.userType) {
		updateObject.userType = req.userType;
	}
	if (req.designation) {
		updateObject.designation = req.designation;
	}
	if (req.team) {
		updateObject.team = req.team;
	}
	if (req.body.isEnabled !== undefined) {
		updateObject.isEnabled = req.body.isEnabled;
	}
	if (req.body.reportsTo) {
		updateObject.reportsTo = req.body.reportsTo;
	}
	if (req.shift) {
		updateObject.shift = req.shift;
	}
	return updateObject;
};
