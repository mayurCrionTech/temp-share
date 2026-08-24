const {
  fetchAssetHistoryManager,
  updateStatus,
} = require("../../managers/internalManagers/assetManagement/assetHistory_manager");
const {
  successResponse,
  errorResponse
} = require("../../managers/common/apiResponseHandler_manager");


const fetchAssetHistory = async (req, res) => {
  try {
    const reqData = req.query;
    await updateStatus();
    const getAssetHistoryData = await fetchAssetHistoryManager(
      req.asset,
      reqData,
      req.businessUnit
    );
    const message = "AssetHistory Fetched Successfully";
    return successResponse(res, message, 200, getAssetHistoryData);
  } catch (error) {
    console.log("error", error);
    return errorResponse(error, req,
      res,
      error.message || "some internal error",
      500,
      null
    );
  }
};



module.exports = {
  fetchAssetHistory
}
