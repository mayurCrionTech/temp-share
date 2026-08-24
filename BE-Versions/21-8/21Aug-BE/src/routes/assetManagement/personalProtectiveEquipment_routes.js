const express = require("express");
const personalProtectiveEquipmentRouter = express.Router({ mergeParams: true });
const personalProtectiveEquipmentController = require("../../controllers/assetManagement/personalProtectiveEquipment_controller");
const {
    personalProtectiveEquipmentMiddleware,
    assetMiddleware,
    timeStampMiddleware,
} = require("../../middlewares");

/**
 * @swagger
 * tags:
 *   name: Personal Protective Equipment
 *   description: API for managing personal protective equilment
 */


personalProtectiveEquipmentRouter.post(
    "/",
    [
        personalProtectiveEquipmentMiddleware.validateCreatePersonalProtectiveEquipmentRequest
    ],
    personalProtectiveEquipmentController.createPersonalProtectiveEquipment
);

personalProtectiveEquipmentRouter.put(
    "/:personalProtectiveEquipment",
    [personalProtectiveEquipmentMiddleware.validateUpdatePersonalProtectiveEquipmentRequest],
    personalProtectiveEquipmentController.updatePersonalProtectiveEquipment
);


personalProtectiveEquipmentRouter.delete(
    "/",
    [personalProtectiveEquipmentMiddleware.validateDeletePersonalProtectiveEquipmentsRequest],
    personalProtectiveEquipmentController.bulkDeletePersonalProtectiveEquipments
);


personalProtectiveEquipmentRouter.get(
    "/",
    // [personalProtectiveEquipmentMiddleware.validateFetchAllRequest],
    personalProtectiveEquipmentController.fetchPersonalProtectiveEquipments
);

personalProtectiveEquipmentRouter.get(
    "/:personalProtectiveEquipment",
    [personalProtectiveEquipmentMiddleware.validatePersonalProtectiveEquipment],
    personalProtectiveEquipmentController.fetchPersonalProtectiveEquipment
);




module.exports = { personalProtectiveEquipmentRouter };