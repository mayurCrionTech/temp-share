const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const {
  returnInvalidNotifications
} = require("../../managers/internalManagers/notificationManagement/notification_manager.js");

const verifyNotifications = async (req, res, next) => {
  // Validate request
  const notifications = req.body.notifications;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Notifications must be a non-empty array of strings",
      400,
      null
    );
  }

  try {
    const invalidNotifications = await returnInvalidNotifications(notifications);

    if (invalidNotifications.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some notifications do not exist",
        400,
        { invalidNotifications }
      );
    }

    next();
  } catch (error) {
    // Handle unexpected errors
    console.error("Error occurred during notification validation:", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message,
      500,
      null
    );
  }
};


module.exports = {
  verifyNotifications
}