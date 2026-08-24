const express = require("express");
const truckRouter = express.Router();

const {
  getMonthlyTrucks,
  updateTruck,
  getTruckByDate,
} = require("../../controllers/truckManagement/truck.controller");

// Get monthly truck data (Query based)
truckRouter.get("/", getMonthlyTrucks);

// Get single date truck data (Path param)
truckRouter.get("/:date", getTruckByDate);

// Bulk update truck data
truckRouter.put("/", updateTruck);

module.exports = { truckRouter };
