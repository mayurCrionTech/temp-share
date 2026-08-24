const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const { fetchMasterAssets } = require("../../managers/internalManagers/assetManagement/assetMastery_manager");

exports.getMasterAssets = async (req, res) => {
  try {
    const { assetKey, assetNumber, assetModel, assetMake, page = 1, limit = 10 } = req.query;

    if (!assetKey && !assetNumber && !assetModel && !assetMake) {
      return res.status(400).json({
        success: false,
        message: "assetKey or assetNumber or assetModel or assetMake is required",
      });
    }

    const result = await fetchMasterAssets(
      assetKey,
      assetNumber,
      assetModel,
      assetMake,
      parseInt(page),
      parseInt(limit)
    );

    return apiResponseHandler.successResponse(res, "Master Assets Fetched Successfully", 201, result);
  } catch (error) {
    console.error("Error in getMasterAssets:", error);
   return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
  }
};
