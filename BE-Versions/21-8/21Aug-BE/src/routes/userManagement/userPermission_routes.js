const express = require("express");
const userPermissionController = require("../../controllers/userManagement/userPermission_controller");
const {
	businessUnitMiddleware,
	authJwtMiddleware,
    userPermissionMiddleware,
    permissionMiddleware
} = require("../../middlewares");


const userPermissionRouter = express.Router();

userPermissionRouter.put("/updateMultiple", [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        userPermissionMiddleware.checkUserPermissionsIsArray ,
        userPermissionMiddleware.validateUserPermissionsArray ,
        permissionMiddleware.validatePositivePermissionsArray ,
        permissionMiddleware.validateNegativePermissionsArray,
    ], userPermissionController.updateMultipleUserPermissions);

    userPermissionRouter.put("/:userPermission", [ authJwtMiddleware.verifyToken, businessUnitMiddleware.verifyBusinessUnit, userPermissionMiddleware.validateUserPermission,
        permissionMiddleware.validatePositivePermissions, permissionMiddleware.validateNegativePermissions,
    ], userPermissionController.updateUserPermission);

    module.exports = { userPermissionRouter };
