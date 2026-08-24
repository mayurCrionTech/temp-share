const express = require("express");
const businessUnitController = require("../../controllers/organizationManagement/businessUnit_controller");
const { businessUnitMiddleware, authJwtMiddleware, organizationMiddleware } = require("../../middlewares");

const businessUnitRouter = express.Router();


businessUnitRouter.post(
	"/",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, organizationMiddleware.validateOrganization, businessUnitMiddleware.validateCreateBusinessUnitRequestBody],
	businessUnitController.createBusinessUnit
);


businessUnitRouter.get(
	"/",
	[authJwtMiddleware.verifyToken, businessUnitMiddleware.verifyBusinessUnit],
	businessUnitController.getAllBusinessUnits
);

businessUnitRouter.get(
	"/:businessUnit",
	[
		authJwtMiddleware.verifyToken,
		businessUnitMiddleware.verifyFetchBusinessUser,
		businessUnitMiddleware.verifyBusinessUnit
	],
	businessUnitController.getBusinessUnit
);

businessUnitRouter.patch(
	"/:businessUnit/enable",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnit],
	businessUnitController.enableBusinessUnit
);

businessUnitRouter.patch(
	"/:businessUnit/disable",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnit],
	businessUnitController.disableBusinessUnit
);

businessUnitRouter.patch(
	"/enable",
[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnits],
	businessUnitController.enableBusinessUnits
);

businessUnitRouter.patch(
	"/disable",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnits],
	businessUnitController.disableBusinessUnits
);

businessUnitRouter.delete(
	"/:businessUnit",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnit],
	businessUnitController.deleteBusinessUnit
);

businessUnitRouter.delete(
	"/",
	[authJwtMiddleware.verifyToken, authJwtMiddleware.verifyIsSuperAdmin, businessUnitMiddleware.validateBusinessUnits],
	businessUnitController.deleteBusinessUnits
);

businessUnitRouter.put(
	"/:businessUnit",
	[
		authJwtMiddleware.verifyToken,
		authJwtMiddleware.verifyIsSuperAdmin,
		businessUnitMiddleware.validateUpdateBusinessUnitRequestBody,
		businessUnitMiddleware.validateBusinessUnit
	],
	businessUnitController.updateBusinessUnit
);

module.exports = { businessUnitRouter };
