const apiResponseHandler = require('../../managers/common/apiResponseHandler_manager');
const workOrderPartRequiredManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartRequired_manager")
const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager")


exports. createWorkOrderPartRequired = async (req,res) => {
    try {
      const workOrderPartRequiredObj = workOrderPartRequiredObject(req);
      const createdworkOrderPartRequired = await workOrderPartRequiredManager.createWorkOrderPartRequired(workOrderPartRequiredObj);
      await workOrderManager.holdWorkOrder(createdworkOrderPartRequired.workOrder, req.userId)
      const responseObject = {
        id:createdworkOrderPartRequired._id
      }
      return apiResponseHandler.successResponse(res, "Spares requested successfully",201, responseObject);
    }
    catch (error) {
      console.log(error); 
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
      return apiResponseHandler.errorResponse(
            error,
            req,
            res,
            "Some internal server error",
            500
          );
    }
  }


exports.fetchWorkOrderPartRequired = async (req, res) => {
  try{
    const result = await workOrderPartRequiredManager.getPartsRequired(req.query, req.workOrder, req.businessUnit);
    return apiResponseHandler.successResponse(res, "SpareRequested Fetched successfully",200, result);
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

 
const workOrderPartRequiredObject = (req) => {
    return {
        workOrder : req.workOrder,
        businessUnit : req.businessUnit,
        spare : req.spare,
        requestedQuantity : req.body.requestedQuantity,
        status: "pendingForApproval",
        remarks: req.body.remarks,
        createdBy : req.userId,
        updatedBy : req.userId,
        createdAt : Date.now(),
        updatedAt : Date.now()
    }
}


