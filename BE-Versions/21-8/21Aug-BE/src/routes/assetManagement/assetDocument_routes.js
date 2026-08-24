const express = require("express");
const assetDocumentRouter = express.Router({ mergeParams: true });
const assetDocumentController = require("../../controllers/assetManagement/assetDocument_controller");
const { assetDocumentMiddleware, assetMiddleware, timeStampMiddleware } = require("../../middlewares");



assetDocumentRouter.post(
	"/",
	[assetDocumentMiddleware.validateCreateAssetDocumentRequest],
	assetDocumentController.createAssetDocument
);

assetDocumentRouter.put(
	"/:assetDocument",
    [
        assetDocumentMiddleware.validateAssetDocument,
        assetDocumentMiddleware.validateUpdateAssetDocumentRequest],
	assetDocumentController.updateAssetDocument
);

assetDocumentRouter.delete(
	"/",
	[assetDocumentMiddleware.validateDeleteAssetDocumentsRequest],
	assetDocumentController.bulkDeleteAssetDocuments
);

assetDocumentRouter.get(
	"/",
	[assetDocumentMiddleware.validateFetchAllRequest],
	assetDocumentController.fetchAssetDocuments
);

assetDocumentRouter.get(
	"/:assetDocument",
	[assetDocumentMiddleware.validateAssetDocument],
	assetDocumentController.fetchAssetDocument
);

//express 4 version multiple params handles syntax
// assetDocumentRouter.get("/enums/:category/:subcategory?/:type?/:subType?", assetDocumentController.enums);

// assetDocumentRouter.get("/enums/:category/:subcategory/:type/:subType", assetDocumentController.enums)

//express 5 version multiple params handles syntax
assetDocumentRouter.get("/enums/:category{/:subcategory}{/:type}{/:subType}", assetDocumentController.enums);
module.exports = { assetDocumentRouter };
