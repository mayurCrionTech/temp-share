/*
date            cr/qid      comments
20-april-2026     CR0013     [updated] -added department check for adding new user
07-april-2026     CR0009      [updated] - added lagin limiter & rate limiter
13-march-2026     CR0010      [Added] - Permission checking middleware added
*/

const authController = require('../../controllers/userManagement/auth_controller');
const {
	businessUnitMiddleware,
	departmentMiddleWare,
	userTypeMiddleWare,
	designationMiddleware,
	permissionMiddleware,
	verifyPermissionReqBody,
	userMiddleware,
	teamMiddleware,
	authJwtMiddleware,
	shiftMiddleware,
	organizationMiddleware,
	authorizationMiddleware, // CR0010
} = require("../../middlewares");
const { loginLimiter, apiLimiter  } = require("../../middlewares/rateLimiter/rateLimiter"); // CR0009

const express = require("express");
// const authController = require("../../Controllers/UserManagement/Auth_Controler");

const authRouter = express.Router();

authRouter.post("/signin", loginLimiter, authController.signin); // CR0009

authRouter.post(
	"/signup",
	[
		apiLimiter, // CR0009
		authJwtMiddleware.verifyToken,
		authorizationMiddleware.checkPermission("users", "create"), // CR0010
		businessUnitMiddleware.verifyBusinessUnit,
		organizationMiddleware.validateUserDomain,
		userMiddleware.validateUserAndReturnObj,
		userMiddleware.constructPreCreateUserRequest,
		userMiddleware.checkDuplicateEmployeeId,
		shiftMiddleware.validateShift,
		departmentMiddleWare.validateDepartment,
		departmentMiddleWare.checkDepartmentAccess,//CR0013
		userTypeMiddleWare.validateUserType,
		designationMiddleware.validateDesignation,
		teamMiddleware.validateTeam,
		userMiddleware.validateReportsTo,
		userMiddleware.validateCreateUserRequest
	],
	authController.signup
);

authRouter.post("/signout", [authJwtMiddleware.verifyToken], authController.signout); // CR0016

// CR0009
authRouter.put("/resetPassword", [loginLimiter, authJwtMiddleware.verifyToken], authController.resetPassword);

// register user Auth
authRouter.post("/registerUserAuth", apiLimiter, authController.registerUserAuthentication);

// Get linked units route
authRouter.post("/:authId/linkedUnits", apiLimiter, authController.getLinkedUnits); // CR0009

// Verify Business Unit Token route
authRouter.post("/:authId/businessUnit/:businessUnitId/verifyBusinessUnitToken", loginLimiter, authController.verifyBusinessUnitToken); // CR0009


module.exports = { authRouter };
