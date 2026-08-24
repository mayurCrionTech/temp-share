const apiResponseHandler = require('../../managers/common/apiResponseHandler_manager');
const workOrderRemarksManager = require("../../managers/internalManagers/maintenanceManagement/workOrderRemark_manager")




exports. createWorkOrderRemarks = async (req,res) => {
    try {
      const workOrderRemarksObj = createWorkOrderRemarksObject(req);
      const createdWorkOrderRemarks = await workOrderRemarksManager.createWorkOrderRemarks(workOrderRemarksObj);
      const responseObject = {
        id:createdWorkOrderRemarks._id
      }
      return apiResponseHandler.successResponse(res, "Remark added successfully",201, responseObject);
    }
    catch (error) {
      console.log(error);
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(error => error.message);
        const errorObject = {'Validation error':  errors.join(', ')}
        console.log('Validation error: ' + errors.join(', '));
        return apiResponseHandler.errorResponse(res,'Client side error' ,400, errorObject );
      } 
      return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
    }
  }


  exports.fetchWorkOrderRemarks = async (req,res) =>{
    try {
      const getWorkOrderRemarks = await workOrderRemarksManager.getRemarks(req.query,req.params.workOrder, req.businessUnit);
      const message = "WorkOrders Remarks Fetched Successfully";
		return apiResponseHandler.successResponse(res, message, 200, getWorkOrderRemarks);
	} catch (error) {
		console.log("error", error);
		console.log("Some error happened while fetching WorkorderRemarks", error.message);
		return apiResponseHandler.errorResponse(res, "Some internal server error", 500);
	}
  }












const createWorkOrderRemarksObject = (req) => {
    return {
  workOrderId: req.workOrder || null,
  remark: req.body.remark,
  businessUnit: req.businessUnit,
  createdBy: req.userId,
  updatedBy: req.userId,
  createdAt: Date.now(),
  updatedAt: Date.now()
};
}