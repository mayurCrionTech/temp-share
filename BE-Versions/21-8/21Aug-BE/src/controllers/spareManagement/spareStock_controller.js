const spareQuantityManager = require("../../managers/internalManagers/spareManagement/spareStock_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");


exports.addSpareQuantity = async (req, res) => {
  try {
    const createdObject = await spareQuantityManager.createSpareQuantity(req.addQuantityObject);
    const message = "Spare Quantity Added Successfully";
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

exports.updateQuantity = async (req, res) => {
  try{
    const sparesObject = req.updateQuantityObject;
    console.log("sparesObject", sparesObject)
        await spareQuantityManager.updateSpareQuantity(req.quantity, sparesObject);
        // await handleNotificationForSpareEdit(req.spares, sparesObject, req.userId)
        // await hanldeActivityForSpareEdit(req.spares, req.userId, req.businessUnit)
        const message = "Spares Updated Successfully";
        return apiResponseHandler.successResponse(res, message, 200, null);

  }catch(error){
     return apiResponseHandler.errorResponse(error, req,
        res,
        error.message || "some internal server error",
        500,
        null
      );
  }
};

exports.fetchSpareStockss = async (req, res) => {
  try {
    const reqData = req.query;
    const getSpareQuantityData = await spareQuantityManager.getAllSpareQuantities(reqData, req.userId);
    const message = "Spare Quantities Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, getSpareQuantityData);
  } catch (error) {
    console.log("Some error happened while fetching Spares", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message || "Some internal server error",
      500
    );
  }
};

exports.approveSpareQuantity = async (req, res) => {
  try{
    const result = await spareQuantityManager.approveSpareQuantity(req.quantity);
    const message = "Spare Quantity approved Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  }catch(error){
    console.log("error", error)
    console.log("Some error happened while approving Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.reviseSpareQuantity = async (req, res) => {
  try{
    const result = await spareQuantityManager.reviseSpareQuantity(req.quantity);
    const message = "Spare Quantity rejected Successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  }catch(error){
    console.log("Some error happened while approving Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

