const express = require("express");
const processDashBoardRouter = express.Router();
const processdashBoardController = require("../../controllers/dashBoardManagement/processDashBoard_controller")

processDashBoardRouter.get('/', 
    processdashBoardController.fetchProcessDashboard
)
processDashBoardRouter.get('/activehours', 
    processdashBoardController.fetchProcessActiveHoursDashBoard
)
exports.processDashBoardRouter = processDashBoardRouter