const teamController = require("../../controllers/userManagement/team_controller");
const {
	businessUnitMiddleware,
	departmentMiddleWare,
	userMiddleware,
	teamMiddleware,
	authJwtMiddleware
} = require("../../middlewares");

const express = require("express");


const teamRouter = express.Router();


teamRouter.post(
	"/",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		departmentMiddleWare.validateDepartment,
		userMiddleware.validateUsers,
		userMiddleware.validateUsersWithoutTeam,
		teamMiddleware.validateCreateTeamRequestBody
	],
	teamController.createTeam
);

teamRouter.get(
	"/",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		departmentMiddleWare.validateDepartmentsFromQuery
	],
	teamController.getAllTeams
);

teamRouter.get(
	"/:team",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		departmentMiddleWare.validateDepartment,
		teamMiddleware.validateTeam
	],
	teamController.getTeam
);

teamRouter.patch(
	"/:team/enable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeam
	],
	teamController.enableTeam
);

teamRouter.patch(
	"/:team/disable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeam
	],
	teamController.disableTeam
);

teamRouter.patch(
	"/enable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeams
	],
	teamController.enableTeams
);

teamRouter.patch(
	"/disable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeams
	],
	teamController.disableTeams
);

teamRouter.delete(
	"/:team",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeamAndReturnObj
	],
	teamController.deleteTeam
);

teamRouter.delete(
	"/",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeamsFromBodyAndReturnObjs
	],
	teamController.deleteTeams
);

teamRouter.put(
	"/:team",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		teamMiddleware.validateTeamAndReturnObj,
		teamMiddleware.validateAppendAndRemoveUsersFromBody,
		teamMiddleware.validateUpdateTeamRequestBody
	],
	teamController.updateTeam
);

module.exports = { teamRouter };
