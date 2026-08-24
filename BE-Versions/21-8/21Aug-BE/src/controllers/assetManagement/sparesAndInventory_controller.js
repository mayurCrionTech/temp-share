const {
  createMultipleSpares,
  spareDropdownConstants,
  getAllSpares,
  getSpare,
  editSpares,
  deleteSpares,
  totalStatusCount,
  handleNotificationForSpareCreation,
  handleNotificationForSpareEdit,
  handleNotificationForSpareDelete,
  handleActivityForSpareCreate,
  hanldeActivityForSpareEdit,
  hanldeActivityForSpareDelete,
} = require("../../managers/internalManagers/assetManagement/sparesAndInventory_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

exports.createMultipleSpares = async (req, res) => {
  try {
    const spareObject = spareCreateObject(req);
    const createdObject = await createMultipleSpares(spareObject);
    await handleNotificationForSpareCreation(createdObject.createdspares, req.userId)
    await handleActivityForSpareCreate(createdObject.createdspares, req.userId, req.businessUnit)
    const message = "Spare Created Successfully";
    return apiResponseHandler.successResponse(res, message, 201, createdObject.createdSpareIds);
  } catch (error) {
    console.log("ERR::", error);
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
    else {
      console.log("Error creating spare:", error.message);
      return apiResponseHandler.errorResponse(error, req,
        res,
        error.message || "Internal server error",
        500,
        null
      );
    }
  }
};

exports.fetchSparesDropdown = async (req, res) => {
  try {
    const responseObject = await spareDropdownConstants();
    const message = "Spares Dropdown Values Fetched Successfully";
    return apiResponseHandler.successResponse(
      res,
      message,
      200,
      responseObject
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Cannot fetch spares dropdown",
      400,
      null
    );
  }
};

exports.fetchSpares = async (req, res) => {
  try {
    const reqData = req.query;
    reqData.businessUnit = req.businessUnit;
    const getSparesData = await getAllSpares(reqData);
    const message = "Spares Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getSparesData);
  } catch (error) {
    console.log("Some error happened while fetching Spares", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message || "Some internal server error",
      500
    );
  }
};

exports.fetchSpare = async (req, res) => {
  try {
    let getSpareData = await getSpare(
      req.spareObj._id, req.spareObj.name, req.asset,
      req.query.selectFields || "",
      req.query.populateFields || "",
      req.businessUnit
    );
    const message = "Spare Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getSpareData);
  } catch (error) {
    console.log("Some error happened while fetching Spares", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message || "Some internal server error",
      500
    );
  }
};

exports.updateSpares = async (req, res) => {
  try {
    const sparesObject = spareUpdateObject(req);
    await editSpares(sparesObject);
    await handleNotificationForSpareEdit(req.spares, sparesObject, req.userId)
    await hanldeActivityForSpareEdit(req.spares, req.userId, req.businessUnit)
    const message = "Spares Updated Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("ERR::", error);
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
    else {
      console.log("Error updating workOrder:", error.message);
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Internal server error",
        500,
        null
      );
    }
  }
};

exports.deleteSpares = async (req, res) => {
  try {
    await deleteSpares(req.body.spares, req.userId);
    await handleNotificationForSpareDelete(req.spares, req.body.spares, req.userId)
    await hanldeActivityForSpareDelete(req.spares, req.userId, req.businessUnit)
    const message = "Spares deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  } catch (error) {
    console.log("Some error happened while deleting Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.totalCountStatus = async (req, res) => {
  try {
    const result = await totalStatusCount(req.businessUnit);
    const message = "Spares Status Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, result);
  } catch (error) {
    console.log("Some error happened while deleting Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

const spareCreateObject = (req) => {
  const { spares } = req.body;
  spares.map(async (spare) => {
    spare.asset = spare.assetId;
    spare.description = spare.description;
    spare.totalQuantity = spare.quantity.value ;
    // spare.partNumber = spare.partNumber;
    spare.cost = spare.cost || null,
    spare.minimumRequirement = spare.minimumRequirement,
    spare.businessUnit = req.businessUnit,
    spare.createdBy = req.userId;
    spare.updatedBy = req.userId;
  })
  console.log("spares", spares);
  return spares;
};

const spareUpdateObject = (req) => {
  const { spares } = req.body;
  spares.map(async (spare) => {
    spare.asset = spare.assetId;
    spare.description = spare.description;
    spare.totalQuantity = spare.quantity.value;
    // spare.partNumber = spare.partNumber;
    spare.minimumRequirement = spare.minimumRequirement,
    spare.cost = spare.cost || null,
    spare.updatedBy = req.userId;
  })
  console.log("spares", spares);
  return spares;
};
