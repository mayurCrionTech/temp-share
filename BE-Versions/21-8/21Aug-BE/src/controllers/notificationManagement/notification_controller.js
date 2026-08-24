const {
  createNotificationForUserTypes,
  createNotificationForUserId,
  fetchNotifications,
  updateNotifications,
  getUnReadCount
} = require("../../managers/internalManagers/notificationManagement/notification_manager");
const {
  successResponse,
  errorResponse
} = require("../../managers/common/apiResponseHandler_manager");

const createNotification = async (userTypes, userId, data) => {
  try {
    let createdNotification;
    if (userTypes && userTypes.length > 0) {
      createdNotification = await createNotificationForUserTypes(
        userTypes,
        data
      );
    } else if (userId) {
      createdNotification = await createNotificationForUserId(userId, data);
    }
    return createdNotification;
  } catch (error) {
    console.log("Cannot create notification", error.message);
  }
}

const listNotification = async (req, res) => {
  try {
    const notifications = await fetchNotifications(req.userId, req.query, req.businessUnit);
    return successResponse(res, "Notifications fetched successfully", 200, notifications);
  } catch (error) {
    console.log("error", error)
    return errorResponse(error, req, res, error.message, 500, null);
  }
}

const toggleNotificationReadStatus = async (req, res) => {
  try {
    const notifications = await updateNotifications(req.body.notifications);
    return successResponse(res, "Notifications updated successfully", 200, null);
  } catch (error) {
    console.log("error", error);
    return errorResponse(error, req, res, error.message, 500, null);
  }
}

const unReadNotificationCount = async (req, res ) => {
  try{
    const notificationUnreadMessageCount = await getUnReadCount(req.userId, req.businessUnit)
    const unreadCount = {unReadNotificationsCount:notificationUnreadMessageCount}
    return successResponse(res, "UnReadNotification count fetched successfully", 200, unreadCount);
  }catch(error){
    console.log("error", error);
    return errorResponse(error, req, res, "some internal server error", 500, null);
  }
}
module.exports = {
  createNotification,
  listNotification,
  toggleNotificationReadStatus,
  unReadNotificationCount,
};
