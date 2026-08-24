/**
 * This is the controller for the team resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const teamManager = require("../../managers/internalManagers/userManagement/team_manager");
/**
 * Create a team
 *
 */

exports.createTeam = async (req, res) => {
	try {
		const teamReqObj = createTeamObject(req);
		const team = await teamManager.createTeam(teamReqObj);
		await userManager.updateUsers(req.body.users, { team: team.id });
		const message = "Team created successfully";
		return apiResponseHandler.successResponse(res, message, 201, team);
	} catch (error) {
		console.log("Error while creating the team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Get all teams
 *
 */

exports.getAllTeams = async (req, res) => {
	try {
		const requestBU = req.businessUnit ? req.businessUnit : null;
		const teams = await teamManager.getAllTeams(req.query, requestBU);
		const message = "Teams fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, teams);
	} catch (error) {
		console.log("Error while fetching teams", error.message, error);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Get a team
 *
 */

exports.getTeam = async (req, res) => {
	try {
		let team
		let fetchByField = req.query.fetchByField
		if (fetchByField == "name") {
			team = await teamManager.getTeamByName(req.team, req.query.selectFields, req.query.populateFields, req.department, req.businessUnit);
		}
		else {
			team = await teamManager.getTeam(
				req.params.team,
				req.query.selectFields,
				req.query.populateFields,
				req.businessUnit
			);
		}

		if (!team) {
			return apiResponseHandler.errorResponse(null, req, res, "Team not found", 404, null);
		}
		const message = "Team fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, team);
	} catch (error) {
		console.log("Error while fetching team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Enable a team
 *
 */

exports.enableTeam = async (req, res) => {
	try {
		const team = await teamManager.enableTeam(req.params.team, req.businessUnit);
		const message = "Team enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Disable a team
 *
 */

exports.disableTeam = async (req, res) => {
	try {
		const team = await teamManager.disableTeam(req.params.team, req.businessUnit);
		const message = "Team disabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Enable teams
 *
 */

exports.enableTeams = async (req, res) => {
	try {
		await teamManager.enableTeams(req.body.teams, req.businessUnit);
		const message = "Teams enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling teams", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Disable teams
 *
 */

exports.disableTeams = async (req, res) => {
	try {
		await teamManager.disableTeams(req.body.teams, req.businessUnit);
		const message = "Teams disabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling teams", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Delete a team
 *
 */

exports.deleteTeam = async (req, res) => {
	try {
		await teamManager.deleteTeam(req.params.team, req.businessUnit);
		await userManager.removeTeamFromUsers(req.teamObj.users, req.params.team);
		const message = "Team deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Delete teams
 *
 */

exports.deleteTeams = async (req, res) => {
	try {
		await teamManager.deleteTeams(req.body.teams);
		const removeTeamsFromUsers = await teamManager.returnUsersFromTeams(req.teamsObjs);
		await userManager.updateUsers(removeTeamsFromUsers, { team: null });
		const message = "Teams deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting teams", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

/**
 * Update a team
 *
 */

exports.updateTeam = async (req, res) => {
	try {
		const teamReqObj = updateTeamObject(req);
		const team = await teamManager.updateTeam(req.params.team, teamReqObj);
		if (req.body.appendUsers) {
			await userManager.updateUsers(req.body.appendUsers, { team: req.params.team });
			await teamManager.appendUsersToTeam(req.params.team, req.body.appendUsers);
		}
		if (req.body.removeUsers) {
			await userManager.updateUsers(req.body.removeUsers, { team: null });
			await teamManager.removeUsersFromTeam(req.params.team, req.body.removeUsers);
		}
		const message = "Team updated successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while updating team", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

const createTeamObject = (req) => {
	return {
		name: req.body.name,
		businessUnit: req.businessUnit,
		department: req.department,
		users: req.body.users ? req.body.users : [],
		isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
		createdBy: req.userId,
		updatedBy: req.userId
	};
};

const updateTeamObject = (req) => {
	const updateObject = {
		updatedBy: req.userId
	};
	if (req.body.name) {
		updateObject.name = req.body.name;
	}
	if (req.body.isEnabled !== undefined) {
		updateObject.isEnabled = req.body.isEnabled;
	}
	if (req.body.appendUsers) {
		updateObject.appendUsers = req.body.appendUsers;
	}

	if (req.body.removeUsers) {
		updateObject.removeUsers = req.body.removeUsers;
	}
	return updateObject;
};
