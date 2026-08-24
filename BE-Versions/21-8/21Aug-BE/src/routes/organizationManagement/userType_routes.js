const express = require("express");
const userTypeController = require("../../controllers/organizationManagement/userType_controller");

const {
  userTypeMiddleWare,
  departmentMiddleWare,
  businessUnitMiddleware,
  authJwtMiddleware,
} = require("../../middlewares");

const userTypeRouter = express.Router();

userTypeRouter.post(
  "/",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartment,
    userTypeMiddleWare.validateCreateUserTypeRequestBody,
  ],
  userTypeController.createUserType
);

userTypeRouter.get(
  "/",
  [
    authJwtMiddleware.verifyToken,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartmentsFromQuery,
    departmentMiddleWare.validateDepartment,
  ],
  userTypeController.getAllUserTypes
);

userTypeRouter.get(
  "/:userType",
  [
    authJwtMiddleware.verifyToken,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserType,
  ],
  userTypeController.getUserType
);

userTypeRouter.patch(
  "/:userType/enable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserType,
  ],
  userTypeController.enableUserType
);

userTypeRouter.patch(
  "/:userType/disable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserType,
  ],
  userTypeController.disableUserType
);

userTypeRouter.patch(
  "/enable",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserTypes,
  ],
  userTypeController.enableUserTypes
);

userTypeRouter.patch(
  "/disable",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserTypes,
  ],
  userTypeController.disableUserTypes
);

userTypeRouter.delete(
  "/:userType",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserType,
  ],
  userTypeController.deleteUserType
);

userTypeRouter.delete(
  "/",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserTypes,
  ],
  userTypeController.deleteUserTypes
);

userTypeRouter.put(
  "/:userType",
  [
    authJwtMiddleware.verifyToken,
     authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    userTypeMiddleWare.validateUserType,
    userTypeMiddleWare.validateUpdateUserTypeRequestBody,
  ],
  userTypeController.updateUserType
);

module.exports = { userTypeRouter };
