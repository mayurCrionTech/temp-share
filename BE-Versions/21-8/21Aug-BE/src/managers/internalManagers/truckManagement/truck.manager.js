const truckDbManager = require("../../dBManagers/truckManagement.dbManager");

const createTruckData = async (body) => {
  const { date, truckCount } = body;

  if (!date || truckCount === undefined) {
    throw new Error("Date and truckCount are required");
  }

  return await truckDbManager.createTruckEntry({ date, truckCount });
};

const getMonthlyTruckData = async (year, month) => {
  //  Normalize start date
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  //  Normalize end date
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const records = await truckDbManager.getTruckDataByMonth(startDate, endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  const daysInMonth = endDate.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    currentDate.setHours(0, 0, 0, 0);

    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");

    const isoDate = `${y}-${m}-${d}`;

    const existing = records.find((r) => {
      const recordDate = new Date(r.date);

      const ry = recordDate.getFullYear();
      const rm = String(recordDate.getMonth() + 1).padStart(2, "0");
      const rd = String(recordDate.getDate()).padStart(2, "0");

      return `${ry}-${rm}-${rd}` === isoDate;
    });

    result.push({
      date: isoDate,
      truckCount: existing ? existing.truckCount : 117,
      // editable: currentDate >= today,
    });
  }

  return result;
};

const getTruckDataBySingleDate = async (date) => {
  //  NEW FUNCTION TO GET DATA BY SINGLE DATE

  if (!date) {
    throw new Error("Date is required");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const record = await truckDbManager.getTruckByDate(startOfDay, endOfDay);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let finalCount = record ? record.truckCount : 117;

  return {
    date,
    targetCount: finalCount,
    // editable: startOfDay >= today
  };
};

const updateTruckData = async (body) => {
  if (!Array.isArray(body)) {
    throw new Error("Payload must be an array");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const operations = [];

  for (const item of body) {
    const { date, truckCount } = item;

    if (!date) continue;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (startOfDay < today) continue;

    let finalCount = Number(truckCount);
    if (!finalCount || finalCount <= 0) {
      finalCount = 117;
    }

    operations.push({
      updateOne: {
        filter: {
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
        update: { $set: { truckCount: finalCount, date: startOfDay } },
        upsert: true,
      },
    });
  }

  if (operations.length === 0) return [];

  return await truckDbManager.bulkUpdateTrucks(operations);
};

module.exports = {
  createTruckData,
  getMonthlyTruckData,
  updateTruckData,
  getTruckDataBySingleDate, //get data by date
};
