const express = require("express");
const shiftRouter = express.Router({ mergeParams: true });
const shiftController = require("../../controllers/organizationManagement/shift_controller");
const { shiftMiddleware, businessUnitMiddleware } = require("../../middlewares");

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: API for managing shifts
 */

shiftRouter.post(
    "/",
    [businessUnitMiddleware.verifyBusinessUnit, shiftMiddleware.validateCreateShiftRequest],
    shiftController.createShift
);

shiftRouter.put(
    "/:shift",
    [shiftMiddleware.validateShift, shiftMiddleware.validateUpdateShiftRequest],
    shiftController.updateShift
);

shiftRouter.delete(
    "/",
    [shiftMiddleware.validateDeleteShiftsRequest],
    shiftController.bulkDeleteShifts
);

shiftRouter.get(
    "/",
    [ businessUnitMiddleware.verifyBusinessUnit],
    shiftController.fetchShifts
);

shiftRouter.get(
    "/:shift",
    [shiftMiddleware.validateShift,  businessUnitMiddleware.verifyBusinessUnit],
    shiftController.fetchShift
);
module.exports = { shiftRouter };
