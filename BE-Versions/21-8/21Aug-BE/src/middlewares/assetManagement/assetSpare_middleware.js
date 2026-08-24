const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const assetSpareManager = require("../../managers/internalManagers/assetManagement/assetSpare_manager");
const spareManager = require("../../managers/internalManagers/spareManagement/spare_manager")
const {
  statusEnum,
  quantityEnum,
  Spares
} = require("../../models/mongoDB/spareManagement/spare_model");



const verifyAssetSpare = async (req, res, next) => {
  if (req.params.assetSpareId && typeof req.params.assetSpareId === "string") {
    req.assetSpare = req.params.assetSpareId;
  } else if (req.body.assetSpareId && typeof req.body.assetSpareId === "string") {
    req.assetSpare = req.body.assetSpareId;
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Asset Spare id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  let existingSpare;
  existingSpare = await assetSpareManager.checkExistingAssetSpare({
    _id: req.assetSpare,
    isActive: true,
  }, req.assetSpare);
  if (existingSpare) {
    req.assetSpareObj = existingSpare;
    return next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Spare Asset does not exist",
      404,
      null
    );
  }
};

const verifyEditSpare = async (req, res, next) => {
  try{
    if (req.body.spareId && typeof req.body.spareId === "string") {
        req.spare = req.body.spareId;
        let existingSpare = await spareManager.checkExistingSpare({
            _id: req.spare,
            isActive: true,
          }, req.spare);
            if (existingSpare) {
              req.spareObj = existingSpare;
              return next();
            } else {
              return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                "Failed! Spare does not exist",
                404,
                null
              );
            }   
      } else {
        return next();
      }
  }catch(error){
    throw error
  }
} 

const verifyAssetSpares = async (req, res, next) => {
  // Validate request
  const spares = req.body.assetSpareIds;

  if (!Array.isArray(spares) || spares.length === 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Asset SpareIds must be a non-empty array of objects with 'id' as a string property or strings",
      400,
      null
    );
  }
  req.assetSpares = req.body.assetSpareIds;
  try {
    const dataIds = spares.map((spare) => {
       if (typeof spare === "string") {
        return spare;
      } else {
        throw new Error(
          "Each spare must be a string"
        );
      }
    });

    const sparesData = await assetSpareManager.returnInvalidAssetSpares(dataIds);
    if (Array.isArray(sparesData)) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidAssetSpares": sparesData }
      );
    }
    req.assetSpareObjs = sparesData.existingSpares;
    if (sparesData.invalidSpareArray.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidAssetSpares": sparesData.invalidSpareArray }
      );
    }

    next();
  } catch (error) {
    // Handle unexpected errors
    console.error("Error occurred during spare validation:", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message,
      500,
      null
    );
  }
};


module.exports = {
    verifyAssetSpare,
    verifyAssetSpares,
    verifyEditSpare,



}