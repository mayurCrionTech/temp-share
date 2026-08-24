const assetManager = require("../../managers/internalManagers/assetMock/assetManager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

// Create a new asset
exports.createAsset = async (req, res) => {
  try {
    const assetData = req.body; // expect { name, code, description }
    const createdAsset = await assetManager.createAsset(assetData);

    return apiResponseHandler.successResponse(
      res,
      "Asset created successfully",
      201,
      createdAsset,
    );
  } catch (error) {
    console.error("Error creating asset:", error.message);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to create asset",
      500,
    );
  }
};
