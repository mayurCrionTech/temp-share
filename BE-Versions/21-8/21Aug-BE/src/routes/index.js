/*
date            cr/qid      comments
16-march-2026     CR0001      route added for dropdown
06-april-2026     CR0009      [updated] - added auth middleware check for file upload
05-May-2026       CR0029      [Added] - Authetication for tags and missing apis
*/

const express = require("express");
const { userRouter } = require("./userManagement/user_routes");
const { authRouter } = require("./userManagement/auth_routes");

const {
  businessUnitRouter,
} = require("./organizationManagement/businessUnit_routes");
const {
  departmentRouter,
} = require("./organizationManagement/department_routes");
const { userTypeRouter } = require("./organizationManagement/userType_routes");
const {
  permissionGroupRouter,
} = require("./organizationManagement/permissionGroup_routes");
const {
  permissionRouter,
} = require("./organizationManagement/permission_routes");
const {
  designationRouter,
} = require("./organizationManagement/designation.routes");
const { assetRouter } = require("./assetManagement/asset_routes");
const {
  assetParameterRouter,
} = require("./assetManagement/assetParameter_routes");
const { workOrderRouter } = require("./maintenanceManagement/workOrder_routes");
const {
  workOrderPartsRequirementRouter,
} = require("./maintenanceManagement/workOrderPartRequirement_routes");
const {
  workOrderDueDateRouter,
} = require("./maintenanceManagement/workOrderDueDateRequest_routes");
const { checklistRouter } = require("./checklistManagement/checklist_routes");
const { teamRouter } = require("./userManagement/team_routes");
const {
  userPermissionRouter,
} = require("./userManagement/userPermission_routes");
const {
  sparesAndInventoryRouter,
} = require("./assetManagement/sparesAndInventory_routes");
const { fileRouter } = require("./fileSystem/fileSystem_router");
const { authJwtMiddleware } = require("../middlewares");
const {
  notificationRouter,
} = require("./notificationManagement/notification_routes");
const { activityRouter } = require("./activityManagement/activity_routes");
const { reportRouter } = require("./reportManagement/report_routes");
const { assetHistoryRouter } = require("./assetManagement/assetHistory_routes");
const {
  personalProtectiveEquipmentRouter,
} = require("./assetManagement/personalProtectiveEquipment_routes");
const {
  assetCategoryRouter,
} = require("./assetManagement/assetCategory_routes");
const { logRouter } = require("./logManagement/log_routes");
const { logEntryRouter } = require("./logManagement/logEntry_routes");
const { shiftRouter } = require("./organizationManagement/shift_routes");
const {
  assetDocumentRouter,
} = require("./assetManagement/assetDocument_routes");
const {
  taskLibraryRouter,
} = require("./maintenanceManagement/taskLibrary_routes");
const {
  maintenancePlanRouter,
} = require("./maintenanceManagement/maintenancePlan_routes");
const { dashBoardRouter } = require("./dashBoardManagement/dashBoard_routes");
const module_config = require("../configs/module_config");
// const { organizationRouter } = require("./organizationManagement/organization_routes");
const { spareRouter } = require("./spareManagement/spare_routes");
const { assetSpareRouter } = require("./assetManagement/assetSpare_routes");
const {
  organizationRouter,
} = require("./organizationManagement/organization_routes");
const {
  assetDashBoardRouter,
} = require("./dashBoardManagement/assetDashBoard_routes");
const {
  processDashBoardRouter,
} = require("./dashBoardManagement/processDashboard_routes");
const { plant3DRouter } = require("./plant3DManagement/plant3DModels_routers");
const {
  userUploaded3DModelRouter,
} = require("./userUpload3DManagement/userUploaded3DModels_routes");

const { tagRouter } = require("./tags/tagRoutes");
const { assetRouters } = require("./assetMockManagement/assetMock");
const { plcRouters } = require("./plcManagement/plcRoutes");
const { truckRouter } = require("./truckManagement/truck_routes");
const { dropdownRouter } = require("./dropdownManagement/dropdown_routes");

const router = express();

router.use("/spares", authJwtMiddleware.verifyToken, spareRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/businessUnits", businessUnitRouter);
router.use("/departments", departmentRouter);
router.use("/userTypes", userTypeRouter);
router.use("/permissionGroups", permissionGroupRouter);
router.use("/permissions", permissionRouter);
router.use("/designations", designationRouter);
router.use("/userPermissions", userPermissionRouter);
router.use("/teams", teamRouter);
router.use(
  "/personalProtectiveEquipments",
  authJwtMiddleware.verifyToken,
  personalProtectiveEquipmentRouter,
);
router.use("/assets", [authJwtMiddleware.verifyToken], assetRouter);
router.use(
  "/assets/:asset/parameters",
  [authJwtMiddleware.verifyToken],
  assetParameterRouter,
);
router.use(
  "/assets/:asset/spares",
  [authJwtMiddleware.verifyToken],
  assetSpareRouter,
);
router.use(
  "/assets/:asset/history",
  [authJwtMiddleware.verifyToken],
  assetHistoryRouter,
);
router.use("/notifications", notificationRouter);
router.use("/activities", activityRouter);
if (module_config.WORKORDER_MODULE == "true") {
  router.use(
    "/workOrders",
    workOrderRouter,
    workOrderPartsRequirementRouter,
    workOrderDueDateRouter,
  );
}
// router.use("/workOrders", workOrderDueDateRouter);
router.use("/checklists", authJwtMiddleware.verifyToken, checklistRouter);
// router.use("/spares", sparesAndInventoryRouter);
router.use("/files", authJwtMiddleware.verifyToken, fileRouter); // CR0009
router.use("/reports", authJwtMiddleware.verifyToken, reportRouter);
router.use(
  "/assetCategories",
  authJwtMiddleware.verifyToken,
  assetCategoryRouter,
);
router.use("/logs", authJwtMiddleware.verifyToken, logRouter);
router.use("/entries", authJwtMiddleware.verifyToken, logEntryRouter);
router.use("/shifts", authJwtMiddleware.verifyToken, shiftRouter);
router.use(
  "/assetDocuments",
  authJwtMiddleware.verifyToken,
  assetDocumentRouter,
);
router.use("/tasks", authJwtMiddleware.verifyToken, taskLibraryRouter);
router.use(
  "/maintenancePlans",
  authJwtMiddleware.verifyToken,
  maintenancePlanRouter,
);
router.use("/dashBoards", authJwtMiddleware.verifyToken, dashBoardRouter);
router.use("/organizations", authJwtMiddleware.verifyToken, organizationRouter);
router.use(
  "/assetDashBoards",
  authJwtMiddleware.verifyToken,
  assetDashBoardRouter,
);
router.use(
  "/processDashboards",
  authJwtMiddleware.verifyToken,
  processDashBoardRouter,
);

router.use("/plant3DModels", authJwtMiddleware.verifyToken, plant3DRouter);
router.use(
  "/userUploaded3DModels",
  authJwtMiddleware.verifyToken,
  userUploaded3DModelRouter,
);

// router.use("/tags", authJwtMiddleware.verifyToken, tagRouter); // CR0029
// router.use("/assetMocks", authJwtMiddleware.verifyToken, assetRouters); // CR0029
// router.use("/plcTags", authJwtMiddleware.verifyToken, plcRouters); // CR0029
// router.use("/trucks", authJwtMiddleware.verifyToken, truckRouter); // CR0029

router.use("/tags", tagRouter); // CR0029
router.use("/assetMocks", assetRouters); // CR0029
router.use("/plcTags", plcRouters); // CR0029
router.use("/trucks", truckRouter); // CR0029
// CR0001 - Start
router.use("/dropdowns", authJwtMiddleware.verifyToken, dropdownRouter);

module.exports = { router };
