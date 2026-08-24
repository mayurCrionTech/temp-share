/*
date              cr/qid      comments
13-march-2026     CR0010      [Added] - Permission checking middleware added
*/

const authJwtMiddleware = require("./usermanagement/authJwt_middleware");
const businessUnitMiddleware = require("./organizationManagement/businessUnit_middleware");
const departmentMiddleWare = require("./organizationManagement/department_middleware");
const userTypeMiddleWare = require("./organizationManagement/userType_middleware");
const permissionGroupMiddleware = require("./organizationManagement/permissionGroup_middleware");
const permissionMiddleware = require("./organizationManagement/permission_middleware");
const workOrderMiddleware = require("./maintenanceManagement/workOrder_middleware");
const workOrderPartsMiddleware = require("./maintenanceManagement/workOrderPartsRequirement_middleware");
const spareAndInventoryMiddleware = require("./assetManagement/sparesAndInventory_middleware");
const designationMiddleware = require("./organizationManagement/designation_middleware");
const userMiddleware = require("./usermanagement/user_middleware");
const userPermissionMiddleware = require("./usermanagement/userPermission_middleware");
const teamMiddleware = require("./usermanagement/team_middleware");
const timeStampMiddleware = require("./common/timeStamp_middleware");
const fileMiddleware = require("./fileSystem/fileSystem_middleware");
const assetMiddleware = require("./assetManagement/asset_middleware");
const assetParameterMiddleware = require("./assetManagement/assetParameter_middleware");
const notificationMiddleware = require("./notificationManagement/notification_middleware");
const personalProtectiveEquipmentMiddleware = require("./assetManagement/personalProtectiveEquipment_middleware");
const assetCategoryMiddleware = require("./assetManagement/assetCategory_middleware");
const shiftMiddleware = require("./organizationManagement/shift_middleware");
const assetDocumentMiddleware = require("./assetManagement/assetDocument_middleware");
const reportMiddleware = require("./reportManagement/report_middleware");
const taskLibraryMiddleware = require("./maintenanceManagement/taskLibrary_middleware"); 
const maintenancePlanMiddleware = require("./maintenanceManagement/maintenancePlan_middleware")
const dashBoardMiddleware = require("./dashBoardManagemet/dashBoard_middleware")
const spareMiddleware = require("./spareManagement/spare_middleware")
const assetSpaerMiddleware = require("./assetManagement/assetSpare_middleware")
const organizationMiddleware = require("./organizationManagement/organization_middleware")
const authorizationMiddleware = require("./usermanagement/authorizationMiddleware"); // CR0010

module.exports = {
	authJwtMiddleware,
	businessUnitMiddleware,
	departmentMiddleWare,
	userTypeMiddleWare,
	permissionGroupMiddleware,
	permissionMiddleware,
	workOrderMiddleware,
	workOrderPartsMiddleware,
	spareAndInventoryMiddleware,
	designationMiddleware,
	userPermissionMiddleware,
	userMiddleware,
	teamMiddleware,
	timeStampMiddleware,
	assetMiddleware,
	assetParameterMiddleware,
	fileMiddleware,
	notificationMiddleware,
	personalProtectiveEquipmentMiddleware,
	assetCategoryMiddleware,
	shiftMiddleware,
	assetDocumentMiddleware,
	reportMiddleware,
	taskLibraryMiddleware,
	maintenancePlanMiddleware,
	dashBoardMiddleware,
	spareMiddleware,
	assetSpaerMiddleware,
	organizationMiddleware,
	authorizationMiddleware,  // CR0010
};
