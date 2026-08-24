const express = require("express");
const notificationController = require("../../controllers/notificationManagement/notification_controller");
const notificationRouter = express.Router();
const { authJwtMiddleware,notificationMiddleware } = require("../../middlewares");




notificationRouter.get('/', [authJwtMiddleware.verifyToken],notificationController.listNotification)


notificationRouter.patch('/changeStatus',[authJwtMiddleware.verifyToken,notificationMiddleware.verifyNotifications],notificationController.toggleNotificationReadStatus)

notificationRouter.get ('/unreadNotificationsCount', [authJwtMiddleware.verifyToken],
    notificationController.unReadNotificationCount
)

module.exports = {
    notificationRouter
}