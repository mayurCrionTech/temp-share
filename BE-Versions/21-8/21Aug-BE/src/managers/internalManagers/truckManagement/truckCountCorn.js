const TruckCount = require("../../../models/mongoDB/truckManagement/truck.model");

/**
 * Ensure one truck_count entry per day (6AM IST cron)
 * Safe version using date range
 */
async function ensureDailyTruckCount() {
  try {
    const todayUTC = new Date();

    // Set to UTC midnight
    todayUTC.setUTCHours(0, 0, 0, 0);

    const existing = await TruckCount.findOne({ date: todayUTC });

    if (existing) {
      // console.log("Truck count already exists. Skipping.");
      return;
    }

    await TruckCount.create({
      date: todayUTC,
      truckCount: 117,
    });

    // console.log("Truck count inserted.");
  } catch (err) {
    console.error("Error ensuring daily truck count:", err.message);
  }
}

module.exports = { ensureDailyTruckCount };