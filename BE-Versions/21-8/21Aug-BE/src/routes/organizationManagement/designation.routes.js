const express = require("express");
const designationController = require("../../controllers/organizationManagement/designation_controller");

const {
  designationMiddleware,
  businessUnitMiddleware,
  permissionMiddleware,
  authJwtMiddleware,
  userTypeMiddleWare
} = require("../../middlewares");

const designationRouter = express.Router();

  designationRouter.post(
    "/",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      userTypeMiddleWare.validateUserType,
      permissionMiddleware.validatePermissions,
      designationMiddleware.validateCreateDesignationRequestBody
    ],
    designationController.createDesignation
  );

  designationRouter.get(
    "/",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      userTypeMiddleWare.validateUserTypesFromQuery,
      userTypeMiddleWare.validateUserType
    ],
    designationController.getAllDesignations
  );

  designationRouter.get(
    "/:designation",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation
    ],
    designationController.getDesignation
  );

  designationRouter.patch(
    "/:designation/enable",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation
    ],
    designationController.enableDesignation
  );

  designationRouter.patch(
    "/:designation/disable",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation
    ],
    designationController.disableDesignation
  );

  designationRouter.patch(
    "/enable",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignations
    ],
    designationController.enableDesignations
  );

  designationRouter.patch(
    "/disable",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignations
    ],
    designationController.disableDesignations
  );

  designationRouter.delete(
    "/:designation",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation
    ],
    designationController.deleteDesignation
  );

  designationRouter.delete(
    "/",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignations
    ],
    designationController.deleteDesignations
  );

  designationRouter.put(
    "/update",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation,
      permissionMiddleware.validatePermissions,
      designationMiddleware.validateUpdateDesignationRequestBody
    ],
    designationController.updateDesignation
  );

  designationRouter.put(
    "/updateMultiple",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.checkDesignationsUpdateIsArray,
      designationMiddleware.validateDesignationsUpdateArray,
      permissionMiddleware.validateMultiplePermissionsForDesignationsUpdateArray
    ],
    designationController.updateMultipleDesignations
  );

  designationRouter.put(
    "/:designation",
    [
      authJwtMiddleware.verifyToken,
      businessUnitMiddleware.verifyBusinessUnit,
      designationMiddleware.validateDesignation,
      permissionMiddleware.validatePermissions,
      designationMiddleware.validateUpdateDesignationRequestBody
    ],
    designationController.updateDesignation
  );
;
  module.exports = { designationRouter };