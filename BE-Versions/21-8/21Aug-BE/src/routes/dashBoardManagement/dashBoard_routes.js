const express = require("express");
const dashBoardRouter = express.Router();
const dashBoardController = require("../../controllers/dashBoardManagement/dashBoard_controller")
const {dashBoardMiddleware,businessUnitMiddleware} = require('../../middlewares/index');

dashBoardRouter.get('/', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ], 
    dashBoardController.dashboardStats)

dashBoardRouter.get('/processDashboard',
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchDashhboard
)

dashBoardRouter.get('/latestProcessEntries', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchLatestDashhboardEntries
)


dashBoardRouter.get('/analyticsDashboard',
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchProcessDashhboard
)


dashBoardRouter.get('/latestAnalyticsDashboardEntries', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchLatestProcessDashhboardEntries
)

dashBoardRouter.get('/energyDashboard', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.energyDashboard
)

dashBoardRouter.get('/latestQualityDashboardEntries', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchLatestQualityDashboardEntries
)

dashBoardRouter.get('/qualityDashboard', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.fetchQualityDashhboard
)

dashBoardRouter.get('/qualityDashboard/plants', dashBoardController.fetchPlants)

//live data Dashboard
dashBoardRouter.get('/liveDataDashboard', 
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.getLiveDashboardData
)

dashBoardRouter.get('/liveDataDashboard/sections',
    [
        dashBoardMiddleware.validateDateInput,
        businessUnitMiddleware.verifyBusinessUnit,
    ],
    dashBoardController.getDashboardSections)

//powerbi dashboard routes

dashBoardRouter.get('/powerbiDashboard', [
    businessUnitMiddleware.verifyBusinessUnit,
], dashBoardController.getAllPowerBiDashboards);

dashBoardRouter.post('/powerbiDashboard', [
    businessUnitMiddleware.verifyBusinessUnit,
    dashBoardMiddleware.validateDashboardCreate
], dashBoardController.createPowerBiDashboard);


dashBoardRouter.put('/powerbiDashboard/:id', [
    dashBoardMiddleware.validateDashboardId,
    businessUnitMiddleware.verifyBusinessUnit,
    dashBoardMiddleware.validateDashboardUpdate,
], dashBoardController.updatePowerBiDashboard);

dashBoardRouter.delete('/powerbiDashboard/:id', [
    dashBoardMiddleware.validateDashboardId,
], dashBoardController.deletePowerBiDashboard);


module.exports = {dashBoardRouter}