const express = require("express");
const workOrderDueDateRouter = express.Router();
const {workOrderMiddleware,authJwtMiddleware, businessUnitMiddleware} = require('../../middlewares/index')
const workOrderDueDateController = require('../../controllers/maintenanceManagement/workOrderDueDateRequest_controller');

workOrderDueDateRouter.post('/:workOrder/requestExtension', [
    authJwtMiddleware.verifyToken,
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.validateworkOrderDueDateExtension,
    workOrderMiddleware.validateDateInput,
], workOrderDueDateController.createWorkOrderDueDateRequest)


workOrderDueDateRouter.patch('/:workOrder/approveExtension',[
    authJwtMiddleware.verifyToken,
    workOrderMiddleware.validateWorkOrder,
    workOrderMiddleware.validateWorkOrderDueDate
 ], workOrderDueDateController.approveRequestExtension)

 workOrderDueDateRouter.get('/:workOrder/requestExtension', [
    authJwtMiddleware.verifyToken,
    businessUnitMiddleware.verifyBusinessUnit,
    workOrderMiddleware.validateWorkOrder,
], workOrderDueDateController.fetchRequests)


module.exports = {workOrderDueDateRouter}