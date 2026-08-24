const apiResponseHandler = require('../../managers/common/apiResponseHandler_manager');
const workOrderToolRequiredManager = require("../../managers/internalManagers/maintenanceManagement/workOrderToolRequired_manager")



exports. createWorkOrderToolRequired = async (req,res) => {
    try {
      const workOrderToolRequiredObj = workOrderToolRequiredObject(req);
      const createdworkOrderToolRequired = await workOrderToolRequiredManager.createWorkOrderToolRequired(workOrderToolRequiredObj);
      const responseObject ={
        id:createdworkOrderToolRequired._id
      }
      return apiResponseHandler.successResponse(res, "ToolRequired requested successfully",201, responseObject);
    }
    catch (error) {
      console.log(error); 
      return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
    }
  }








 
const workOrderToolRequiredObject = (req) => {
    const { toolsRequired } = req.body;
    toolsRequired.map(async (toolrequired) => {
        toolrequired.workOrder = req.workOrder
        toolrequired.name = toolrequired.name,
        toolrequired.quantity = toolrequired.quantity,
        toolrequired.businessUnit = req.businessUnit
        toolrequired.createdBy = req.userId,
        toolrequired.updatedBy = req.userId,
        toolrequired.createdAt = Date.now(),
        toolrequired.updatedAt = Date.now()
    })
    return toolsRequired
}


