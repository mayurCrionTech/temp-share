const express = require("express");
const permissionGroupController = require("../../controllers/organizationManagement/permissionGroup_controller");

const {
  authJwtMiddleware,
  permissionGroupMiddleware,
} = require("../../middlewares");

const permissionGroupRouter = express.Router();

permissionGroupRouter.post(
  "/",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validateCreatePermissionGroupRequestBody,
  ],
  permissionGroupController.createPermissionGroup
);

permissionGroupRouter.get(
  "/",
  [authJwtMiddleware.verifyToken,],
  permissionGroupController.getAllPermissionGroups
);

permissionGroupRouter.get(
  "/:permissionGroup",
  [
    authJwtMiddleware.verifyToken,
    permissionGroupMiddleware.validatePermissionGroup,
  ],
  permissionGroupController.getPermissionGroup
);

permissionGroupRouter.patch(
  "/:permissionGroup/enable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroup,
  ],
  permissionGroupController.enablePermissionGroup
);

permissionGroupRouter.patch(
  "/:permissionGroup/disable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroup,
  ],
  permissionGroupController.disablePermissionGroup
);

permissionGroupRouter.patch(
  "/enable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroups,
  ],
  permissionGroupController.enablePermissionGroups
);

permissionGroupRouter.patch(
  "/disable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroups,
  ],
  permissionGroupController.disablePermissionGroups
);

permissionGroupRouter.delete(
  "/:permissionGroup",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroup,
  ],
  permissionGroupController.deletePermissionGroup
);

permissionGroupRouter.delete(
  "/",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validatePermissionGroups,
  ],
  permissionGroupController.deletePermissionGroups
);

permissionGroupRouter.put(
  "/:permissionGroup",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    permissionGroupMiddleware.validateUpdatePermissionGroupRequestBody,
    permissionGroupMiddleware.validatePermissionGroup,
  ],
  permissionGroupController.updatePermissionGroup
);

module.exports = { permissionGroupRouter };
