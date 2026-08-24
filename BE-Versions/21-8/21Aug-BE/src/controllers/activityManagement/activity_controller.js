const {
  successResponse,
  errorResponse
} = require("../../managers/common/apiResponseHandler_manager");
const {
  fetchActivities
} = require("../../managers/internalManagers/activityManagement/activity_manager")

const getActivities = async (req, res) => {
  try {
    const activities = await fetchActivities(req.userId, req.query, req.businessUnit);
    return successResponse(res, "Activities fetched successfully", 200, activities);
  } catch (error) {
    console.log("error", error)
    return errorResponse(error, req, res, error.message, 500, null);
  }
}

module.exports = {
  getActivities
}