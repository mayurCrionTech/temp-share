const express = require("express");
const activityController = require("../../controllers/activityManagement/activity_controller");
const activityRouter = express.Router();
const { authJwtMiddleware } = require("../../middlewares");



activityRouter.get('/', [authJwtMiddleware.verifyToken],activityController.getActivities)

module.exports = {
    activityRouter
}