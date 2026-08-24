const express = require("express");
const workOrderPartsRequirementRouter = express.Router();
const {authJwtMiddleware,workOrderMiddleware, workOrderPartsMiddleware, businessUnitMiddleware, spareMiddleware,fileMiddleware} = require('../../middlewares/index')
const workOrderPartsRequiredController = require('../../controllers/maintenanceManagement/workOrderPartRequired_controller');
const workOrderPartsReplacedController = require('../../controllers/maintenanceManagement/workOrderPartReplaced_controller');
const workOrderConsumableController = require('../../controllers/maintenanceManagement/workOrderConsumable_controller');
const workOrderToolsRequiredController = require('../../controllers/maintenanceManagement/workOrderToolRequired_controller')


workOrderPartsRequirementRouter.post('/:workOrder/spareRequested', 
    [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
        spareMiddleware.verifySpare,
        workOrderPartsMiddleware.validateSpareQuantityForRequest,
    ],
        workOrderPartsRequiredController.createWorkOrderPartRequired)


workOrderPartsRequirementRouter.get("/:workOrder/spareRequested",
    [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
    ],
    workOrderPartsRequiredController.fetchWorkOrderPartRequired
);


workOrderPartsRequirementRouter.post('/:workOrder/spareReplaced', 
    [
        authJwtMiddleware.verifyToken,
        fileMiddleware.uploadMultiple,
		fileMiddleware.validateMultipleFileExtensionAndSizeIfPresent,
		fileMiddleware.validateFileUpload,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
        spareMiddleware.verifySpare,
        workOrderPartsMiddleware.verifySpareRequired,
        workOrderPartsMiddleware.validateReplacedQuantityAndSpare,
        
        // workOrderPartsMiddleware.validatePartsReplacedBody
    ], 
        workOrderPartsReplacedController.createWorkOrderPartReplaced)


workOrderPartsRequirementRouter.get("/:workOrder/spareReplaced",
    [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
    ],
    workOrderPartsReplacedController.fetchWorkOrderPartsReplaced
);

workOrderPartsRequirementRouter.post("/:workOrder/spareReplaced/:spareReplacedId/images",
    [
        authJwtMiddleware.verifyToken,
        workOrderMiddleware.validateWorkOrder,
        workOrderPartsMiddleware.verifySpareReplaced,
        fileMiddleware.uploadMultiple,
		fileMiddleware.validateMultipleFileExtensionAndSize,
		fileMiddleware.validateFileUpload
    ],
    workOrderPartsReplacedController.addImages
);

workOrderPartsRequirementRouter.get("/:workOrder/spareReplaced/:spareReplacedId/images",
    [
        authJwtMiddleware.verifyToken,
        workOrderMiddleware.validateWorkOrder,
        workOrderPartsMiddleware.verifySpareReplaced,
    ],
    workOrderPartsReplacedController.getImages
)


workOrderPartsRequirementRouter.post('/:workOrder/consumables', 
    [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
        workOrderPartsMiddleware.validateConsumablesBody], 
        workOrderConsumableController.createWorkOrderConsumable)


workOrderPartsRequirementRouter.post('/:workOrder/toolsRequired', 
    [
        authJwtMiddleware.verifyToken,
        businessUnitMiddleware.verifyBusinessUnit,
        workOrderMiddleware.validateWorkOrder,
        workOrderPartsMiddleware.validateToolsRequiredBody], 
        workOrderToolsRequiredController.createWorkOrderToolRequired)


module.exports = {workOrderPartsRequirementRouter}