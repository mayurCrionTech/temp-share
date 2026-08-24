/**
 * This file will contain the middlewares for valdiating the team request body
 */
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const teamManager = require("../../managers/internalManagers/userManagement/team_manager");


const validateCreateTeamRequestBody = async (req, res, next) => {
	// Validate request
	// if (!req.department || typeof req.department !== "string") {
	// 	return apiResponseHandler.errorResponse(null, req, 
	// 		res,
	// 		"Designation id must be a non-empty string",
	// 		400,
	// 		null
	// 	);
	// }

	if (!req.body.name || typeof req.body.name !== "string") {
		return apiResponseHandler.errorResponse(null, req, res, "Team name must be a non-empty string", 400, null);
	}

	// Check if the provided name already exists in the database
	const existingNameTeam = await teamManager.checkExistingNameForBusinessUnit(
		req.body.name,
		req.department
	);
	if (existingNameTeam) {
		return apiResponseHandler.errorResponse(null, req,
			res,
			"Failed! Team name already exists for the business unit",
			400,
			null
		);
	}

	if (req.body.isEnabled !== undefined) {
		if (typeof req.body.isEnabled !== "boolean") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Failed! Team isEnabled should be a boolean",
				400,
				null
			);
		}
	}
	next();
};

const validateUpdateTeamRequestBody = async (req, res, next) => {
	// Validate request
	if (req.body.name) {
		if (typeof req.body.name !== "string") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"BusinessUnit name must be a non-empty string",
				400,
				null
			);
		}

		let department = req.teamsObj
			? req.teamsObj.department
				? req.teamsObj.department
				: req.department
			: "";
		const existingNameTeam = await teamManager.checkExistingNameForBusinessUnit(
			req.body.name,
			department
		);
		if (existingNameTeam) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Failed! Team name already exists for the business unit",
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

const validateTeam = async (req, res, next) => {
	// Check if team is in req.params
	if (req.params.team || req.body.team) {
		if (req.params.team && typeof req.params.team === "string") {
			req.team = req.params.team;
		}
		// If not, check if team is in req.body
		else if (req.body.team && typeof req.body.team === "string") {
			req.team = req.body.team;
		}
		// If department is not in req.params or req.body, return an error response
		else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Team id must be a non-empty string in req.params or req.body",
				400,
				null
			);
		}
		let department = req.department
			? req.department
			: req.userObj
				? req.userObj.department
					? req.userObj.department
					: ""
				: "";

		let checkExistingTeam

		let fetchByField = req.query.fetchByField
		if (fetchByField == "name") {
			checkExistingTeam = await teamManager.getTeamByName(req.team, "", "", req.department, req.businessUnit);
		}
		else {
			checkExistingTeam = await teamManager.checkExistingTeam(req.team, req.department);
		}

		if (!checkExistingTeam) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Team does not exist", 404, null);
		} else {
			next();
		}
	} else {
		next();
	}
};

const validateTeamAndReturnObj = async (req, res, next) => {
	// Check if team is in req.params
	if (req.params.team || req.body.team) {
		if (req.params.team && typeof req.params.team === "string") {
			req.team = req.params.team;
		}
		// If not, check if team is in req.body
		else if (req.body.team && typeof req.body.team === "string") {
			req.team = req.body.team;
		}
		// If department is not in req.params or req.body, return an error response
		else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Team id must be a non-empty string in req.params or req.body",
				400,
				null
			);
		}
		let existingTeam = await teamManager.getTeam(req.team, "users,department");
		if (existingTeam) {
			req.teamObj = existingTeam;
			req.department = existingTeam.department;
			next();
		} else if (!existingTeam) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Team does not exist", 404, null);
		}
	} else {
		next();
	}
};

const validateTeams = async (req, res, next) => {
	if (!req.body.teams || !Array.isArray(req.body.teams) || req.body.teams.length === 0) {
		return apiResponseHandler.errorResponse(null, req,
			res,
			"Team ids must be a non-empty array of strings",
			400,
			null
		);
	}
	for (let i = 0; i < req.body.teams.length; i++) {
		if (typeof req.body.teams[i] !== "string") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Team ids must be a non-empty array of strings",
				400,
				null
			);
		}
	}

	let invalidTeams = await teamManager.returnInvalidTeams(req.body.teams);
	if (invalidTeams.length > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Team ids", 400, { invalidTeams });
	}
	next();
};

const validateTeamsFromBodyAndReturnObjs = async (req, res, next) => {
	if (!req.body.teams || !Array.isArray(req.body.teams) || req.body.teams.length === 0) {
		return apiResponseHandler.errorResponse(null, req,
			res,
			"Team ids must be a non-empty array of strings",
			400,
			null
		);
	}
	for (let i = 0; i < req.body.teams.length; i++) {
		if (typeof req.body.teams[i] !== "string") {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Team ids must be a non-empty array of strings",
				400,
				null
			);
		}
	}

	let validAndInvalidTeams = await teamManager.returnValidAndInvalidTeams(
		req.body.teams,
		req.department
	);
	let invalidTeams = validAndInvalidTeams.invalidTeams;
	if (invalidTeams.length > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Team ids", 400, { invalidTeams });
	}
	req.teamsObjs = validAndInvalidTeams.validTeams;
	next();
};
const validateTeamsFromQuery = async (req, res, next) => {
	if (req.query.teams) {
		//convert the string to array

		let teams = req.query.teams.split(",");

		if (!teams || !Array.isArray(teams) || teams.length === 0) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Team ids must be a non-empty string with comma separated values",
				400,
				null
			);
		}

		let invalidTeams = await teamManager.returnInvalidTeams(teams, req.department);
		if (invalidTeams.length > 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Team ids", 400, {
				invalidTeams
			});
		}

		req.teams = teams;
	}
	next();
};

const validateAppendAndRemoveUsersFromBody = async (req, res, next) => {
	let isValid = true;
	let message = "";
	let errorInfo = null;

	//Check if appendUsers and removeUsers are in req.body
	if (req.body.appendUsers || req.body.removeUsers) {
		if (req.body.appendUsers && isValid) {
			if (!Array.isArray(req.body.appendUsers) || req.body.appendUsers.length === 0) {
				isValid = false;
				message = "appendUsers must be a non-empty array of strings";
				errorInfo = null;
			}
		}
		if (req.body.removeUsers && isValid) {
			if (!Array.isArray(req.body.removeUsers) || req.body.removeUsers.length === 0) {
				isValid = false;
				message = "removeUsers must be a non-empty array of strings";
				errorInfo = null;
			}
		}

		//return error if user is present in both appendUsers and removeUsers
		if (req.body.appendUsers && req.body.removeUsers && isValid) {
			let commonUsers = req.body.appendUsers.filter((user) => req.body.removeUsers.includes(user));
			if (commonUsers.length > 0) {
				isValid = false;
				message = "Failed! User cannot be present in both appendUsers and removeUsers";
				errorInfo = { commonUsers };
			}
		}

		if (req.body.appendUsers && isValid) {
			for (let i = 0; i < req.body.appendUsers.length; i++) {
				if (typeof req.body.appendUsers[i] !== "string") {
					isValid = false;
					message = "appendUsers must be a non-empty array of strings";
					errorInfo = null;
				}
			}
			let invalidUsers = await userManager.returnInvalidUserIds(
				req.body.appendUsers,
				req.businessUnit,
				req.department
			);
			if (invalidUsers.length > 0) {
				isValid = false;
				message = "Failed! Invalid User ids";
				errorInfo = { invalidUsers };
			}
		}
		if (req.body.appendUsers && isValid) {
			let usersWithoutTeam = await userManager.returnUsersWithoutTeam(
				req.body.appendUsers,
				req.businessUnit,
				req.department
			);
			if (req.body.appendUsers.length !== usersWithoutTeam.length) {
				isValid = false;
				message = "Failed! Some users already have a team. But you are trying to append them";
				//send the users who already have a team
				let usersWithTeam = req.body.appendUsers.filter((user) => !usersWithoutTeam.includes(user));
				errorInfo = { usersWithTeam };
			}
		}
		if (req.body.removeUsers && isValid) {
			for (let i = 0; i < req.body.removeUsers.length; i++) {
				if (typeof req.body.removeUsers[i] !== "string") {
					isValid = false;
					(message = "removeUsers must be a non-empty array of strings"), (errorInfo = null);
				}
			}
			let invalidUsers = await userManager.returnInvalidUserIds(
				req.body.removeUsers,
				req.businessUnit,
				req.department
			);
			if (invalidUsers.length > 0) {
				isValid = false;
				message = "Failed! Invalid User ids";
				errorInfo = { invalidUsers };
			}
		}

		if (req.body.removeUsers && isValid) {
			let usersWithSpecificTeam = await userManager.returnUsersWithSpecificTeam(
				req.body.removeUsers,
				req.team,
				req.businessUnit,
				req.department
			);
			if (req.body.removeUsers.length !== usersWithSpecificTeam.length) {
				isValid = false;
				message =
					"Failed! Some users doesn't belong to the team. But you are trying to remove them";
				//send the users who do not have the team
				let usersWithoutTeam = req.body.removeUsers.filter(
					(user) => !usersWithSpecificTeam.includes(user)
				);
				errorInfo = { usersWithoutTeam };
			}
		}

		if (isValid) {
			next();
		} else {
			return apiResponseHandler.errorResponse(null, req, res, message, 400, errorInfo);
		}
	} else {
		next();
	}
};

const teamMiddleware = {
	validateCreateTeamRequestBody: validateCreateTeamRequestBody,
	validateUpdateTeamRequestBody: validateUpdateTeamRequestBody,
	validateTeam: validateTeam,
	validateTeams: validateTeams,
	validateTeamsFromQuery: validateTeamsFromQuery,
	validateTeamAndReturnObj: validateTeamAndReturnObj,
	validateAppendAndRemoveUsersFromBody: validateAppendAndRemoveUsersFromBody,
	validateTeamsFromBodyAndReturnObjs: validateTeamsFromBodyAndReturnObjs
};

module.exports = teamMiddleware;
