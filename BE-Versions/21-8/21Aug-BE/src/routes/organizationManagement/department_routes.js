const express = require("express");
const departmentController = require("../../controllers/organizationManagement/department_controller");
const {
  departmentMiddleWare,
  businessUnitMiddleware,
  authJwtMiddleware,
} = require("../../middlewares");

const departmentRouter = express.Router();

departmentRouter.post(
  "/",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateCreateDepartmentRequestBody,
  ],
  departmentController.createDepartment
);

departmentRouter.get(
  "/",
  [authJwtMiddleware.verifyToken, businessUnitMiddleware.verifyBusinessUnit],
  departmentController.getAllDepartments
);

departmentRouter.get(
  "/:department",
  [
    authJwtMiddleware.verifyToken,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartment,
  ],
  departmentController.getDepartment
);

departmentRouter.patch(
  "/:department/enable",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartment,
  ],
  departmentController.enableDepartment
);

departmentRouter.patch(
  "/:department/disable",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartment,
  ],
  departmentController.disableDepartment
);

departmentRouter.patch(
  "/enable",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartments,
  ],
  departmentController.enableDepartments
);

departmentRouter.patch(
  "/disable",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartments,
  ],
  departmentController.disableDepartments
);

departmentRouter.delete(
  "/:department",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartment,
  ],
  departmentController.deleteDepartment
);

departmentRouter.delete(
  "/",
  [
    authJwtMiddleware.verifyToken,
    authJwtMiddleware.verifyIsSuperAdmin,
    businessUnitMiddleware.verifyBusinessUnit,
    departmentMiddleWare.validateDepartments,
  ],
  departmentController.deleteDepartments
);

departmentRouter.put(
    "/:department",
    [
      authJwtMiddleware.verifyToken,
      authJwtMiddleware.verifyIsSuperAdmin,
      businessUnitMiddleware.verifyBusinessUnit,
      departmentMiddleWare.validateUpdateDepartmentRequestBody,
      departmentMiddleWare.validateDepartment,
    ],
    departmentController.updateDepartment
  );

module.exports = { departmentRouter };
