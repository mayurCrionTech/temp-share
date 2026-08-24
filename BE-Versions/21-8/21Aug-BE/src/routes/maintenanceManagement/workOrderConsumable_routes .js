const express = require("express");
const workOrderPartsRequirementRouter = express.Router();
const {authJwtMiddleware,workOrderMiddleware} = require('../../middlewares/index')

workOrderPartsRequirementRouter.post('/:workOrder/partsReplaced', 
    [
        authJwtMiddleware.verifyToken,
        workOrderMiddleware.validateWorkOrder], 
        workOrderConsumableController.createWorkOrderConsumable)


module.exports = {workOrderPartsRequirementRouter}