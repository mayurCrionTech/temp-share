const express = require("express");
const assetHistoryController = require("../../controllers/assetManagement/assetHistory_controller");
const assetHistoryRouter = express.Router({ mergeParams: true });
const { assetMiddleware } = require("../../middlewares");


assetHistoryRouter.get('/', [assetMiddleware.validateAsset],assetHistoryController.fetchAssetHistory)

module.exports = {
    assetHistoryRouter
}