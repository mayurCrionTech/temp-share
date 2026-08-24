/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
*/
const express = require("express");
const maintenancePlanController = require("../../controllers/maintenanceManagement/maintenancePlan_controller");
const fileController = require("../../controllers/fileSystem/fileSystem_controller");
const workOrderTaskController = require("../../controllers/maintenanceManagement/workOrderTask_controller");
const workOrderRemarkController = require("../../controllers/maintenanceManagement/workOrderRemark_controller");
const {
  businessUnitMiddleware,
  assetMiddleware,
  workOrderMiddleware,
  departmentMiddleWare,
  maintenancePlanMiddleware,
} = require("../../middlewares/index");
const maintenancePlanRouter = express.Router();

maintenancePlanRouter.post(
  "/",
  [
    businessUnitMiddleware.verifyBusinessUnit,
    maintenancePlanMiddleware.validateReqBody,
    maintenancePlanMiddleware.validateCreateMaintenancePlan,
    assetMiddleware.validateAsset,
     assetMiddleware.checkAssetDepartmentAccess,//CR0013
     departmentMiddleWare.checkDepartmentAccess,//CR0013
    departmentMiddleWare.validateDepartments,
    maintenancePlanMiddleware.verifyPriority,
    maintenancePlanMiddleware.validateMaintenancePlanRecurrence,
    maintenancePlanMiddleware.verifyDuplicates,
    maintenancePlanMiddleware.checkExistingAssigneeInDepartment,
    maintenancePlanMiddleware.verifyStartDateAndEndDateTime,
    maintenancePlanMiddleware.verifyEstimatedDaysAndHours,
    maintenancePlanMiddleware.checkExistingTeamInDepartment,
    maintenancePlanMiddleware.validateMaintenancePlanDocuments,
    maintenancePlanMiddleware.validateMaintenancePlanImages,
  ],
  maintenancePlanController.createMaintenancePlan
);

maintenancePlanRouter.get("/", [
  businessUnitMiddleware.verifyBusinessUnit,
  maintenancePlanMiddleware.validateAssetForMaintenancePlan,
  departmentMiddleWare.validateDepartment,
],
  maintenancePlanController.fetchMaintenancePlans);

maintenancePlanRouter.get(
  "/statusCount", [ businessUnitMiddleware.verifyBusinessUnit,],
  maintenancePlanController.maintenanceCount
);

maintenancePlanRouter.get(
  "/:maintenancePlan",
  [
    businessUnitMiddleware.verifyBusinessUnit,
    maintenancePlanMiddleware.validateMaintenancePlan,
    maintenancePlanMiddleware.checkMaintenancePlanDepartmentAccess //CR0013
  ],
  maintenancePlanController.fetchMaintenancePlan
);


maintenancePlanRouter.delete(
  "/",
  [maintenancePlanMiddleware.validateMaintenancePlans,maintenancePlanMiddleware.checkMaintenancePlanDepartmentAccess], //CR0013 -> checkMaintenancePlanDepartmentAccess
  maintenancePlanController.deleteMaintenancePlan
);

maintenancePlanRouter.patch(
  "/:maintenancePlan",
  [
    maintenancePlanMiddleware.validateMaintenancePlan,
    maintenancePlanMiddleware.checkMaintenancePlanDepartmentAccess, //CR0013
    maintenancePlanMiddleware.validateReqBody,
    maintenancePlanMiddleware.verifyPriority,
    // workOrderMiddleware.verifyStatus,
    maintenancePlanMiddleware.verifyDuplicates,
    maintenancePlanMiddleware.checkExistingAssigneeInDepartment,
    maintenancePlanMiddleware.validateEditStartDate,
    maintenancePlanMiddleware.verifyStartDateAndEndDateTime,
    maintenancePlanMiddleware.verifyEstimatedDaysAndHours,
    maintenancePlanMiddleware.checkExistingTeamInDepartment,
    maintenancePlanMiddleware.validateMaintenancePlanDocuments,
    maintenancePlanMiddleware.validateTask,
    maintenancePlanMiddleware.validateMaintenancePlanImages,
  ],
  maintenancePlanController.editMaintenancePlan
);

maintenancePlanRouter.get(
  "/:maintenancePlan/versions",
  [
    businessUnitMiddleware.verifyBusinessUnit,
    maintenancePlanMiddleware.validateMaintenancePlan,
  ],
  maintenancePlanController.getVersionByMaintenanceId
);

maintenancePlanRouter.get(
  "/:maintenancePlan/versions/:version",
  [
    businessUnitMiddleware.verifyBusinessUnit,
    maintenancePlanMiddleware.validateMaintenancePlan,
    maintenancePlanMiddleware.validateMaintenancePlanVersion,
  ],
  maintenancePlanController.getMaintenancePlanVersion
);

module.exports = { maintenancePlanRouter };
