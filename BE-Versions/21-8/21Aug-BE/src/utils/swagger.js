const swaggerJSDoc = require('swagger-jsdoc');
const { maintenancePlanSchema } = require('./swaggerDocs/schemas/maintenanceManagement/maintenancePlan_schema');
const { workOrderSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workorder_schema');
const { workOrderConsumableSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderConsumable_schema');
const { workOrderDueDateRequestSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderdueDateRequest_schema');
const { checklistSchema } = require('./swaggerDocs/schemas/checklistManagement/checklist_schema');
const { checklistEntrySchema } = require('./swaggerDocs/schemas/checklistManagement/checklistEntry_schema');
const { checklistStructureSchema } = require('./swaggerDocs/schemas/checklistManagement/checklistStructure_schema');
const { templateSchema, logTemplateSchema } = require('./swaggerDocs/schemas/checklistManagement/template_schema');
const { maintenancePlanVersionSchema } = require('./swaggerDocs/schemas/maintenanceManagement/maintenancePlanVersion_schema');
const { taskLibrarySchema } = require('./swaggerDocs/schemas/maintenanceManagement/taskLibrary_schema');
const { tasksSchema } = require('./swaggerDocs/schemas/maintenanceManagement/tasks_schema');
const { workOrderPartReplacedSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderPartReplaced_schema');
const { workOrderPartRequiredSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderPartRequired_schema');
const { workOrderRemarksSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderRemarks_schema');
const { workOrderTaskSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderTask_schema');
const { workOrderToolRequiredSchema } = require('./swaggerDocs/schemas/maintenanceManagement/workOrderToolRequired_schema');
const { fileSchema } = require('./swaggerDocs/schemas/fileManagemant/file_schema');
const { designationSchema } = require('./swaggerDocs/schemas/organizationManagement/designation_schema');
const { permissionGroupSchema } = require('./swaggerDocs/schemas/organizationManagement/permissionGroup_schema');
const { userTypeSchema } = require('./swaggerDocs/schemas/organizationManagement/userType_schema');
const { activitySchema } = require('./swaggerDocs/schemas/activityManagement/activity_schema');
const { assetSchema } = require('./swaggerDocs/schemas/assetManagement/asset_schema');
const { assetCategorySchema } = require('./swaggerDocs/schemas/assetManagement/assetCategory_schema');
const { assetDocumentSchema } = require('./swaggerDocs/schemas/assetManagement/assetDocumet_schema');
const { assetHistorySchema } = require('./swaggerDocs/schemas/assetManagement/assetHistory_schema');
const { assetParametersSchema } = require('./swaggerDocs/schemas/assetManagement/assetParameters_schema');
const { sparesSchema } = require('./swaggerDocs/schemas/spareManagement/spare_schema');
const { spareStockSchema } = require('./swaggerDocs/schemas/spareManagement/spareStock_schema')
const { personalProtectiveEquipmentschema } = require('./swaggerDocs/schemas/assetManagement/personalProtectEquipment_schema');
const { logschema } = require('./swaggerDocs/schemas/logManagement/log_schema');
const { logEntryschema } = require('./swaggerDocs/schemas/logManagement/logEntry_schema');
const { LogStructureschema } = require('./swaggerDocs/schemas/logManagement/logStructure_schema');
const { templateschema, logTemplateschema } = require('./swaggerDocs/schemas/logManagement/template_schema');
const { notificationschema } = require('./swaggerDocs/schemas/notificationManagement/notification_schema');
const { reportschema } = require('./swaggerDocs/schemas/reportManagement/report_schema');
const { teamschema } = require('./swaggerDocs/schemas/userManagement/team_schema');
const { userschema } = require('./swaggerDocs/schemas/userManagement/user_schema');
const { userAuthenticationschema } = require('./swaggerDocs/schemas/userManagement/userAuthentication_schema');
const { userPermissionschema } = require('./swaggerDocs/schemas/userManagement/userPermission_schema');
const { departmentsschema } = require('./swaggerDocs/schemas/organizationManagement/departments_schema');
const { permissionschema } = require('./swaggerDocs/schemas/organizationManagement/permission_schema');
const { shiftschema } = require('./swaggerDocs/schemas/organizationManagement/shift_schema');
const { businessUnitSchema } = require('./swaggerDocs/schemas/organizationManagement/businessUnit_schema');
const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "Clonos APIs",
		version: "1.0.0",
		description: "Documentation for clonos APIs"
	},
	components: {
		schemas: {
			BusinessUnit: businessUnitSchema,
			Designation: designationSchema,
			PermissionGroup: permissionGroupSchema,
			UserType: userTypeSchema,
			Activity: activitySchema,
			Checklist: checklistSchema,
			ChecklistEntry: checklistEntrySchema ,
			ChecklistStructure: checklistStructureSchema,
			ChecklistTemplate: templateSchema,
			MaintenancePlan: maintenancePlanSchema,
			MaintenancePlanVersion: maintenancePlanVersionSchema,
			TaskLibrary: taskLibrarySchema,
			Tasks: tasksSchema,
			WorkOrder: workOrderSchema,
			WorkOrderConsumable: workOrderConsumableSchema,
			WorkOrderDueDateRequest: workOrderDueDateRequestSchema,
			WorkOrderPartReplaced: workOrderPartReplacedSchema,
			WorkOrderPartRequired: workOrderPartRequiredSchema,
			WorkOrderRemarks: workOrderRemarksSchema,
			WorkOrderTask: workOrderTaskSchema,
			WorkOrderToolRequired: workOrderToolRequiredSchema,
			File: fileSchema,		  
			Departments: departmentsschema,
			Permission: permissionschema,
			Shift: shiftschema,
		    Asset: assetSchema,
		    AssetCategory: assetCategorySchema,
		    AssetDocument: assetDocumentSchema,
		    AssetHistory:   assetHistorySchema,
		    AssetParameters: assetParametersSchema,
		    PersonalProtectiveEquipment: personalProtectiveEquipmentschema,
		    Spares: sparesSchema,
			SpareStock: spareStockSchema,
		    Log: logschema,
		    LogEntry: logEntryschema,
		    LogStructure:LogStructureschema,
		    LogTemplate: logTemplateschema,
		    Notification: notificationschema,
		    Report: reportschema,
		    Team: teamschema,
		    User:  userschema,
		    UserAuthentication: userAuthenticationschema,
		   UserPermission: userPermissionschema,
			
		},

		securitySchemes: {
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT"
			}
		}
	}
};
const options = {
	swaggerDefinition,
	apis: [
		"./src/routes/checklistManagement/checklist_routes.js",
		"./src/routes/spareManagement/spare_swagger_routes.js",
		"./src/routes/organizationManagement/businessUnit_routes.js",
		"./src/routes/fileSystem/fileSystem_swagger_routes.js",
		"./src/routes/notificationManagement/notification_swagger_routes.js",
		"./src/routes/activityManagement/activity_swagger_routes.js",
		"./src/routes/assetManagement/assetParameter_swagger_routes.js",
		"./src/routes/organizationManagement/designation_swagger_routes.js",
		"./src/routes/organizationManagement/permissionGroup_swagger_routes.js",
		"./src/routes/organizationManagement/userType_swagger_routes.js",
		"./src/routes/maintenanceManagement/maintenancePlan_swagger_routes.js",
		"./src/routes/maintenanceManagement/workOrder_swagger_routes.js",
		"./src/routes/userManagement/auth_swagger_routes.js",
		"./src/routes/userManagement/user_swagger_routes.js",
		"./src/routes/assetManagement/assetDocument_swagger_routes.js",
		"./src/routes/reportManagement/report_swagger_routes.js",
		"./src/routes/assetManagement/asset_swagger_routes.js",
		"./src/routes/dashBoardManagement/assetDashBoard_swagger_routes.js",
		"./src/routes/organizationManagement/shift_swagger_routes.js",
		"./src/routes/organizationManagement/department_swagger_routes.js",
		"./src/routes/organizationManagement/permission_swagger_routes.js",
		"./src/routes/assetManagement/personalProtectiveEquipment_swagger_routes.js",
	    "./src/routes/checklistManagement/checklist_swagger_routes.js",
        "./src/routes/logManagement/log_swagger_routes.js",
		"./src/routes/userManagement/Team_swagger_routes.js",
		"./src/routes/userManagement/userPermission_swagger_routes.js",
		"./src/routes/maintenanceManagement/TaskLibrary_swagger_routes.js",
		"./src/routes/maintenanceManagement/WorkOrderDueDateRequest_swagger_routes.js",
		"./src/routes/assetManagement/assetCategory_swagger_routes.js",
		"./src/routes/assetManagement/assetHistory_swagger_routes.js",
		"./src/routes/maintenanceManagement/WorkOrderPartRequirement_swagger_routes.js"
	]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
