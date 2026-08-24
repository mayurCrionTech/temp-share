/*
date            qid / cr#         comments
19-mar-2026     CR0008           ASSET import by xlsx
17-apr-2026     CR0013           IDOR - Issue
20-apr-2026     CR0010           Permission checks added 
*/
const express = require("express");
const assetRouter = express.Router();
const assetController = require("../../controllers/assetManagement/asset_controller");
const {
	assetMiddleware,
	timeStampMiddleware,
	spareAndInventoryMiddleware,
	businessUnitMiddleware,
	authorizationMiddleware, // CR0010
} = require("../../middlewares");
const { getMasterAssets } = require("../../controllers/assetManagement/assetMaster_controller");



assetRouter.get("/assetMaster",
	[
		authorizationMiddleware.checkPermission("assets", "read"), // CR0010
	],
	getMasterAssets 
);

assetRouter.get(
	"/count", 
	[
		// authorizationMiddleware.checkPermission("assets", "read"), // CR0010
		businessUnitMiddleware.verifyBusinessUnit
	], 
	assetController.countAssets
);



assetRouter.get(
	"/",
	[
		authorizationMiddleware.checkPermission("assets", "read"), // CR0010
		businessUnitMiddleware.verifyBusinessUnit, 
		timeStampMiddleware.validateCreatedAtFromQueryForSearch, 
		timeStampMiddleware.validateUpdatedAtFromQueryForSearch
	],
	assetController.fetchAssets
);


assetRouter.get(
	"/:asset/incompleteRegisterationDetails",
	[
		authorizationMiddleware.checkPermission("assets", "read"), // CR0010
		assetMiddleware.validateAsset,
		assetMiddleware.checkAssetDepartmentAccess, //CR0013
	],
	assetController.incompleteRegisterationDetails
); 


assetRouter.get("/:asset", 
	[
		authorizationMiddleware.checkPermission("assets", "read"), // CR0010
		assetMiddleware.validateAsset,
		assetMiddleware.checkAssetDepartmentAccess, //CR0013->assetMiddleware.checkAssetDepartmentAccess,
	], 
	assetController.fetchAsset
);


assetRouter.post("/", 
	[
		authorizationMiddleware.checkPermission("assets", "create"), // CR0010
		assetMiddleware.validateCreateAssetRequest
	], 
	assetController.createAssetGeneralDetails
);



assetRouter.put(
	"/:asset",
	[
		authorizationMiddleware.checkPermission("assets", "update"), // CR0010
		assetMiddleware.validateAsset,
		assetMiddleware.checkAssetDepartmentAccess, //CR0013
		assetMiddleware.removeExistingFieldValueFromRequestBody,
		// spareAndInventoryMiddleware.verifySpares,
		assetMiddleware.validateUpdateRequest
	],
	assetController.updateAsset
);


assetRouter.delete("/:asset", 
	[
		authorizationMiddleware.checkPermission("assets", "delete"), // CR0010
		assetMiddleware.validateAsset,
		assetMiddleware.checkAssetDepartmentAccess
	], 
	assetController.deleteAsset
);//CR0013 ->assetMiddleware.checkAssetDepartmentAccess,



assetRouter.delete("/", 
	[
		authorizationMiddleware.checkPermission("assets", "delete"), // CR0010
		assetMiddleware.validateAssets,
		assetMiddleware.checkAssetDepartmentAccess
	], 
	assetController.deleteAssets
);//CR0013 ->assetMiddleware.checkAssetDepartmentAccess,



assetRouter.patch(
	"/:asset/updateStatus",
	[
		authorizationMiddleware.checkPermission("assets", "update"), // CR0010
		assetMiddleware.validateAsset,
		assetMiddleware.checkAssetDepartmentAccess,
		assetMiddleware.validateUpdateStatusRequest
	],
	assetController.updateAssetStatus
);//CR0013 ->assetMiddleware.checkAssetDepartmentAccess,



assetRouter.get(
  "/:asset/qrCode",
  [
    // authJwtMiddleware.verifyToken,
    authorizationMiddleware.checkPermission("assets", "read"), // CR0010
	assetMiddleware.validateAsset,
	assetMiddleware.checkAssetDepartmentAccess //CR0013 ->assetMiddleware.checkAssetDepartmentAccess,
  ],
  assetController.fetchQrCode
);



//express 4 version multiple params handles syntax
// assetRouter.get("/enums/:category/:subcategory?/:type?/:subType?", assetController.enums);


// assetRouter.get("/enums/:category/:subcategory/:type/:subType", assetController.enums);

//express 5 version multiple params handles syntax
assetRouter.get("/enums/:category{/:subcategory}{/:type}{/:subType}",
	[
		authorizationMiddleware.checkPermission("assets", "read") // CR0010
	], 
	assetController.enums
);






assetRouter.get("/:asset/hierarchy",  
	[
		authorizationMiddleware.checkPermission("assets", "read"), // CR0010
		assetMiddleware.validateAsset
	], 
	assetController.getFullHierarchy
);

//Excel
//CR0008
//START
assetRouter.post(
	"/import",
	[
		authorizationMiddleware.checkPermission("assets", "create"), // CR0010
		businessUnitMiddleware.verifyBusinessUnit,
		assetMiddleware.uploadXlsx,
		assetMiddleware.validateXlsxFile,
	],
	assetController.importAssets
);
//END
//Excel

module.exports = { assetRouter };
