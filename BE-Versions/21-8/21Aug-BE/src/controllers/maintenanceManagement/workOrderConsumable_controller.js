const apiResponseHandler = require('../../managers/common/apiResponseHandler_manager');
const workOrderConsumableManager = require("../../managers/internalManagers/maintenanceManagement/workOrderConsumable_manager")



exports. createWorkOrderConsumable = async (req,res) => {
    try {
      const workOrderConsumableObj = workOrderConsumableObject(req);
      const createdworkOrderConsumable = await workOrderConsumableManager.createWorkOrderConsumable(workOrderConsumableObj);
      const responseObject ={
        id:createdworkOrderConsumable._id
      }
      return apiResponseHandler.successResponse(res, "Consumable requested successfully",201, responseObject);
    }
    catch (error) {
      console.log(error); 
      return apiResponseHandler.errorResponse(res, "Some internal server error", 500, null);
    }
  }








 
const workOrderConsumableObject = (req) => {
    const { consumables } = req.body;
    consumables.map(async (consumable) => {
        consumable.workOrder = req.workOrder
        consumable.name = consumable.name,
        consumable.quantity = consumable.quantity,
        consumable.businessUnit = req.businessUnit
        consumable.createdBy = req.userId,
        consumable.updatedBy = req.userId,
        consumable.createdAt = Date.now(),
        consumable.updatedAt = Date.now()
    })
    return consumables
}


