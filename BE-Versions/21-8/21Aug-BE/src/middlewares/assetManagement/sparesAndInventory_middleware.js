const {
  checkExistingSpare,
  returnInvalidSpares,
  checkExistingSpareName,
  checkExistingSpareByNameAndAsset
} = require("../../managers/internalManagers/assetManagement/sparesAndInventory_manager.js");
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const mongoose = require("mongoose")

const verifySpare = async (req, res, next) => {

  if (req.params.spare && typeof req.params.spare === "string") {
    req.spare = req.params.spare;
  }

  else if (req.body.spare && typeof req.body.spare === "string") {
    req.spare = req.body.spare;
  }

  else {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Spare id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  if (req.query.asset && typeof req.query.asset === "string") {
    req.asset = req.query.asset;
  }

  else if (req.body.asset && typeof req.body.asset === "string") {
    req.asset = req.body.asset;
  }

  let existingSpare

  let fetchByField = req.query.fetchByField
  if (fetchByField == "name") {
    existingSpare = await checkExistingSpareByNameAndAsset(req.spare);
  }
  else if (fetchByField == "nameAndAsset") {
    if (req.asset) {
      if (!mongoose.Types.ObjectId.isValid(req.asset)) {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Asset id must be a non-empty string in req.params or req.body",
          400,
          null
        );
      }
    }
    else {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Asset id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }
    existingSpare = await checkExistingSpareByNameAndAsset(req.spare, req.asset);
  }

  else {
    existingSpare = await checkExistingSpare(req.spare);
  }
  if (existingSpare) {
    req.spareObj = existingSpare;
    next();
  } else {
    return apiResponseHandler.errorResponse(null, req, res, "Failed! Spare does not exist", 404, null);
  }
}

const verifySpares = async (req, res, next) => {
  // Validate request
  const spares = req.body.spares;

  if (!Array.isArray(spares) || spares.length === 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Spares must be a non-empty array of objects with 'id' as a string property or strings",
      400,
      null
    );
  }

  try {
    const dataIds = spares.map((spare) => {
      if (
        typeof spare === "object" &&
        spare.id &&
        typeof spare.id === "string"
      ) {
        return spare.id;
      } else if (typeof spare === "string") {
        return spare;
      } else {
        throw new Error(
          "Each spare must be a string or an object with 'id' as a string property"
        );
      }
    });

    const sparesData = await returnInvalidSpares(dataIds);
    if (Array.isArray(sparesData)) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidSpares": sparesData }
      );
    }
    req.spares = sparesData.existingSpares;
    if (sparesData.invalidSpareArray.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidSpares": sparesData.invalidSpareArray }
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

const verifyAssetForSpare = async (req, res, next) => {
  const spares = req.body.spares;
  const spareArray = spares
    .filter(spare => spare.assetId)
    .map(spare => spare.assetId);

  if (spareArray.length) {
    try {
      const assetData = await assetManager.returnInvalidAssetIds(spareArray);
      if (assetData.invalidAssetIds) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Asset ids", 400, {
          invalidAssetIds: assetData.invalidAssetIds
        });
      }
      if (assetData.inValidAssetArray.length > 0) {
        return apiResponseHandler.errorResponse(null, req,
          res,
          "Failed! Invalid Asset ids",
          400,
          { "invalidAssetIds": assetData.inValidAssetArray }
        );
      }
      next();
    } catch (error) {
      return apiResponseHandler.errorResponse(error, req, res, "Failed to verify assets", 500, error);
    }
  } else {
    next();
  }
};

const verifyReqBodyIsAnArray = async (req, res, next) => {
  const spares = req.body.spares;

  if (!Array.isArray(spares) || spares.length === 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Spares must be a non-empty array of objects with 'id' as a string property",
      400,
      null
    );
  }
  next();
}

const verifyDuplicates = async (req, res, next) => {
  try {
    let spares = req.body.spares
    const existingSpares = await checkExistingSpareName(spares)
    let duplicateNames = []
    for (let existingSpare of existingSpares) {
      duplicateNames.push(existingSpare?.name)
    }
    if (existingSpares.length) {
      return apiResponseHandler.errorResponse(null, req, res, "Client Side Error", 400, `Duplicate spare Name : ${duplicateNames}`);
    }
    else {
      return next();
    }
  }
  catch (error) {
    next(error)
  }
}

module.exports = {
  verifySpare,
  verifySpares,
  verifyReqBodyIsAnArray,
  verifyDuplicates,
  verifyAssetForSpare,
};
