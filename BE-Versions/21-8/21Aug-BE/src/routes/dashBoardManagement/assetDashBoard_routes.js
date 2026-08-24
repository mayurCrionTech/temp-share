const express = require("express");
const assetDashBoardRouter = express.Router();
const assetdashBoardController = require("../../controllers/dashBoardManagement/assetDashBoard_controller")

assetDashBoardRouter.get('/', 
    assetdashBoardController.fetchAssetDashboard
)

assetDashBoardRouter.get('/activehours', 
    assetdashBoardController.fetchAssetActiveHoursDashBoard
)


module.exports = {assetDashBoardRouter}