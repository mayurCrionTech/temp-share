const apiResponseHandler = require('../../managers/common/apiResponseHandler_manager');
const workOrderDueDateManager = require("../../managers/internalManagers/maintenanceManagement/workOrderDueDateRequest_manager")
const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager");



exports.createWorkOrderDueDateRequest = async (req, res) => {
  try {
    const workOrderDueDateObj = createWorkOrderDueDatesObject(req);
    const createdWorkOrderDueDate = await workOrderDueDateManager.createWorkOrderDueDateRequest(workOrderDueDateObj);
    const responseObject = {
      id: createdWorkOrderDueDate._id
    }
    return apiResponseHandler.successResponse(res, "DueDate requested successfully", 201, responseObject);
  }
  catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(error => error.message);
      const errorObject = { 'Validation error': errors.join(', ') }
      console.log('Validation error: ' + errors.join(', '));
      return apiResponseHandler.errorResponse(error, req, res, 'Client side error', 400, errorObject);
    }
    return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
  }
}

exports.approveRequestExtension = async (req, res) => {
  try{
    const workOrderDueDateObj = updateWorkOrderDueDatesObject(req);
    const createdWorkOrderDueDate = await workOrderDueDateManager.updateWorkOrderDueDateRequest(workOrderDueDateObj);
    await workOrderManager.updateStatusAfterDueDateApproval(req.workOrderObj._id, req.workOrderObj.lastStatus, workOrderDueDateObj.requestedDate)
    return apiResponseHandler.successResponse(res, "DueDate approved successfully", 200, null);
  }catch(error){
    return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
  }
};

exports.fetchRequests = async (req, res) => {
  try{
    const dueDateRequestData = await workOrderDueDateManager.fetchDueDateRequests(req.query, req.workOrder, req.businessUnit);
    return apiResponseHandler.successResponse(res, "DueDateRequest fetched successfully", 200, dueDateRequestData);
  }catch(error){
    console.log("error",error)
    return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);

  }
};

const createWorkOrderDueDatesObject = (req) => {
  return {
    workOrderId: req.workOrder || null,
    reason: req.body.reason,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
    requestedDate: req.body.requestedDate
  };
}

const updateWorkOrderDueDatesObject = (req) => {
  return {
    workOrderId: req.workOrder,
    reason: req.body.reason ?? req.dueDateRequestObj.reason,
    id: req.dueDateRequest,
    requestedDate: req.body.requestedDate ?? req.dueDateRequestObj.requestedDate,
    updatedBy: req.userId,
    approvedBy: req.userId,
    updatedAt : new Date(),
    approvedDate: new Date()
  }
}
