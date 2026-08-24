const assetSpareManager = require("../../managers/internalManagers/assetManagement/assetSpare_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");


exports.linkSpare = async (req, res) => {
  try {
    const assetSpareObj = createObj(req)
    const createdObject = await assetSpareManager.createAssetSpare(assetSpareObj);
    await assetSpareManager.updateAssetInSpare(createdObject.spare, createdObject.asset)
    if(assetSpareObj.minimumRequiredQuantity > req.spareObj.minimumRequiredQuantity){
      await assetSpareManager.handleNotificationForMinimumRequiredQuantityReach(createdObject, req.userId)
    }
    await assetSpareManager.addRecommendedQuantity(createdObject._id)
    const message = "Spare Linked Successfully";
    return apiResponseHandler.successResponse(res, message, 201, {id: createdObject._id});
  } catch (error) {
    console.log("ERR::", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((error) => error.message);
      const errorObject = { "Validation error": errors.join(", ") };
      console.log("Validation error: " + errors.join(", "));
      return apiResponseHandler.errorResponse(error, req,
        res,
        errors.join(", "),
        400,
        null
      );
    }
    else {
      console.log("Error creating spare:", error.message);
      return apiResponseHandler.errorResponse(error, req,
        res,
        error.message || "some internal server error",
        500,
        null
      );
    }
  }
};

exports.updateAssetSpare = async (req, res) => {
  try{
    const sparesObject = updateObj(req);
        await assetSpareManager.updateAssetSpare(req.asset, req.assetSpare, sparesObject, req.body.minimumRequiredQuantity, req.assetSpareObj.minimumRequiredQuantity);
        // await handleNotificationForSpareEdit(req.spares, sparesObject, req.userId)
        // await hanldeActivityForSpareEdit(req.spares, req.userId, req.businessUnit)
        const message = "Spares Updated Successfully";
        return apiResponseHandler.successResponse(res, message, 200, null);
  }catch(error){
    if (error.name === "ValidationError") {
          const errors = Object.values(error.errors).map((error) => error.message);
          const errorObject = { "Validation error": errors.join(", ") };
          console.log("Validation error: " + errors.join(", "));
          return apiResponseHandler.errorResponse(error, req,
            res,
            "Client side error",
            400,
            errorObject
          );
        }
     return apiResponseHandler.errorResponse(error, req,
        res,
        error.message || "some internal server error",
        500,
        null
      );
  }
};

exports.fetchAssetSpares = async (req, res) => {
  try {
    const reqData = req.query;
    const getAssetSpareData = await assetSpareManager.getAllAssetSpare(reqData, req.asset);
    const message = "Asset Spares Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getAssetSpareData);
  } catch (error) {
    console.log("Some error happened while fetching Spares", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message || "Some internal server error",
      500
    );
  }
};


exports.deleteAssetSpare = async (req, res) => {
  try{
    const reqData = req.assetSpares;
    const deleteAssetSpare = await assetSpareManager.deleteAssetSpare(reqData)
     const message = "Asset Spares Deleted Successfully";
    return apiResponseHandler.successResponse(res, message, 200, deleteAssetSpare);
  }catch(error){
    console.log("Some error happened while deleting Asset Spares", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message || "Some internal server error",
      500
    );
  }
}


function createObj(req){
    return {
        spare:req.spare,
        cycleFrequency: req.body.cycleFrequency,
        replacementFrequency: req.body.replacementFrequency,
        minimumRequiredQuantity: req.body.minimumRequiredQuantity,
        unit: req.body.unit,
        // replacementFrequencyType: req.body.replacementFrequencyType,
        // status: req.body.status || "active",
        asset: req.asset,
        createdBy: req.userId,
        updatedBy: req.userId
    }
}


function updateObj (req){
  return {
        spare: req.spare ?req.spare : req.assetSpareObj.spare,
        cycleFrequency: req.body.cycleFrequency? req.body.cycleFrequency: req.assetSpareObj.cycleFrequency,
        replacementFrequency: req.body.replacementFrequency? req.body.replacementFrequency: req.assetSpareObj.replacementFrequency,
        minimumRequiredQuantity: req.body.minimumRequiredQuantity? req.body.minimumRequiredQuantity: req.assetSpareObj.minimumRequiredQuantity,
        unit: req.body.unit ? req.body.unit : req.assetSpareObj.unit,
        // replacementFrequencyType: req.body.replacementFrequencyType? req.body.replacementFrequencyType: req.assetSpareObj.replacementFrequencyType,
        asset: req.asset? req.asset:req.assetSpareObj.asset,
        updatedBy: req.userId
  }
}
