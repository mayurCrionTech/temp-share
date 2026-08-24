const express = require("express");
const assetSpareRouter = express.Router({ mergeParams: true });
const assetSpareController = require("../../controllers/assetManagement/assetSpare_controller");
const {
  assetSpaerMiddleware,
	assetMiddleware,
    spareMiddleware
} = require("../../middlewares");


assetSpareRouter.post(
  "/",
  [
    assetMiddleware.validateAsset,
    spareMiddleware.verifySpare,
],
  assetSpareController.linkSpare
);


assetSpareRouter.get(
  "/",
  [assetMiddleware.validateAsset,
  // spareMiddleware.verifySpare,
],
  assetSpareController.fetchAssetSpares
);

assetSpareRouter.patch("/:assetSpareId",
  [
    assetMiddleware.validateAsset,
    assetSpaerMiddleware.verifyEditSpare,
    assetSpaerMiddleware.verifyAssetSpare
  ],
  assetSpareController.updateAssetSpare
);


assetSpareRouter.delete("/",
  [
    assetMiddleware.validateAsset,
    assetSpaerMiddleware.verifyAssetSpares
  ],
  assetSpareController.deleteAssetSpare
);

module.exports = {
    assetSpareRouter
}









