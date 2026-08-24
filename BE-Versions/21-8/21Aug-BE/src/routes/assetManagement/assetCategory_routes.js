const express = require("express");
const assetCategoryRouter = express.Router({ mergeParams: true });
const assetCategoryController = require("../../controllers/assetManagement/assetCategory_controller");
const {
    assetCategoryMiddleware,
    assetMiddleware,
    timeStampMiddleware,
} = require("../../middlewares");

/**
 * @swagger
 * tags:
 *   name: Asset Category
 *   description: API for managing asset categories
 */

assetCategoryRouter.post(
    "/",
    [
        assetCategoryMiddleware.validateCreateAssetCategoryRequest
    ],
    assetCategoryController.createAssetCategory
);

assetCategoryRouter.put(
    "/:assetCategory",
    [assetCategoryMiddleware.validateUpdateAssetCategoryRequest],
    assetCategoryController.updateAssetCategory
);

assetCategoryRouter.delete(
    "/",
    [assetCategoryMiddleware.validateDeleteAssetCategoriesRequest],
    assetCategoryController.bulkDeleteAssetCategories
);

assetCategoryRouter.get(
    "/",
    // [assetCategoryMiddleware.validateFetchAllRequest],
    assetCategoryController.fetchAssetCategories
);

assetCategoryRouter.get(
    "/:assetCategory",
    [assetCategoryMiddleware.validateAssetCategory],
    assetCategoryController.fetchAssetCategory
);

module.exports = { assetCategoryRouter };