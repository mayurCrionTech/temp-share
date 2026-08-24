// 27-feb-2026 : New function to get truck data by single date (using date range for safety)

const TruckModel = require("../../models/mongoDB/truckManagement/truck.model");

const createTruckEntry = async (payload) => {
  return await TruckModel.create(payload);
};

const getTruckDataByMonth = async (startDate, endDate) => {
  return await TruckModel.find({
    date: { $gte: startDate, $lte: endDate },
  });
};

const updateTruckEntry = async (date, truckCount) => {
  return await TruckModel.findOneAndUpdate(
    { date },
    { truckCount },
    { new: true, upsert: true },
  );
};

const bulkUpdateTrucks = async (operations) => {
  return await TruckModel.bulkWrite(operations);
};

// 27-feb-2026 : New function to get truck data by single date (using date range for safety)
// start
const getTruckByDate = async (startOfDay, endOfDay) => {
  // NEW FUNCTION TO GET DATA BY SINGLE DATE
  return await TruckModel.findOne({
    date: { $gte: startOfDay, $lte: endOfDay },
  });
};
// end

module.exports = {
  createTruckEntry,
  getTruckDataByMonth,
  updateTruckEntry,
  bulkUpdateTrucks,
  getTruckByDate, // new function to get data by single date
};
