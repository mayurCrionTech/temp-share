const express = require("express");
const spareRouter = express.Router();
const spareStockController = require("../../controllers/spareManagement/spareStock_controller");
const spareController = require("../../controllers/spareManagement/spare_controller");
const spareMiddleware = require("../../middlewares/spareManagement/spare_middleware");
const { workOrderPartsMiddleware, workOrderMiddleware } = require("../../middlewares");

spareRouter.post(
  "/",
  [
    spareMiddleware.validateCreateSpareRequest,
    spareMiddleware.verifyDuplicates,
    spareMiddleware.validateSpareImages,
    
  ],
  spareController.createSpares
);

spareRouter.patch(
  "/:spareId",
  [
    spareMiddleware.verifySpare,
    spareMiddleware.validateUpdateSpareRequest,
    spareMiddleware.verifyDuplicates,
    spareMiddleware.validateSpareImages,

  ],
  spareController.updateSpares
);

spareRouter.get(
  "/",
  [spareMiddleware.validateStatus],
  spareController.fetchSpares
);

spareRouter.delete(
  "/",
  [spareMiddleware.verifySpares],
  spareController.deleteSpares
);

spareRouter.get("/count", spareController.countStatus);

spareRouter.get(
  "/quantities",
  // [

  // ],
  spareStockController.fetchSpareStockss
);

spareRouter.get("/spareRequested", spareController.fetchSpareRequired);

spareRouter.get("/spareReplaced", spareController.fetchSpareReplaced);


spareRouter.get(
  "/:spareId",
  [spareMiddleware.verifySpare],
  spareController.fetchSpare
);

spareRouter.patch(
  "/:spareId/approve",
  [
    spareMiddleware.verifySpare,
    spareMiddleware.validateStatusForApprovalAndReject,
  ],
  spareController.approveSpare
);

spareRouter.patch(
  "/quantities/:quantityId/approve",
  [
    spareMiddleware.verifyQuantity,
    spareMiddleware.validateStatusForApprovalAndRejectQuantities,
  ],
  spareStockController.approveSpareQuantity
);

spareRouter.patch(
  "/quantities/:quantityId/reject",
  [
    spareMiddleware.verifyQuantity,
    spareMiddleware.validateStatusForApprovalAndRejectQuantities,
  ],
  spareStockController.reviseSpareQuantity
);

spareRouter.patch(
  "/:spareId/reject",
  [
    spareMiddleware.verifySpare,
    spareMiddleware.validateStatusForApprovalAndReject,
  ],
  spareController.reviseSpare
);

spareRouter.post(
  "/quantities",
  [spareMiddleware.verifySpare, spareMiddleware.verifyAddQuantityRequest],
  spareStockController.addSpareQuantity
);

spareRouter.patch(
  "/quantities/:quantityId",
  [
    spareMiddleware.verifyQuantity,
    spareMiddleware.verifySpare,
    spareMiddleware.verifyUpdateQuantityRequest,
  ],
  spareStockController.updateQuantity
);

spareRouter.patch(
  "/spareRequested/:spareRequestedId/approve",
  [
    workOrderPartsMiddleware.verifySpareRequired,
    workOrderPartsMiddleware.validateStatusForApprovalAndRejectSpareRequired,
    workOrderPartsMiddleware.validateSpareQuamtityForRequestApproval,
  ],
  spareController.approveSpareRequired
);

spareRouter.patch(
  "/spareRequested/:spareRequestedId/reject",
  [
    workOrderPartsMiddleware.verifySpareRequired,
    workOrderPartsMiddleware.validateStatusForApprovalAndRejectSpareRequired,
  ],
  spareController.rejectSpareRequired
);

spareRouter.patch("/spareReplaced/:spareReplacedId", [
    workOrderPartsMiddleware.verifySpareReplaced,
    spareMiddleware.verifySpare,
    workOrderPartsMiddleware.verifySpareRequired,
    workOrderMiddleware.validateWorkOrder
],
  spareController.editWorkOrderPartsReplaced
);

spareRouter.patch("/spareReplaced/:spareReplacedId/return",[
    workOrderPartsMiddleware.verifySpareReplaced,
    workOrderPartsMiddleware.validateReturnQuantity,
], 
spareController.returnSpareReplacedQuantity)

module.exports = { spareRouter };
