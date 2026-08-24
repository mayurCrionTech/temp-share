/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
20-apr-2026     CR0010           Permission checks added
*/
const express = require("express");
const workOrderController = require("../../controllers/maintenanceManagement/workOrder_controller");
const fileController = require("../../controllers/fileSystem/fileSystem_controller");
const workOrderTaskController = require("../../controllers/maintenanceManagement/workOrderTask_controller");
const workOrderRemarkController = require("../../controllers/maintenanceManagement/workOrderRemark_controller");
const {
  authJwtMiddleware,
  assetMiddleware,
  workOrderMiddleware,
  departmentMiddleWare,
  fileMiddleware,
  maintenancePlanMiddleware,
  businessUnitMiddleware,
} = require("../../middlewares/index");
const {
  authorizationMiddleware, // CR0010
} = require("../../middlewares");
const workOrderRouter = express.Router();

workOrderRouter.post(
  "/",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateReqBody,
    workOrderMiddleware.createWorkOrder,
    assetMiddleware.validateAsset,
    assetMiddleware.checkAssetDepartmentAccess, //CR0013
    departmentMiddleWare.checkDepartmentAccess, //CR0013
    departmentMiddleWare.validateDepartments,
    workOrderMiddleware.verifyPriority,
    workOrderMiddleware.verifyStatus,
    workOrderMiddleware.verifyDuplicates,
    workOrderMiddleware.checkExistingAssigneeInDepartment,
    workOrderMiddleware.verifyStartDateAndEndDateTime,
    workOrderMiddleware.verifyEstimatedDaysAndHours,
    workOrderMiddleware.checkExistingTeamInDepartment,
    workOrderMiddleware.validateWorkOrderDocuments,
    workOrderMiddleware.validateWorkOrderImages,
  ],
  workOrderController.createWorkOrder,
);

workOrderRouter.get(
  "/constants",
  [authJwtMiddleware.verifyToken],
//   authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
  workOrderController.workOrderConstants,
);

workOrderRouter.get(
  "/statusCount",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  workOrderController.workOrderCount,
);

workOrderRouter.patch(
  "/:workOrder",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "update"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateReqBody,
    workOrderMiddleware.verifyPriority,
    workOrderMiddleware.verifyStatus,
    workOrderMiddleware.verifyDuplicates,
    workOrderMiddleware.checkExistingAssigneeInDepartment,
    workOrderMiddleware.validateEditStartDate,
    workOrderMiddleware.verifyStartDateAndEndDateTime,
    workOrderMiddleware.verifyEstimatedDaysAndHours,
    workOrderMiddleware.checkExistingTeamInDepartment,
    workOrderMiddleware.validateWorkOrderDocuments,
    workOrderMiddleware.validateWorkOrderTask,
    workOrderMiddleware.validateWorkOrderImages,
    workOrderMiddleware.validateStatusForEdit,
  ],
  workOrderController.editWorkOrder,
);

workOrderRouter.get(
  "/",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    departmentMiddleWare.validateDepartment,
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateAssetForWorkOrder,
    maintenancePlanMiddleware.validateMaintenancePlan,
  ],
  workOrderController.fetchWorkOrders,
);

workOrderRouter.get(
  "/:workOrder/tasks/:task/images",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateWorkOrderTask,
  ],
  workOrderTaskController.getTaskDetails,
);

workOrderRouter.post(
  "/:workOrder/tasks/:task/images",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateWorkOrderTask,
    fileMiddleware.uploadMultiple,
    fileMiddleware.validateMultipleFileExtensionAndSize,
    fileMiddleware.validateFileUpload,
  ],
  workOrderTaskController.addImages,
);

workOrderRouter.post(
  "/:workOrder/remarks",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderRemarkController.createWorkOrderRemarks,
);

workOrderRouter.get(
  "/:workOrder/remarks",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderRemarkController.fetchWorkOrderRemarks,
);

workOrderRouter.get(
  "/:workOrder",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderController.fetchWorkOrder,
);

workOrderRouter.post(
  "/:workOrder/accept",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateStatusForAccept,
  ],
  workOrderController.acceptWorkOrder,
);

workOrderRouter.post(
  "/:workOrder/putOnHold",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateStatusForOnHold,
  ],
  workOrderController.holdWorkOrder,
);

workOrderRouter.post(
  "/:workOrder/complete",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateStatusForComplete,
  ],
  workOrderController.completeWorkOrder,
);

workOrderRouter.patch(
  "/:workOrder/tasks/:task",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "update"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    workOrderMiddleware.validateWorkOrderTask,
    workOrderMiddleware.validateWorkOrderImages,
  ],
  workOrderTaskController.updateTaskStatus,
);

workOrderRouter.post(
  "/:workOrder/images",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    fileMiddleware.uploadSingle,
    fileMiddleware.validateFileExtensionAndSize,
    fileMiddleware.validateFileUpload,
  ],
  workOrderController.addImage,
);

workOrderRouter.post(
  "/:workOrder/images/bulkUpload",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "create"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
    fileMiddleware.uploadMultiple,
    fileMiddleware.validateMultipleFileExtensionAndSize,
    fileMiddleware.validateFileUpload,
  ],
  workOrderController.addImages,
);

workOrderRouter.get(
  "/:workOrder/spares",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderController.getSpareByWorkOrder,
);

workOrderRouter.get(
  "/:workOrder/images",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderController.getImages,
);

workOrderRouter.delete(
  "/",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "delete"), // CR0010
    workOrderMiddleware.validateWorkOrders,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderController.deleteWorkOrder,
);

workOrderRouter.get(
  "/:workOrder/copy",
  [
    authJwtMiddleware.verifyToken,
    // authorizationMiddleware.checkPermission("workOrders", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.checkWorkOrderDepartmentAccess, //CR0013
  ],
  workOrderController.copyWorkOrder,
);

module.exports = { workOrderRouter };
