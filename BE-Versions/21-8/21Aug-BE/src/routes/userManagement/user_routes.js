const express = require("express");
const userController = require("../../controllers/userManagement/user_controler");

const {
	businessUnitMiddleware,
	departmentMiddleWare,
	userTypeMiddleWare,
	designationMiddleware,
	userMiddleware,
	teamMiddleware,
	authJwtMiddleware,
	timeStampMiddleware,
	shiftMiddleware
} = require("../../middlewares");

const userRouter = express.Router();



userRouter.get(
	"/",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		departmentMiddleWare.validateDepartmentsFromQuery,
		userMiddleware.validateMongoDBIdsFromQuery,
		userTypeMiddleWare.validateUserTypesFromQuery,
		designationMiddleware.validateDesignationsFromQuery,
		teamMiddleware.validateTeamsFromQuery,
		userMiddleware.validateReportsTosFromQuery,
		timeStampMiddleware.validateCreatedAtFromQueryForSearch,
		timeStampMiddleware.validateUpdatedAtFromQueryForSearch
	],
	userController.getAllUsers
);

userRouter.get(
	"/count",
	[authJwtMiddleware.verifyToken, businessUnitMiddleware.verifyBusinessUnit],
	userController.getTotalAndEnabledUsersCount
);

userRouter.get(
	"/:user",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUser
	],
	userController.getUser
);

userRouter.patch(
	"/:user/enable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUser,
		userMiddleware.rejectUpdatingUserBySameUser
	],
	userController.enableUser
);

userRouter.patch(
	"/:user/disable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUser,
		userMiddleware.rejectUpdatingUserBySameUser
	],
	userController.disableUser
);

userRouter.patch(
	"/enable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUsers,
		userMiddleware.rejectUpdatingUsersBySameUser
	],
	userController.enableUsers
);

userRouter.patch(
	"/disable",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUsers,
		userMiddleware.rejectUpdatingUsersBySameUser
	],
	userController.disableUsers
);

userRouter.delete(
	"/:user",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUser,
		userMiddleware.rejectUpdatingUserBySameUser
	],
	userController.deleteUser
);

userRouter.delete(
	"/",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUsers,
		userMiddleware.rejectUpdatingUsersBySameUser
	],
	userController.deleteUsers
);

userRouter.put(
	"/:user",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyBusinessUnit,
		userMiddleware.validateUserAndReturnObj,
		userMiddleware.validatePreUpdateUserRequest,
		departmentMiddleWare.validateDepartment,
		userTypeMiddleWare.validateUserType,
		designationMiddleware.validateDesignation,
		shiftMiddleware.validateShift,
		teamMiddleware.validateTeam,
		userMiddleware.validateReportsTo
	],
	userController.updateUser
);

module.exports = { userRouter };
