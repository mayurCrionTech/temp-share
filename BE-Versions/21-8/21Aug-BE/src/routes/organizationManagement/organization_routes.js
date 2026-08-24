const express = require("express");
const organizationRouter = express.Router({ mergeParams: true });
const organizationController = require("../../controllers/organizationManagement/organization_controller");
const {
  organizationMiddleware,
  authJwtMiddleware,
} = require("../../middlewares");

organizationRouter.post(
  "/",
  [
    authJwtMiddleware.verifyIsSuperAdmin,
    organizationMiddleware.validateCreateOrganizationRequest,
  ],
  organizationController.createOrganization
);

// organizationRouter.put(
// 	"/",
// 	[organizationMiddleware.validateUpdateOrganizationRequest],
// 	organizationController.bulkUpdateParameters
// );

organizationRouter.put(
  "/:organization",

  [
    authJwtMiddleware.verifyIsSuperAdmin,
    organizationMiddleware.validateUpdateOrganizationRequest,
  ],
  organizationController.updateOrganization
);

organizationRouter.delete(
  "/",

  [
    authJwtMiddleware.verifyIsSuperAdmin,
    organizationMiddleware.validateDeleteOrganizationsRequest,
  ],
  organizationController.bulkDeleteOrganizations
);

organizationRouter.get(
  "/",
  [
    authJwtMiddleware.verifyIsSuperAdmin,
    organizationMiddleware.validateFetchAllRequest,
  ],
  organizationController.fetchOrganizations
);

organizationRouter.get(
  "/:organization",
  [
    authJwtMiddleware.verifyIsSuperAdmin,
    organizationMiddleware.validateOrganization,
  ],
  organizationController.fetchOrganization
);

module.exports = { organizationRouter };
