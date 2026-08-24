const tagManager = require("../../managers/internalManagers/tagManagement/tag_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

exports.getAllTags = async (req, res) => {
  try {
    const reqData = req.query;
    reqData.userId = req.userId; // optional user context

    const tags = await tagManager.fetchAllTags(reqData);

    return apiResponseHandler.successResponse(
      res,
      "Tags fetched successfully",
      200,
      tags,
    );
  } catch (error) {
    console.log("Some error happened while fetching tags", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message || "Some internal server error",
      500,
      null,
    );
  }
};

/**
 * GET /assets/:assetId/tags
 * Returns all tags associated with a specific asset
 */
exports.getTagsByAssetId = async (req, res) => {
  try {
    const assetId = req.params.assetId;

    if (!assetId) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Asset ID is required",
        400,
        null,
      );
    }

    const reqData = req.query; // optional query params
    reqData.userId = req.userId; // optional context

    // Delegate DB/business logic to manager
    const tags = await tagManager.fetchTagsByAssetId(assetId, reqData);

    return apiResponseHandler.successResponse(
      res,
      "Tags fetched successfully for asset",
      200,
      tags,
    );
  } catch (error) {
    console.error("Error fetching tags for asset:", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message || "Failed to fetch tags for asset",
      500,
      null,
    );
  }
};

exports.getTagsHistory = async (req, res) => {
  try {
    const {
      tagId,
      startTime,
      endTime,
      interval,
      aggregation,
      limit
    } = req.query;

    const result = await tagManager.getTagHistory(tagId,startTime,endTime,interval,aggregation,limit);

    return apiResponseHandler.successResponse(
      res,
      "Tag history fetched successfully",
      200,
      result,
      true
    );

  } catch (error) {
    console.error("Error fetching tag history:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
};


exports.getAllLiveTags = async (req, res) => {
  try {
    const { tagIds } = req.body;

    if (!tagIds ||!Array.isArray(tagIds) ||tagIds.length === 0) {
      return apiResponseHandler.errorResponse(res, "tagIds must be a non-empty array", 400);
    }

    const result = await tagManager.getAllLiveTags(tagIds);

    return apiResponseHandler.successResponse(
      res,
      "Success",
      200,
      result,
      true
    );

  } catch (error) {
    console.error("Error fetching live tags:", error);
    return apiResponseHandler.errorResponse(res, error.message  || "Internal Server Error", 500);
  }
};

// new fast - cahche model

exports.getAnomalyDetailsFast = async (req, res) => {
  try {
    const { tagId, startTime, endTime, limit, page } = req.query;

    if (!tagId || !startTime || !endTime) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "tagId, startTime, and endTime are required query parameters.",
        400
      );
    }

    // tagId can be "abc123" or "abc123,def456,ghi789"
    const tagIds = tagId
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const result = await tagManager.getTagAnomaliesFast({
      tagIds,
      startTime,
      endTime,
      limit,
      page,
    });

    return apiResponseHandler.successResponse(res, "Success", 200, result, true);

  } catch (error) {
    console.error("Error fetching tag anomalies (FAST):", error);

    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message || "Internal Server Error",
      500
    );
  }
};

exports.getAnomalyDetails = async (req, res) => {
  try {
    const { tagId, startTime, endTime, limit, page } = req.query;

    if (!tagId || !startTime || !endTime) {
      return apiResponseHandler.errorResponse(
        res,
        "tagId, startTime, and endTime are required query parameters.",
        400
      );
    }

    const result = await tagManager.getTagAnomalies({
      tagId,
      startTime,
      endTime,
      limit,
      page,
    });

    return apiResponseHandler.successResponse(res, "Success", 200, result, true);
  } catch (error) {
    console.error("Error fetching tag anomalies:", error);
    return apiResponseHandler.errorResponse(
      res,
      error.message || "Internal Server Error",
      500
    );
  }
};

exports.getForeCastValues = async (req, res) => {
  try {
    const { tagId, startTime, endTime,interval,aggregation,format } = req.query;

    if (!tagId || !startTime || !endTime) {
      return apiResponseHandler.errorResponse(
        res,
        "tagId, startTime, and endTime are required query parameters.",
        400
      );
    }

    const result = await tagManager.getRawPoints({
      tagId,
      startTime,
      endTime,interval,aggregation,format
    });

    return apiResponseHandler.successResponse(
      res,
      "Success",
      200,
      result,
      true
    );

  } catch (error) {
    console.error("Error fetching raw points:", error);

    return apiResponseHandler.errorResponse(
      res,
      error.message || "Internal Server Error",
      500
    );
  }
};


exports.getForeCastDefectValues = async (req, res) => {
  try{

    // const { tagId, startTime, endTime } = req.query;

    const result = await tagManager.getDefectPoints();

    return apiResponseHandler.successResponse(
      res,
      "Success",
      200,
      result,
      true
    );

  }catch(error){
    console.error("Error fetching Forecast DefectValues:", error);

    return apiResponseHandler.errorResponse(
      error, req,
      res,
      error.message || "Internal Server Error",
      500
    );
  }
}

exports.updateForeCastDefectValuesAcknowledged = async (req, res) => {
  try{

    // const { tagId, startTime, endTime } = req.query;

    const result = await tagManager.updateforecastAcknowledged(req.body, req.query.forecastDefectId);

    return apiResponseHandler.successResponse(
      res,
      "Success",
      200,
      "updated Successfully",
      true
    );

  }catch(error){
    console.error("Error updating Forecast DefectValues:", error);

    return apiResponseHandler.errorResponse(
      error, req,
      res,
      error.message || "Internal Server Error",
      500
    );
  }
}

exports.updateAnamolyAcknowledged = async (req, res) => {
  try{

    const result = await tagManager.updateAnomalyAcknowledged(req.body, req.query.anamolyId);

    return apiResponseHandler.successResponse(
      res,
      "Success",
      200,
      "updated Successfully",
      true
    );

  }catch(error){
    console.error("Error updating Anamoly Values:", error);

    return apiResponseHandler.errorResponse(
      error, req,
      res,
      error.message || "Internal Server Error",
      500
    );
  }
}