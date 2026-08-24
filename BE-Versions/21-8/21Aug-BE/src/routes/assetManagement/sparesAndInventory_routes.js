const express = require('express');
const sparesAndInventoryRouter = express.Router();
const sparesAndInventoryController = require("../../controllers/assetManagement/sparesAndInventory_controller")
const {authJwtMiddleware,spareAndInventoryMiddleware} = require("../../middlewares")



sparesAndInventoryRouter.get('/statusCount', [authJwtMiddleware.verifyToken], sparesAndInventoryController.totalCountStatus);


sparesAndInventoryRouter.post('/',[authJwtMiddleware.verifyToken,spareAndInventoryMiddleware.verifyAssetForSpare,spareAndInventoryMiddleware.verifyDuplicates,spareAndInventoryMiddleware.verifyReqBodyIsAnArray], sparesAndInventoryController.createMultipleSpares)


sparesAndInventoryRouter.get('/dropdown', [authJwtMiddleware.verifyToken],sparesAndInventoryController.fetchSparesDropdown)



sparesAndInventoryRouter.get('/', [authJwtMiddleware.verifyToken], sparesAndInventoryController.fetchSpares);



sparesAndInventoryRouter.get('/:spare', [authJwtMiddleware.verifyToken, spareAndInventoryMiddleware.verifySpare], sparesAndInventoryController.fetchSpare);


sparesAndInventoryRouter.put('/', [authJwtMiddleware.verifyToken, spareAndInventoryMiddleware.verifyAssetForSpare,spareAndInventoryMiddleware.verifyDuplicates,spareAndInventoryMiddleware.verifySpares], sparesAndInventoryController.updateSpares);


sparesAndInventoryRouter.put('/delete', [authJwtMiddleware.verifyToken, spareAndInventoryMiddleware.verifySpares], sparesAndInventoryController.deleteSpares);


module.exports = {sparesAndInventoryRouter}