const express = require("express");
const assetParameterRouter = express.Router({ mergeParams: true });
const assetParameterController = require("../../controllers/assetManagement/assetParameter_controller");
const {
	assetParameterMiddleware,
	assetMiddleware,
	timeStampMiddleware,
} = require("../../middlewares");

assetParameterRouter.get("/liveData",assetParameterController.getLiveDataAssetParameters)


assetParameterRouter.post(
	"/",
	[
		assetMiddleware.validateAsset,
		// assetParameterMiddleware.validateCreateAssetParameterRequest
	],
	assetParameterController.createAssetParameter
);


assetParameterRouter.post(
	"/bulkCreate",
	[
		assetMiddleware.validateAsset,
		assetParameterMiddleware.validateCreateAssetParametersRequest
	],
	assetParameterController.createAssetParameters
);




assetParameterRouter.put(
	"/",
	[assetParameterMiddleware.validateUpdateAssetParametersRequest],
	assetParameterController.bulkUpdateParameters
);




assetParameterRouter.put(
	"/:parameter",
	// [assetParameterMiddleware.validateUpdateAssetParameterRequest],
	assetParameterController.updateAssetParameter
);




assetParameterRouter.delete(
	"/",
	[assetParameterMiddleware.validateDeleteAssetParametersRequest],
	assetParameterController.bulkDeleteParameters
);



assetParameterRouter.get(
	"/",
	// [assetParameterMiddleware.validateFetchAllRequest],
	assetParameterController.fetchAssetParameters
);


assetParameterRouter.get("/:parameter",
	[
		assetParameterMiddleware.validateParameter,
		assetParameterMiddleware.validateParameterExistsForAsset

	],
	assetParameterController.fetchAssetParameter
)


module.exports = { assetParameterRouter };
