const express = require("express");
const permissionController = require("../../controllers/organizationManagement/permission_controller");
const {
  permissionMiddleware,
  businessUnitMiddleware,
  authJwtMiddleware,
  permissionGroupMiddleware,
} = require("../../middlewares");

const permissionRouter = express.Router();

  permissionRouter.post(
    "/",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionGroupMiddleware.validatePermissionGroup,
      permissionMiddleware.validateCreatePermissionRequestBody,
    ],
    permissionController.createPermission
  );

  permissionRouter.get(
    "/",
    [
      authJwtMiddleware.verifyToken,
      permissionGroupMiddleware.validatePermissionGroup,
    ],
    permissionController.getAllPermissions
  );

  permissionRouter.get(
    "/:permission",
    [
      authJwtMiddleware.verifyToken,
      permissionMiddleware.validatePermission,
    ],
    permissionController.getPermission
  );

  permissionRouter.patch(
    "/:permission/enable",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermission,
    ],
    permissionController.enablePermission
  );

  permissionRouter.patch(
    "/:permission/disable",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermission,
    ],
    permissionController.disablePermission
  );

  permissionRouter.patch(
    "/enable",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermissions,
    ],
    permissionController.enablePermissions
  );

  permissionRouter.patch(
    "/disable",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermissions,
    ],
    permissionController.disablePermissions
  );

  permissionRouter.delete(
    "/:permission",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermission,
    ],
    permissionController.deletePermission
  );

  permissionRouter.delete(
    "/",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermissions,
    ],
    permissionController.deletePermissions
  );

  permissionRouter.put(
    "/:permission",
    [
      authJwtMiddleware.verifyToken,
       authJwtMiddleware.verifyIsSuperAdmin,
      permissionMiddleware.validatePermission,
      permissionMiddleware.validateUpdatePermissionRequestBody,
    ],
    permissionController.updatePermission
  );


  module.exports = { permissionRouter };