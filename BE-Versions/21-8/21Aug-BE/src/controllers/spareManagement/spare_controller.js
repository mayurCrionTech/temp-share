const spareManager = require("../../managers/internalManagers/spareManagement/spare_manager");
const spareStockManager = require("../../managers/internalManagers/spareManagement/spareStock_manager")
const workOrderPartRequiredManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartRequired_manager")
const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager")
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const workOrderPartReplacedManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartReplaced_manager")

exports.createSpares = async (req, res) => {
  try {
    const spareObject = req.spareCreateObject
    const createdObject = await spareManager.createSpare(spareObject);
    if(spareObject.images && spareObject.images.length > 0){
          await fileManager.updateFilePaths(
            null,
            spareObject.images,
            "spares",
            createdObject._id,
            req.userId
          );
        }
    await spareManager.handleNotificationForSpareCreation(createdObject, req.userId)
    // await spareManager.handleActivityForSpareCreate(createdObject, req.userId, req.businessUnit)
    const message = "Spare Created Successfully";
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

// exports.fetchSparesDropdown = async (req, res) => {
//   try {
//     const responseObject = await spareDropdownConstants();
//     const message = "Spares Dropdown Values Fetched Successfully";
//     return apiResponseHandler.successResponse(
//       res,
//       message,
//       200,
//       responseObject
//     );
//   } catch (error) {
//     return apiResponseHandler.errorResponse(error, req,
//       res,
//       "Cannot fetch spares dropdown",
//       400,
//       null
//     );
//   }
// };

exports.fetchSpares = async (req, res) => {
  try {
    const reqData = req.query;
    reqData.businessUnit = req.businessUnit;
    const getSparesData = await spareManager.getAllSpares(reqData, req.userId);
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
    const reqData = req.query;
    reqData.businessUnit = req.businessUnit;
    let getSpareData = await spareManager.getSpare(req.spareObj._id, reqData);
      if (getSpareData.images && getSpareData.images.length > 0) {
          const fileDocuments = [];
          for (let document of getSpareData.images) {
            const images = await fileManager.transformFileObj(
              document,
              "download",
              req.get("host"),
              req.protocol
            );
            fileDocuments.push(images);
          }
          getSpareData.images = fileDocuments;
      }
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
    const sparesObject = req.spareUpdateObject;
    await spareManager.updateSpare(req.spare, sparesObject);
    await spareManager.handleNotificationForSpareEdit(req.spareObj,sparesObject, req.userId)
    // await hanldeActivityForSpareEdit(req.spares, req.userId, req.businessUnit)
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
      console.log("Error updating workOrder:", error);
      return apiResponseHandler.errorResponse(error, req,
        res,
        "Internal server error",
        500,
        null
      );
    }
  }
};


exports.countStatus = async (req, res) => {
  try {
    const result = await spareManager.statusCount(req.businessUnit);
    const message = "Spares Status Fetched Successfully";
    return apiResponseHandler.successResponse(res, message, 200, result);
  } catch (error) {
    console.log("Some error happened while fetching Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.approveSpare = async (req, res) => {
  try{
    const result = await spareManager.approveSpare(req.spare);
    const message = "Spares approved Successfully";
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

exports.reviseSpare = async (req, res) => {
  try{
    const result = await spareManager.reviseSpare(req.spare);
    const message = "Spares rejected Successfully";
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

exports.deleteSpares = async (req, res) => {
  try{
     await spareManager.deleteSpares(req.spares, req.userId);
     await spareStockManager.deleteSpareQuantities(req.spares, req.userId);
     await spareManager.handleNotificationForSpareDelete(req.spares, req.userId)
     const message = "Spares deleted successfully";
    return apiResponseHandler.successResponse(res, message, 200, null);
  }catch(error){
    console.log("Some error happened while deleting Spares", error.message);
    return apiResponseHandler.errorResponse(error, req,
      res,
      "Some internal server error",
      500
    );
  }
};

exports.fetchSpareRequired = async (req, res) => {
  try{
    const result = await workOrderPartRequiredManager.getSpareRequired(req.query, req.businessUnit, req.userId);
    return apiResponseHandler.successResponse(res, "SpareRequired Fetched successfully",200, result);
  }catch(error){
     console.log(error); 
      return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
  }
}

exports.fetchSpareReplaced = async (req, res) => {
  try{
    const result = await workOrderPartReplacedManager.getSpareReplaced(req.query, req.businessUnit, req.userId);
    return apiResponseHandler.successResponse(res, "SpareReplaced Fetched successfully",200, result);
  }catch(error){
    console.log(error); 
    return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
  }
}

exports.approveSpareRequired = async (req, res) => {
  try{
    const result = await workOrderPartRequiredManager.approveSpareRequired(req.spareRequested, req.spareRequestedObj, req.userId, req.spareObj)
    await workOrderManager.acceptWorkOrder(req.spareRequestedObj.workOrder, req.userId)
    // notification to be sent for requester after spare approval
    await workOrderPartRequiredManager.notifyRequesterOnSpareApproval(
      req.spareRequestedObj,
      req.userId,      // approver id
      req.spareObj
    );
    return apiResponseHandler.successResponse(res, "Spare Requested Approved Successfully",200, null);
  }catch(error){
     console.log(error); 
     return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
  }
}

exports.rejectSpareRequired = async (req, res) => {
  try{
    const result = await workOrderPartRequiredManager.rejectSpareRequired(req.spareRequested)
    return apiResponseHandler.successResponse(res, "Spare Requested Rejected Successfully",200, null);
  }catch(error){
     console.log(error); 
      return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
  }
}

exports.editWorkOrderPartsReplaced = async (req, res) => {
  try{
    const updateObj = updateSpareReplacedObj(req)
    const editSpareReplaced = await workOrderPartReplacedManager.updateSpareReplaced(req.spareReplaced,updateObj)
    return apiResponseHandler.successResponse(res, "SpareReplaced updated successfully",200, {});
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(
         error,
         req,
         res,
         "Some internal server error",
         500
       );
  }
}

exports.returnSpareReplacedQuantity = async (req, res) => {
  try{
    const result = await workOrderPartReplacedManager.returnSpareQuantity(req.spareReplacedObj.spare,req.spareReplaced, req.body.quantityToReturn)
    return apiResponseHandler.successResponse(res, "SpareReplacedQuantity returned successfully",200, null);
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(
         error,
         req,
         res,
         "Some internal server error",
         500
       );
  }
}


const updateSpareReplacedObj = (req) => {
    return {
        workOrder : req.workOrder ? req.workOrder: req.spareReplaced.workOrder,
        spare : req.spare ? req.spare : req.spareReplaced.spare,
        replacedQuantity : req.body.replacedQuantity ? req.body.replacedQuantity : req.spareReplaced.replacedQuantity,
        spareRequested: req.spareRequested ? req.spareRequested : req.spareReplaced.spareRequested,
        remarks: req.body.remarks ? req.body.remarks : req.spareReplaced.reamrks,
        updatedBy : req.userId,
        updatedAt : Date.now()
    }
}
